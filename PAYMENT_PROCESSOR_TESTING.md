# Payment Processor Testing Guide

## Overview

The FANZ ecosystem integrates **19 adult-friendly payment processors** across multiple categories:
- **Card Processors** (10): CCBill, Segpay, Epoch, Vendo, Verotel, RocketGate, NetBilling, CommerceGate, CentroBill, Payze
- **Crypto Processors** (4): Coinbase Commerce, NOWPayments, CoinPayments, BTCPay Server
- **Wallet/Alternative** (5): Paxum, ePayService, CosmoPayment, Wise, Payoneer

## Testing Environment Setup

### 1. Environment Variables Required

Add the following to your `.env` file for each processor you want to test:

```bash
# Card Processors
CCBILL_ACCOUNT_NUMBER=your_account_number
CCBILL_SUBACCOUNT_NUMBER=your_subaccount
CCBILL_API_KEY=your_api_key
CCBILL_SALT=your_salt

SEGPAY_PACKAGE_ID=your_package_id
SEGPAY_ACCESS_KEY=your_access_key

EPOCH_COMPANY_ID=your_company_id
EPOCH_PI_CODE=your_pi_code

VENDO_MERCHANT_ID=your_merchant_id
VENDO_API_KEY=your_api_key

VEROTEL_SHOP_ID=your_shop_id
VEROTEL_API_SIGNATURE=your_signature

ROCKETGATE_MERCHANT_ID=your_merchant_id
ROCKETGATE_MERCHANT_PASSWORD=your_password

NETBILLING_ACCOUNT_ID=your_account_id
NETBILLING_SITE_TAG=your_site_tag

COMMERCEGATE_MERCHANT_ID=your_merchant_id
COMMERCEGATE_API_KEY=your_api_key

CENTROBILL_SITE_ID=your_site_id
CENTROBILL_API_KEY=your_api_key

PAYZE_API_KEY=your_api_key
PAYZE_API_SECRET=your_api_secret

# Crypto Processors
COINBASE_COMMERCE_API_KEY=your_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret

NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret

COINPAYMENTS_MERCHANT_ID=your_merchant_id
COINPAYMENTS_IPN_SECRET=your_ipn_secret
COINPAYMENTS_PUBLIC_KEY=your_public_key
COINPAYMENTS_PRIVATE_KEY=your_private_key

BTCPAY_SERVER_URL=https://your-btcpay-server.com
BTCPAY_SERVER_API_KEY=your_api_key
BTCPAY_SERVER_STORE_ID=your_store_id

# Wallet/Alternative Processors
PAXUM_EMAIL=your_paxum_email
PAXUM_API_KEY=your_api_key

EPAYSERVICE_CLIENT_ID=your_client_id
EPAYSERVICE_API_KEY=your_api_key

COSMOPAYMENT_MERCHANT_ID=your_merchant_id
COSMOPAYMENT_API_KEY=your_api_key

WISE_API_KEY=your_api_key
WISE_PROFILE_ID=your_profile_id

PAYONEER_API_USERNAME=your_username
PAYONEER_API_PASSWORD=your_password
PAYONEER_PARTNER_ID=your_partner_id
```

### 2. Webhook Configuration

Each processor needs webhooks configured for real-time payment notifications:

```bash
# Your base URL for webhooks
WEBHOOK_BASE_URL=https://your-domain.com

# Individual webhook paths (auto-configured)
# /webhooks/ccbill
# /webhooks/segpay
# /webhooks/epoch
# /webhooks/vendo
# /webhooks/verotel
# /webhooks/rocketgate
# /webhooks/netbilling
# /webhooks/commercegate
# /webhooks/centrobill
# /webhooks/payze
# /webhooks/coinbase
# /webhooks/nowpayments
# /webhooks/coinpayments
# /webhooks/btcpay
# /webhooks/paxum
# /webhooks/epayservice
# /webhooks/cosmopayment
# /webhooks/wise
# /webhooks/payoneer
```

## Testing Checklist

### Phase 1: Basic Configuration Testing ✅

- [ ] Verify all environment variables are set
- [ ] Test payment processor configuration loading
- [ ] Verify webhook endpoints are accessible
- [ ] Test SSL/TLS configuration for secure webhooks

### Phase 2: Card Processor Testing 💳

#### CCBill (Priority 1 - Industry Standard)
- [ ] **Test Charge**: Create one-time charge
- [ ] **Test Subscription**: Create recurring subscription
- [ ] **Test Refund**: Process full/partial refund
- [ ] **Test Chargeback**: Handle chargeback notification
- [ ] **Test 3D Secure**: Verify 3DS authentication
- [ ] **Test Webhook**: Receive and process payment notifications
- [ ] **Test Multi-Currency**: Process charges in EUR, GBP
- [ ] **Test Limits**: Verify min ($2.95) and max ($10,000) limits

#### Segpay (Priority 2)
- [ ] Test one-time payment
- [ ] Test subscription with trial period
- [ ] Test cross-sales and upsells
- [ ] Test decline recovery
- [ ] Test webhook integration
- [ ] Test multi-currency (7 currencies)

