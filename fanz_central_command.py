"""
FanzDash Central Command - Enhanced with TaskSpark 3 Enterprise Capabilities
Complete control center for all FANZ platforms, clusters, and operations
"""

import asyncio
import asyncpg
import aiohttp
from datetime import datetime
from typing import Dict, List, Any, Optional
import json
import logging
from dataclasses import dataclass

# Import TaskSpark 3 components
from system_integration import SystemIntegration
from admin_service import *

@dataclass
class FanzPlatform:
    """FANZ Platform Configuration"""
    platform_id: str
    name: str
    url: str
    status: str = "unknown"
    last_health_check: Optional[datetime] = None
    critical: bool = True

class FanzCentralCommand:
    """
    FanzDash Central Command - Master control for entire FANZ ecosystem
    Integrates TaskSpark 3's enterprise features with existing FanzDash
    """
    
    def __init__(self):
        self.platforms = {
            "fanzdash": FanzPlatform("fanzdash", "FanzDash Control", "http://localhost:3000", critical=True),
            "fanzfinance": FanzPlatform("fanzfinance", "FanzFinance OS", "http://localhost:8010", critical=True),
            "fanzelitetube": FanzPlatform("fanzelitetube", "FanzEliteTubeV1", "http://localhost:8001", critical=True),
            "fanzmeet": FanzPlatform("fanzmeet", "FanzMeetV1", "http://localhost:8002", critical=True),
            "fanzcommerce": FanzPlatform("fanzcommerce", "FanzCommerceV1", "http://localhost:8003", critical=True),
            "fanzhubvault": FanzPlatform("fanzhubvault", "FanzHubVaultV1", "http://localhost:8004", critical=True),
            "fanzprotect": FanzPlatform("fanzprotect", "FanzProtect", "http://localhost:8005", critical=True),
            "fanzsocial": FanzPlatform("fanzsocial", "FanzSocial", "http://localhost:8006", critical=False),
        }
        
        # Initialize TaskSpark 3 System Integration
        self.system_integration = SystemIntegration()
        
        # Payment processors (no Stripe/PayPal per rules)
        self.payment_processors = {
            "ccbill": {"enabled": True, "primary": True},
            "paxum": {"enabled": True, "primary": False},
            "segpay": {"enabled": True, "primary": False},
            "crypto_usdc": {"enabled": True, "primary": False},
        }
        
        # Control flags
        self.feature_flags = {}
        self.emergency_stops = {}
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    async def initialize_command_center(self):
        """Initialize the central command center"""
        self.logger.info("🚀 Initializing FanzDash Central Command Center")
        
        # Initialize database connections
        await self.system_integration.init_db()
        
        # Run comprehensive health check
        health_report = await self.run_ecosystem_health_check()
        
        # Initialize monitoring
        await self.setup_monitoring()
        
        # Setup audit logging
        await self.initialize_audit_system()
        
        self.logger.info("✅ FanzDash Central Command Center Online")
        return health_report

    async def run_ecosystem_health_check(self) -> Dict:
        """Comprehensive health check across all FANZ platforms"""
        self.logger.info("🔍 Running ecosystem-wide health check")
        
        platform_health = {}
        critical_issues = []
        
        for platform_id, platform in self.platforms.items():
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{platform.url}/health", timeout=5) as response:
                        if response.status == 200:
                            platform.status = "healthy"
                            platform.last_health_check = datetime.utcnow()
                        else:
                            platform.status = "degraded"
                            if platform.critical:
                                critical_issues.append(f"{platform.name} is degraded")
            except Exception as e:
                platform.status = "down"
                if platform.critical:
                    critical_issues.append(f"{platform.name} is down: {str(e)}")
            
            platform_health[platform_id] = {
                "name": platform.name,
                "status": platform.status,
                "critical": platform.critical,
                "last_check": platform.last_health_check.isoformat() if platform.last_health_check else None
            }

        # Check TaskSpark 3 services health
        ts3_health = await self.system_integration.run_full_health_check()
        
        ecosystem_status = "healthy" if not critical_issues else "critical"
        
        health_report = {
            "timestamp": datetime.utcnow().isoformat(),
            "ecosystem_status": ecosystem_status,
            "platforms": platform_health,
            "taskspark3_services": ts3_health,
            "critical_issues": critical_issues,
            "payment_processors": self.payment_processors
        }
        
        await self.log_audit_action("SYSTEM", "health_check_completed", metadata=health_report)
        return health_report

    async def setup_monitoring(self):
        """Setup real-time monitoring and alerting"""
        self.logger.info("📊 Setting up ecosystem monitoring")
        
        # Monitor all platforms every 30 seconds
        asyncio.create_task(self.continuous_health_monitoring())
        
        # Monitor payment systems
        asyncio.create_task(self.payment_system_monitoring())
        
        # Monitor content moderation queues
        asyncio.create_task(self.content_moderation_monitoring())

    async def continuous_health_monitoring(self):
        """Continuous health monitoring of all platforms"""
        while True:
            try:
                health_report = await self.run_ecosystem_health_check()
                
                # Alert on critical issues
                if health_report["critical_issues"]:
                    await self.trigger_critical_alert(health_report["critical_issues"])
                
            except Exception as e:
                self.logger.error(f"Health monitoring error: {e}")
            
            await asyncio.sleep(30)  # Check every 30 seconds

    async def payment_system_monitoring(self):
        """Monitor payment systems and FanzFinance OS"""
        while True:
            try:
                # Check payment processor status
                for processor, config in self.payment_processors.items():
                    if config["enabled"]:
                        # Health check payment processor
                        processor_health = await self.check_payment_processor_health(processor)
                        if not processor_health["healthy"]:
                            await self.log_audit_action("PAYMENT_SYSTEM", f"processor_{processor}_issue", 
                                                      metadata=processor_health)
                
                # Check FanzFinance OS
                await self.check_fanzfinance_health()
                
            except Exception as e:
                self.logger.error(f"Payment monitoring error: {e}")
            
            await asyncio.sleep(60)  # Check every minute

    async def content_moderation_monitoring(self):
        """Monitor content moderation queues and FanzProtect"""
        while True:
            try:
                # Check moderation queue lengths
                queue_stats = await self.get_moderation_queue_stats()
                
                # Alert if queue is backing up
                if queue_stats["pending_reviews"] > 100:
                    await self.trigger_moderation_alert(queue_stats)
                
                # Check FanzProtect AI service
                await self.check_fanzprotect_health()
                
            except Exception as e:
                self.logger.error(f"Content moderation monitoring error: {e}")
            
            await asyncio.sleep(120)  # Check every 2 minutes

    async def trigger_critical_alert(self, issues: List[str]):
        """Trigger critical system alerts"""
        alert_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "alert_type": "CRITICAL_SYSTEM",
            "issues": issues,
            "ecosystem_status": "degraded"
        }
        
        self.logger.critical(f"🚨 CRITICAL ALERT: {issues}")
        await self.log_audit_action("ALERT_SYSTEM", "critical_alert_triggered", metadata=alert_data)

    async def check_payment_processor_health(self, processor: str) -> Dict:
        """Check individual payment processor health"""
        # Implementation would check processor-specific health endpoints
        return {"processor": processor, "healthy": True, "response_time": 150}

    async def check_fanzfinance_health(self):
        """Check FanzFinance OS health and balances"""
        # Implementation would check FanzFinance OS endpoints
        pass

    async def get_moderation_queue_stats(self) -> Dict:
        """Get current moderation queue statistics"""
        # Implementation would query moderation queue
        return {"pending_reviews": 45, "processed_today": 234, "average_review_time": 3.2}

    async def check_fanzprotect_health(self):
        """Check FanzProtect AI service health"""
        # Implementation would check FanzProtect endpoints
        pass

    async def trigger_moderation_alert(self, queue_stats: Dict):
        """Trigger moderation queue backup alert"""
        alert_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "alert_type": "MODERATION_BACKUP",
            "queue_stats": queue_stats
        }
        
        self.logger.warning(f"⚠️ MODERATION ALERT: Queue backing up - {queue_stats}")
        await self.log_audit_action("MODERATION_SYSTEM", "queue_backup_alert", metadata=alert_data)

    async def initialize_audit_system(self):
        """Initialize comprehensive audit logging"""
        self.logger.info("📋 Initializing audit system")
        await self.log_audit_action("SYSTEM", "central_command_initialized")

    async def log_audit_action(self, actor_id: str, action: str, target_type: str = None, 
                              target_id: str = None, metadata: dict = None):
        """Enhanced audit logging with TaskSpark 3 integration"""
        try:
            conn = await asyncpg.connect("postgresql://localhost:5432/fanzdash")
            await conn.execute("""
                INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at)
                VALUES ($1, $2, $3, $4, $5::jsonb, $6)
            """, actor_id, action, target_type, target_id, json.dumps(metadata or {}), datetime.utcnow())
            await conn.close()
        except Exception as e:
            self.logger.error(f"Audit logging failed: {e}")

    # Control Functions
    async def emergency_stop_platform(self, platform_id: str, reason: str):
        """Emergency stop for any FANZ platform"""
        if platform_id not in self.platforms:
            raise ValueError(f"Unknown platform: {platform_id}")
        
        self.emergency_stops[platform_id] = {
            "stopped_at": datetime.utcnow(),
            "reason": reason,
            "stopped_by": "FANZDASH_CENTRAL"
        }
        
        await self.log_audit_action("FANZDASH_CENTRAL", "emergency_stop", 
                                  target_type="platform", target_id=platform_id,
                                  metadata={"reason": reason})
        
        self.logger.critical(f"🛑 EMERGENCY STOP: {self.platforms[platform_id].name} - {reason}")

    async def set_feature_flag(self, platform_id: str, feature: str, enabled: bool, reason: str = ""):
        """Control feature flags across platforms"""
        flag_key = f"{platform_id}:{feature}"
        self.feature_flags[flag_key] = {
            "enabled": enabled,
            "set_at": datetime.utcnow(),
            "reason": reason
        }
        
        await self.log_audit_action("FANZDASH_CENTRAL", "feature_flag_changed",
                                  target_type="feature", target_id=flag_key,
                                  metadata={"enabled": enabled, "reason": reason})

    async def get_ecosystem_dashboard_data(self) -> Dict:
        """Get comprehensive dashboard data for FanzDash UI"""
        health_report = await self.run_ecosystem_health_check()
        
        dashboard_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "ecosystem_health": health_report,
            "feature_flags": self.feature_flags,
            "emergency_stops": self.emergency_stops,
            "payment_processors": self.payment_processors,
            "recent_audit_logs": await self.get_recent_audit_logs()
        }
        
        return dashboard_data

    async def get_recent_audit_logs(self, limit: int = 50) -> List[Dict]:
        """Get recent audit log entries"""
        try:
            conn = await asyncpg.connect("postgresql://localhost:5432/fanzdash")
            logs = await conn.fetch("""
                SELECT actor_id, action, target_type, target_id, metadata, created_at
                FROM audit_logs 
                ORDER BY created_at DESC 
                LIMIT $1
            """, limit)
            await conn.close()
            
            return [dict(log) for log in logs]
        except Exception as e:
            self.logger.error(f"Failed to fetch audit logs: {e}")
            return []

# Initialize global command center instance
fanz_central_command = FanzCentralCommand()