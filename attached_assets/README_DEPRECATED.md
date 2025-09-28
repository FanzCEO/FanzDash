# Deprecated Template Files - Archive Notice

## ⚠️ IMPORTANT: These files are DEPRECATED and not used in the current system

The PHP Blade template files in this directory (`*.blade_*.php`) are **legacy artifacts** from a previous system version and are **NOT** part of the current FanzDash application.

### Why These Files Are Kept

These files are preserved for:
- Historical reference and migration documentation
- Potential UI/UX pattern analysis
- Legal/audit trail requirements

### ⚠️ Critical Policy Violations

**These legacy files contain references to BANNED payment processors:**
- **Stripe** - Banned due to adult content restrictions
- **PayPal** - Banned due to adult content policies

### Current System Information

**Active System:** FanzDash Enterprise 2.0.0
- **Frontend:** React 18.3.1 + TypeScript 5.6.3
- **Backend:** Node.js + Express 4.21.2
- **Payment Processors:** CCBill, SegPay, Cryptocurrency (adult-compliant only)

### For Developers

If you need to reference UI patterns or functionality:
1. ✅ **DO:** Use current React components in `client/src/components/`
2. ✅ **DO:** Follow current payment integration patterns in `server/paymentProcessor.ts`
3. ❌ **DON'T:** Copy payment processor configurations from these legacy files
4. ❌ **DON'T:** Reference banned processors (Stripe, PayPal, Square)

### Compliance Note

As per company policy:
- All payment processing must use adult-content-friendly processors
- Stripe, PayPal, and Square are **permanently banned**
- Current compliant processors: CCBill, SegPay, RocketGate, Epoch, Verotel, Cryptocurrency

---

*Last Updated: January 2025*  
*System Version: FanzDash Enterprise 2.0.0*