#### Epoch (Priority 3)
- [ ] Test payment processing
- [ ] Test recurring billing
- [ ] Test payment link generation
- [ ] Test webhook handling
- [ ] Test fraud prevention features

#### Vendo, Verotel, RocketGate, NetBilling, CommerceGate, CentroBill, Payze
- [ ] Test basic payment processing for each
- [ ] Verify webhook integration
- [ ] Test refund capabilities
- [ ] Verify geographic restrictions

### Phase 3: Crypto Processor Testing ₿

#### Coinbase Commerce
- [ ] Test Bitcoin payment
- [ ] Test Ethereum payment
- [ ] Test USDC stablecoin payment
- [ ] Test payment expiration (1 hour)
- [ ] Test underpayment handling
- [ ] Test overpayment handling
- [ ] Test webhook notifications
- [ ] Test payment confirmation (6 confirmations for BTC)

#### NOWPayments
- [ ] Test BTC, ETH, LTC, USDT payments
- [ ] Test instant payment notifications
- [ ] Test IPN (Instant Payment Notification)
- [ ] Test minimum payment amounts
- [ ] Test exchange rate locking

#### CoinPayments
- [ ] Test multi-coin support (100+ coins)
- [ ] Test automatic coin conversion
- [ ] Test wallet creation
- [ ] Test IPN callback
- [ ] Test withdrawal to external wallet

#### BTCPay Server (Self-Hosted)
- [ ] Test on-chain BTC payments
- [ ] Test Lightning Network payments
- [ ] Test invoice generation
- [ ] Test webhook events
- [ ] Test refund handling

### Phase 4: Wallet/Alternative Processor Testing 💼

#### Paxum (Adult Industry Standard)
- [ ] Test account-to-account transfer
- [ ] Test withdrawal to Paxum account
- [ ] Test API authentication
- [ ] Test transaction history retrieval
- [ ] Test balance checks

#### ePayService
- [ ] Test card deposits
- [ ] Test wire transfers
- [ ] Test crypto deposits
- [ ] Test multi-currency support
- [ ] Test API integration

#### CosmoPayment
- [ ] Test payment processing
- [ ] Test high-risk merchant support
- [ ] Test multi-currency
- [ ] Test API integration

#### Wise (formerly TransferWise)
- [ ] Test international transfers
- [ ] Test currency conversion
- [ ] Test balance retrieval
- [ ] Test recipient management
- [ ] Test transfer quotes

#### Payoneer
- [ ] Test mass payout
- [ ] Test recipient onboarding
- [ ] Test payment status tracking
- [ ] Test webhook notifications

### Phase 5: Advanced Features Testing 🚀

#### Escrow Service Testing
- [ ] Test custom content request payment hold
- [ ] Test payment release on content delivery
- [ ] Test partial release (milestone payments)
- [ ] Test dispute handling
- [ ] Test automatic release (7-day timer)
- [ ] Test refund from escrow

#### Recurring Billing Testing
- [ ] Test subscription creation
- [ ] Test successful renewal
- [ ] Test failed renewal handling
- [ ] Test subscription cancellation
- [ ] Test proration on plan changes
- [ ] Test grace period handling
- [ ] Test dunning management

#### Fraud Prevention Testing
- [ ] Test velocity checks (multiple transactions)
- [ ] Test geo-blocking
- [ ] Test BIN validation
- [ ] Test CVV verification
- [ ] Test address verification (AVS)
- [ ] Test 3D Secure flow
- [ ] Test machine learning fraud scoring

#### Compliance Testing
- [ ] Test age verification integration
- [ ] Test 2257 record keeping
- [ ] Test PCI DSS compliance
- [ ] Test GDPR data handling
- [ ] Test CCPA data privacy
- [ ] Test transaction reporting for regulators

### Phase 6: Error Handling Testing ⚠️

- [ ] Test declined card handling
- [ ] Test insufficient funds
- [ ] Test expired card
- [ ] Test network timeout
- [ ] Test API rate limiting
- [ ] Test invalid credentials
- [ ] Test webhook retry logic
- [ ] Test idempotency

### Phase 7: Performance Testing 📊

- [ ] Test concurrent payment processing (100 simultaneous)
- [ ] Test webhook processing latency
- [ ] Test database transaction locking
- [ ] Test payment processor failover
- [ ] Test payment method routing optimization
- [ ] Load test: 1000 transactions/minute

### Phase 8: Integration Testing 🔗

- [ ] Test FanzDash admin panel payment display
- [ ] Test creator payout dashboard
- [ ] Test user payment method management
- [ ] Test subscription management UI
- [ ] Test transaction history display
- [ ] Test receipt generation
- [ ] Test refund UI flow

## Test Scenarios

### Scenario 1: New Subscription Purchase
1. User selects subscription plan ($9.99/month)
2. System offers payment methods based on user location
3. User selects CCBill (credit card)
4. User enters card details
5. CCBill processes payment with 3D Secure
6. Webhook received and subscription activated
7. User gains access to content
8. Receipt emailed to user

