"""
FANZLAB 2.0 - System Integration & Health Check
Ensures all services are properly connected and operational
"""

import asyncio
import aiohttp
import asyncpg
import json
import os
from datetime import datetime
from typing import Dict, List, Any

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

class SystemIntegration:
    """Comprehensive system integration and health monitoring"""
    
    def __init__(self):
        self.services = {
            "main_app": {"url": "http://localhost:5000", "critical": True},
            "api_gateway": {"url": "http://localhost:8080/graphql", "critical": True},
            "user_service": {"url": "http://localhost:8001/api/v1/health", "critical": True},
            "payment_service": {"url": "http://localhost:8003/api/payments/health", "critical": True},
            "messaging_service": {"url": "http://localhost:8004/api/messages/health", "critical": False},
            "streaming_service": {"url": "http://localhost:8005", "critical": False},
            "ai_service": {"url": "http://localhost:8006", "critical": False},
            "sso_service": {"url": "http://localhost:8011", "critical": False},
            "payment_orchestration": {"url": "http://localhost:8016", "critical": True},
            "recommendation_service": {"url": "http://localhost:8017", "critical": False},
        }
        
        self.health_status = {}
        self.db_pool = None
        
    async def init_db(self):
        """Initialize database connection"""
        self.db_pool = await asyncpg.create_pool(DATABASE_URL)
        
    async def check_service_health(self, name: str, config: Dict) -> Dict:
        """Check individual service health"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(config["url"], timeout=3) as response:
                    status = response.status == 200
                    return {
                        "service": name,
                        "url": config["url"],
                        "status": "healthy" if status else "unhealthy",
                        "critical": config["critical"],
                        "response_code": response.status
                    }
        except Exception as e:
            return {
                "service": name,
                "url": config["url"],
                "status": "down",
                "critical": config["critical"],
                "error": str(e)[:100]
            }
    
    async def check_database_health(self) -> Dict:
        """Check database connectivity and essential tables"""
        try:
            async with self.db_pool.acquire() as conn:
                # Check essential tables
                tables = await conn.fetch("""
                    SELECT tablename, 
                           pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as size,
                           (SELECT COUNT(*) FROM pg_tables WHERE tablename = t.tablename) as exists
                    FROM pg_tables t
                    WHERE schemaname = 'public' 
                    AND tablename IN ('users', 'content', 'payments', 'messages', 
                                    'platform_fees', 'payment_processors_config')
                """)
                
                # Check row counts for key tables
                user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
                
                return {
                    "status": "healthy",
                    "tables": len(tables),
                    "user_count": user_count,
                    "connection": "active"
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)[:100]
            }
    
    async def ensure_default_data(self):
        """Ensure critical default data exists"""
        async with self.db_pool.acquire() as conn:
            # Ensure admin user exists
            admin_exists = await conn.fetchval("""
                SELECT EXISTS(SELECT 1 FROM users WHERE role = 'admin')
            """)
            
            if not admin_exists:
                # Use environment variable for admin password hash
                admin_password_hash = os.getenv('ADMIN_PASSWORD_HASH', 'CHANGEME_HASH')
                await conn.execute("""
                    INSERT INTO users (id, username, email, password_hash, role, created_at)
                    VALUES (gen_random_uuid(), 'admin', 'admin@fanzlab.com', 
                            $1, 'admin', now())
                    ON CONFLICT (email) DO NOTHING
                """, admin_password_hash)
                print("✅ Created default admin user")
            
            # Ensure payment processors are configured
            processor_count = await conn.fetchval("""
                SELECT COUNT(*) FROM payment_processors_config
            """)
            
            if processor_count == 0:
                await conn.execute("""
                    INSERT INTO payment_processors_config (processor_name, processor_type, region, enabled)
                    VALUES 
                    ('ccbill', 'both', 'global', true),
                    ('segpay', 'both', 'global', true),
                    ('paxum', 'creator_payout', 'global', true)
                    ON CONFLICT (processor_name) DO NOTHING
                """)
                print("✅ Configured default payment processors")
            
            # Ensure platform fees exist
            fee_count = await conn.fetchval("""
                SELECT COUNT(*) FROM platform_fees WHERE active = true
            """)
            
            if fee_count == 0:
                await conn.execute("""
                    INSERT INTO platform_fees (category, fee_type, fee_value, active)
                    VALUES 
                    ('subscription', 'percent', 5.0, true),
                    ('tip', 'flat', 0.50, true),
                    ('message', 'flat', 1.00, true)
                    ON CONFLICT (category, processor, region) DO NOTHING
                """)
                print("✅ Configured default platform fees")
    
    async def run_full_health_check(self) -> Dict:
        """Run complete system health check"""
        await self.init_db()
        
        # Check all services
        service_checks = []
        for name, config in self.services.items():
            result = await self.check_service_health(name, config)
            service_checks.append(result)
        
        # Check database
        db_health = await self.check_database_health()
        
        # Ensure default data
        await self.ensure_default_data()
        
        # Calculate overall health
        critical_services_up = all(
            s["status"] in ["healthy", "down"] and not (s["critical"] and s["status"] == "down")
            for s in service_checks
        )
        
        healthy_services = sum(1 for s in service_checks if s["status"] == "healthy")
        total_services = len(service_checks)
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "operational" if critical_services_up else "degraded",
            "services": {
                "healthy": healthy_services,
                "total": total_services,
                "percentage": round(healthy_services / total_services * 100, 2),
                "details": service_checks
            },
            "database": db_health,
            "recommendations": self.generate_recommendations(service_checks, db_health)
        }
    
    def generate_recommendations(self, service_checks: List[Dict], db_health: Dict) -> List[str]:
        """Generate system recommendations"""
        recommendations = []
        
        # Check for down services
        down_services = [s for s in service_checks if s["status"] == "down"]
        if down_services:
            for service in down_services:
                if service["critical"]:
                    recommendations.append(f"🚨 CRITICAL: {service['service']} is down - system functionality impaired")
                else:
                    recommendations.append(f"⚠️ Warning: {service['service']} is down - some features unavailable")
        
        # Database recommendations
        if db_health["status"] != "healthy":
            recommendations.append("🚨 Database connection issues detected - check DATABASE_URL")
        
        # Performance recommendations
        healthy_count = sum(1 for s in service_checks if s["status"] == "healthy")
        if healthy_count == len(service_checks):
            recommendations.append("✅ All services operational - system ready for production")
        
        return recommendations if recommendations else ["✅ System operating normally"]

async def main():
    """Run system integration check"""
    integration = SystemIntegration()
    print("\n" + "="*60)
    print("FANZLAB 2.0 - System Integration Health Check")
    print("="*60 + "\n")
    
    result = await integration.run_full_health_check()
    
    # Display results
    print(f"Overall Status: {result['overall_status'].upper()}")
    print(f"Services: {result['services']['healthy']}/{result['services']['total']} healthy ({result['services']['percentage']}%)")
    print(f"Database: {result['database']['status'].upper()}")
    
    print("\n📊 Service Status:")
    for service in result['services']['details']:
        icon = "✅" if service['status'] == "healthy" else "❌"
        critical_tag = " [CRITICAL]" if service['critical'] else ""
        print(f"  {icon} {service['service']}: {service['status']}{critical_tag}")
    
    print("\n💡 Recommendations:")
    for rec in result['recommendations']:
        print(f"  {rec}")
    
    print("\n" + "="*60)
    
    # Return status code
    return 0 if result['overall_status'] == "operational" else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)