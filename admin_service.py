from sqlalchemy.orm import Session
from database.models import (
    User, Content, Payment, Message, AdminLog,
    IllegalContentVault, UserWarning, UserStrike, ModerationQueue,
    StreamModerationLog, PlatformTheme, AuditLog, AdminSetting
)
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException

class AdminService:
    def __init__(self):
        pass
    
    async def get_all_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users for admin panel"""
        return db.query(User).offset(skip).limit(limit).all()
    
    async def get_user_details(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Get detailed user information"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        # Get user statistics
        content_count = db.query(Content).filter(Content.creator_id == user_id).count()
        payment_count = db.query(Payment).filter(Payment.user_id == user_id).count()
        message_count = (db.query(Message)
                        .filter((Message.sender_id == user_id) | (Message.recipient_id == user_id))
                        .count())
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "user_type": user.user_type,
            "subscription_tier": user.subscription_tier,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "content_count": content_count,
            "payment_count": payment_count,
            "message_count": message_count
        }
    
    async def suspend_user(self, db: Session, user_id: int, admin_id: int, reason: str = "") -> bool:
        """Suspend a user account"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        db.query(User).filter(User.id == user_id).update({"is_active": False})
        
        # Log admin action
        admin_log = AdminLog(
            admin_id=admin_id,
            action="suspend_user",
            target_type="user",
            target_id=user_id,
            details=f"User suspended. Reason: {reason}"
        )
        
        db.add(admin_log)
        db.commit()
        return True
    
    async def reactivate_user(self, db: Session, user_id: int, admin_id: int) -> bool:
        """Reactivate a suspended user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        db.query(User).filter(User.id == user_id).update({"is_active": True})
        
        # Log admin action
        admin_log = AdminLog(
            admin_id=admin_id,
            action="reactivate_user",
            target_type="user",
            target_id=user_id,
            details="User reactivated"
        )
        
        db.add(admin_log)
        db.commit()
        return True
    
    async def get_content_for_review(self, db: Session, status: str = "pending", 
                                   limit: int = 50) -> List[Content]:
        """Get content awaiting moderation"""
        return (db.query(Content)
                .filter(Content.status == status)
                .order_by(Content.created_at.asc())
                .limit(limit)
                .all())
    
    async def approve_content(self, db: Session, content_id: int, admin_id: int) -> bool:
        """Approve content"""
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return False
        
        db.query(Content).filter(Content.id == content_id).update({"status": "approved"})
        
        # Log admin action
        admin_log = AdminLog(
            admin_id=admin_id,
            action="approve_content",
            target_type="content",
            target_id=content_id,
            details=f"Content '{content.title}' approved"
        )
        
        db.add(admin_log)
        db.commit()
        return True
    
    async def reject_content(self, db: Session, content_id: int, admin_id: int, reason: str = "") -> bool:
        """Reject content"""
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return False
        
        db.query(Content).filter(Content.id == content_id).update({"status": "rejected"})
        
        # Log admin action
        admin_log = AdminLog(
            admin_id=admin_id,
            action="reject_content",
            target_type="content",
            target_id=content_id,
            details=f"Content '{content.title}' rejected. Reason: {reason}"
        )
        
        db.add(admin_log)
        db.commit()
        return True
    
    async def get_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Get platform analytics"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # User analytics
        total_users = db.query(User).count()
        new_users = db.query(User).filter(User.created_at >= cutoff_date).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # Content analytics
        total_content = db.query(Content).count()
        new_content = db.query(Content).filter(Content.created_at >= cutoff_date).count()
        pending_content = db.query(Content).filter(Content.status == "pending").count()
        
        # Payment analytics
        total_payments = db.query(Payment).filter(Payment.status == "completed").count()
        recent_payments = (db.query(Payment)
                          .filter(Payment.created_at >= cutoff_date)
                          .filter(Payment.status == "completed")
                          .count())
        
        from sqlalchemy import func
        total_revenue = (db.query(func.sum(Payment.amount))
                        .filter(Payment.status == "completed")
                        .scalar()) or 0
        
        recent_revenue = (db.query(func.sum(Payment.amount))
                         .filter(Payment.created_at >= cutoff_date)
                         .filter(Payment.status == "completed")
                         .scalar()) or 0
        
        # Message analytics
        total_messages = db.query(Message).count()
        recent_messages = db.query(Message).filter(Message.created_at >= cutoff_date).count()
        
        return {
            "period_days": days,
            "users": {
                "total": total_users,
                "new": new_users,
                "active": active_users,
                "growth_rate": (new_users / total_users * 100) if total_users > 0 else 0
            },
            "content": {
                "total": total_content,
                "new": new_content,
                "pending_review": pending_content,
                "growth_rate": (new_content / total_content * 100) if total_content > 0 else 0
            },
            "payments": {
                "total_transactions": total_payments,
                "recent_transactions": recent_payments,
                "total_revenue": total_revenue,
                "recent_revenue": recent_revenue,
                "average_transaction": total_revenue / total_payments if total_payments > 0 else 0
            },
            "messages": {
                "total": total_messages,
                "recent": recent_messages
            }
        }
    
    async def get_admin_logs(self, db: Session, admin_id: int = None, 
                           limit: int = 100) -> List[AdminLog]:
        """Get admin action logs"""
        query = db.query(AdminLog)
        
        if admin_id:
            query = query.filter(AdminLog.admin_id == admin_id)
        
        return query.order_by(AdminLog.created_at.desc()).limit(limit).all()
    
    async def search_users(self, db: Session, query: str, limit: int = 20) -> List[User]:
        """Search users by username or email"""
        search_term = f"%{query}%"
        return (db.query(User)
                .filter(
                    (User.username.ilike(search_term)) |
                    (User.email.ilike(search_term))
                )
                .limit(limit)
                .all())
    
    async def get_flagged_content(self, db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        """Get content that might need review (high reports, etc.)"""
        # In a real implementation, this would check for user reports, AI flags, etc.
        # For now, return content with unusual patterns
        
        suspicious_content = (db.query(Content)
                            .filter(Content.status == "approved")
                            .order_by(Content.created_at.desc())
                            .limit(limit)
                            .all())
        
        flagged = []
        for content in suspicious_content:
            # Simple heuristics for flagging
            flags = []
            
            if content.views > 1000 and content.likes < 10:
                flags.append("Low engagement despite high views")
            
            if len(content.description) < 10:
                flags.append("Very short description")
            
            if flags:
                flagged.append({
                    "content_id": content.id,
                    "title": content.title,
                    "creator_id": content.creator_id,
                    "flags": flags,
                    "created_at": content.created_at
                })
        
        return flagged
    
    async def generate_user_report(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Generate comprehensive user report"""
        user_details = await self.get_user_details(db, user_id)
        
        if not user_details:
            return {}
        
        # Get user's content performance if creator
        if user_details["user_type"] == "creator":
            content_list = db.query(Content).filter(Content.creator_id == user_id).all()
            total_views = sum(content.views for content in content_list)
            total_likes = sum(content.likes for content in content_list)
            
            user_details["creator_stats"] = {
                "total_views": total_views,
                "total_likes": total_likes,
                "content_performance": [
                    {
                        "id": content.id,
                        "title": content.title,
                        "views": content.views,
                        "likes": content.likes
                    }
                    for content in content_list
                ]
            }
        
        # Get payment history
        payments = db.query(Payment).filter(Payment.user_id == user_id).all()
        user_details["payment_history"] = [
            {
                "id": payment.id,
                "amount": payment.amount,
                "status": payment.status,
                "created_at": payment.created_at
            }
            for payment in payments
        ]
        
        return user_details

    # ========= NEW ADMIN & MODERATOR ENTERPRISE FEATURES =========
    
    async def move_post_to_vault(self, db: Session, post_id: str, reason: str, 
                               evidence: dict, admin_id: str) -> Dict[str, str]:
        """Move illegal content to CEO-only vault"""
        admin = db.query(User).filter(User.id == admin_id).first()
        
        # Only CEO can access vault
        if not admin or admin.user_type != "admin" or not admin.vault_access:
            raise HTTPException(status_code=403, detail="Only CEO can move content to vault")
        
        # Get post details before moving
        post = db.query(Content).filter(Content.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Create vault entry
        vault_entry = IllegalContentVault(
            original_post_id=post_id,
            uploader_id=post.creator_id,
            reason=reason,
            evidence=evidence,
            file_url=post.file_path
        )
        db.add(vault_entry)
        
        # Remove original post
        db.delete(post)
        
        # Log the action
        await self._log_audit(
            db=db,
            actor_id=admin_id,
            action="move_to_vault",
            target_type="post",
            target_id=post_id,
            metadata={"reason": reason, "evidence": evidence}
        )
        
        db.commit()
        return {"status": "Post moved to vault", "vault_id": str(vault_entry.id)}
    
    async def get_vault_contents(self, db: Session, admin_id: str) -> List[Dict[str, Any]]:
        """Get illegal content vault (CEO-only access)"""
        admin = db.query(User).filter(User.id == admin_id).first()
        
        if not admin or admin.user_type != "admin" or not admin.vault_access:
            raise HTTPException(status_code=403, detail="Only CEO can access vault")
        
        vault_items = db.query(IllegalContentVault).order_by(
            IllegalContentVault.vault_created_at.desc()
        ).all()
        
        return [
            {
                "id": str(item.id),
                "original_post_id": str(item.original_post_id),
                "uploader_id": str(item.uploader_id),
                "reason": item.reason,
                "evidence": item.evidence,
                "reviewed": item.reviewed,
                "created_at": item.vault_created_at.isoformat()
            }
            for item in vault_items
        ]
    
    async def issue_warning(self, db: Session, user_id: str, moderator_id: str, 
                          reason: str, severity: int = 1, post_id: str = None) -> Dict[str, str]:
        """Issue warning to user"""
        moderator = db.query(User).filter(User.id == moderator_id).first()
        if not moderator or moderator.user_type not in ["admin", "moderator"]:
            raise HTTPException(status_code=403, detail="Only moderators/admins can issue warnings")
        
        warning = UserWarning(
            user_id=user_id,
            issued_by=moderator_id,
            reason=reason,
            severity=severity,
            post_id=post_id
        )
        db.add(warning)
        
        # Log the warning
        await self._log_audit(
            db=db,
            actor_id=moderator_id,
            action="issue_warning",
            target_type="user",
            target_id=user_id,
            metadata={"severity": severity, "reason": reason}
        )
        
        db.commit()
        return {"status": "Warning issued", "warning_id": str(warning.id)}
    
    async def get_moderation_queue(self, db: Session, moderator_id: str, 
                                 status: str = "pending", limit: int = 50) -> List[Dict[str, Any]]:
        """Get content moderation queue"""
        moderator = db.query(User).filter(User.id == moderator_id).first()
        if not moderator or moderator.user_type not in ["admin", "moderator"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        queue_items = db.query(ModerationQueue)\
            .filter(ModerationQueue.status == status)\
            .order_by(ModerationQueue.priority.desc(), ModerationQueue.created_at.asc())\
            .limit(limit).all()
        
        return [
            {
                "id": str(item.id),
                "post_id": str(item.post_id),
                "reason": item.reason,
                "flagged_by": item.flagged_by,
                "ai_confidence": float(item.ai_confidence) if item.ai_confidence else None,
                "priority": item.priority,
                "created_at": item.created_at.isoformat()
            }
            for item in queue_items
        ]
    
    async def moderate_content(self, db: Session, queue_item_id: str, moderator_id: str, 
                             action: str, notes: str = "") -> Dict[str, str]:
        """Moderate content from queue"""
        moderator = db.query(User).filter(User.id == moderator_id).first()
        if not moderator or moderator.user_type not in ["admin", "moderator"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        queue_item = db.query(ModerationQueue).filter(ModerationQueue.id == queue_item_id).first()
        if not queue_item:
            raise HTTPException(status_code=404, detail="Queue item not found")
        
        # Update queue item
        queue_item.status = action
        queue_item.assigned_to = moderator_id
        queue_item.reviewed_at = datetime.utcnow()
        queue_item.notes = notes
        
        # Handle specific actions
        if action == "approve":
            post = db.query(Content).filter(Content.id == queue_item.post_id).first()
            if post:
                post.status = "approved"
        elif action == "reject":
            post = db.query(Content).filter(Content.id == queue_item.post_id).first()
            if post:
                post.status = "rejected"
        elif action == "vault":
            # Move to vault (requires CEO permissions)
            return await self.move_post_to_vault(
                db, str(queue_item.post_id),
                f"Moderated content: {notes}",
                {"moderation_notes": notes, "queue_item_id": str(queue_item_id)},
                moderator_id
            )
        
        # Log the moderation action
        await self._log_audit(
            db=db,
            actor_id=moderator_id,
            action=f"moderate_{action}",
            target_type="post",
            target_id=str(queue_item.post_id),
            metadata={"notes": notes, "queue_item_id": str(queue_item_id)}
        )
        
        db.commit()
        return {"status": f"Content {action}ed", "queue_item_id": str(queue_item_id)}
    
    async def update_theme(self, db: Session, tenant_id: str, admin_id: str, 
                         theme_data: dict) -> Dict[str, str]:
        """Update platform theme for tenant"""
        admin = db.query(User).filter(User.id == admin_id).first()
        if not admin or admin.user_type != "admin":
            raise HTTPException(status_code=403, detail="Only admins can update themes")
        
        theme = db.query(PlatformTheme).filter(PlatformTheme.tenant_id == tenant_id).first()
        
        if not theme:
            theme = PlatformTheme(tenant_id=tenant_id)
            db.add(theme)
        
        # Update theme properties
        for key, value in theme_data.items():
            if hasattr(theme, key):
                setattr(theme, key, value)
        
        theme.updated_by = admin_id
        theme.updated_at = datetime.utcnow()
        
        # Log theme update
        await self._log_audit(
            db=db,
            actor_id=admin_id,
            action="update_theme",
            target_type="tenant",
            target_id=tenant_id,
            metadata=theme_data
        )
        
        db.commit()
        return {"status": "Theme updated", "tenant_id": tenant_id}
    
    async def get_theme(self, db: Session, tenant_id: str) -> Dict[str, Any]:
        """Get theme for tenant"""
        theme = db.query(PlatformTheme).filter(PlatformTheme.tenant_id == tenant_id).first()
        
        if not theme:
            # Return default theme
            return {
                "primary_color": "#FF6B6B",
                "secondary_color": "#4ECDC4",
                "accent_color": "#FFE66D",
                "font_family": "Inter",
                "dark_mode_enabled": True
            }
        
        return {
            "primary_color": theme.primary_color,
            "secondary_color": theme.secondary_color,
            "accent_color": theme.accent_color,
            "logo_url": theme.logo_url,
            "favicon_url": theme.favicon_url,
            "custom_css": theme.custom_css,
            "font_family": theme.font_family,
            "dark_mode_enabled": theme.dark_mode_enabled
        }
    
    async def get_user_strikes(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Get user strikes information"""
        strikes = db.query(UserStrike).filter(UserStrike.user_id == user_id).first()
        
        if not strikes:
            return {"strike_count": 0, "suspended": False}
        
        return {
            "strike_count": strikes.strike_count,
            "last_strike": strikes.last_strike.isoformat() if strikes.last_strike else None,
            "suspended": strikes.suspended,
            "suspension_expires": strikes.suspension_expires.isoformat() if strikes.suspension_expires else None
        }
    
    async def get_audit_logs(self, db: Session, admin_id: str, limit: int = 100, 
                           action: str = None, target_type: str = None) -> List[Dict[str, Any]]:
        """Get audit logs (admin only)"""
        admin = db.query(User).filter(User.id == admin_id).first()
        if not admin or admin.user_type != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        query = db.query(AuditLog)
        
        if action:
            query = query.filter(AuditLog.action == action)
        
        if target_type:
            query = query.filter(AuditLog.target_type == target_type)
        
        logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
        
        return [
            {
                "id": str(log.id),
                "actor_id": str(log.actor_id),
                "action": log.action,
                "target_type": log.target_type,
                "target_id": str(log.target_id) if log.target_id else None,
                "metadata": log.metadata,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]
    
    async def _log_audit(self, db: Session, actor_id: str, action: str, 
                       target_type: str = None, target_id: str = None, 
                       before_state: dict = None, after_state: dict = None, 
                       metadata: dict = None, ip_address: str = None, 
                       user_agent: str = None, session_id: str = None):
        """Log admin/moderator action for audit trail"""
        audit_log = AuditLog(
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            before_state=before_state,
            after_state=after_state,
            metadata=metadata,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id
        )
        db.add(audit_log)