**Expected Result:** ✅ Subscription active, user charged $9.99, recurring billing scheduled

### Scenario 2: Custom Content Request with Escrow
1. Fan requests custom content ($100)
2. System charges fan via Segpay
3. $100 held in escrow
4. Creator produces content and marks delivered
5. Fan approves content
6. Escrow releases $100 to creator (minus platform fee)
7. Creator receives payout via Paxum

**Expected Result:** ✅ Escrow held → Released → Creator paid

### Scenario 3: Crypto Payment
1. User purchases tips ($50) in Bitcoin
2. System generates Coinbase Commerce invoice
3. User sends BTC to address
4. System detects payment (0 confirmations)
5. System waits for 6 confirmations
6. Payment confirmed and tips credited
7. Creator can withdraw via crypto

**Expected Result:** ✅ BTC received → Confirmed → Tips credited

### Scenario 4: Failed Payment Recovery
1. Subscription renewal fails (expired card)
2. System sends email notification
3. User updates payment method
4. System retries charge
5. Payment succeeds
6. Subscription continues

**Expected Result:** ✅ Failed → Notified → Updated → Retried → Success

### Scenario 5: Refund Request
1. User requests refund within 30 days
2. Admin approves refund
3. System processes refund via original processor (CCBill)
4. Webhook confirms refund
5. User's access revoked
6. Refund confirmation email sent

**Expected Result:** ✅ Refund processed, access revoked, confirmation sent

## Manual Testing Steps

### Quick Test: Single Payment

```bash
# 1. Start development server
cd fanzdash
npm run dev

# 2. Access payment test page
open http://localhost:3000/test/payment

# 3. Select processor: CCBill
# 4. Enter test card: 4007000000027
# 5. CVV: 123
# 6. Expiry: 12/2025
# 7. Amount: $10.00

# 8. Check logs for processing
tail -f server/logs/payments.log

# 9. Verify webhook received
curl http://localhost:3000/api/webhooks/test/ccbill

# 10. Check database for transaction
psql -d fanz_ecosystem -c "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1;"
```

### Automated Test Suite

```bash
# Run all payment processor tests
npm run test:payments

# Run specific processor tests
npm run test:payments -- --processor=ccbill
npm run test:payments -- --processor=crypto
npm run test:payments -- --processor=wallet

# Run escrow tests
npm run test:escrow

# Run webhook tests
npm run test:webhooks
```

## Test Cards

### CCBill Test Cards
- **Success:** 4007000000027
- **Decline:** 4242000000000
- **3D Secure:** 4007000000008

### Segpay Test Cards
- **Success:** 4111111111111111
- **Decline:** 5105105105105100

### Crypto Test Wallets
- **BTC Testnet:** Use Bitcoin testnet faucet
- **ETH Rinkeby:** Use Ethereum test network

## Success Criteria

✅ **All card processors** process test payments successfully
✅ **All crypto processors** receive and confirm payments
✅ **All wallet processors** transfer funds correctly
✅ **Escrow system** holds and releases funds properly
✅ **Webhooks** are received within 5 seconds
✅ **Refunds** process without errors
✅ **Subscriptions** renew automatically
✅ **Fraud detection** blocks suspicious transactions
✅ **Performance** handles 1000+ transactions/minute
✅ **Compliance** logs all required data

## Production Deployment Checklist

Before going live:

- [ ] All API keys switched from test to production
- [ ] Webhooks configured with production URLs (HTTPS required)
- [ ] SSL certificates installed and verified
- [ ] Firewall rules configured for payment processors
- [ ] Database backups configured
- [ ] Monitoring alerts configured
- [ ] PCI DSS compliance audit passed
- [ ] Legal review of terms of service
- [ ] Customer support trained on payment issues
- [ ] Disaster recovery plan documented
- [ ] Load testing completed successfully
- [ ] Security penetration testing completed

## Support Contacts

### Technical Support
- **CCBill:** support@ccbill.com
- **Segpay:** support@segpay.com
- **Epoch:** support@epoch.com
- **Coinbase Commerce:** commerce@coinbase.com
- **Paxum:** support@paxum.com

### Emergency Contacts
- **Payment Failures:** monitor payments queue, auto-retry enabled
- **Webhook Failures:** check logs at `/var/log/fanz/webhooks.log`
- **Fraud Alerts:** Review admin panel → Security → Fraud Alerts

## Monitoring

### Key Metrics to Track
- Payment success rate (target: >95%)
- Average transaction time (target: <3 seconds)
- Webhook delivery rate (target: 100%)
- Chargeback rate (target: <1%)
- Refund rate (target: <5%)
- Failed payment recovery rate (target: >60%)

### Dashboards
- Grafana: `http://localhost:3001/dashboards/payments`
- Admin Panel: `http://localhost:3000/admin/payments/analytics`

---

**Last Updated:** 2025-11-08
**Status:** Ready for Testing
**Next Review:** After initial production deployment
