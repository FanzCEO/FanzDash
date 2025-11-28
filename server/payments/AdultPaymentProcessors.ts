/**
 * Comprehensive Adult Industry Payment Processors Configuration
 * All major adult-friendly payment processors with full integration support
 */

export interface PaymentProcessorConfig {
  id: string;
  name: string;
  type: 'card' | 'crypto' | 'wallet' | 'bank' | 'alternative';
  adultFriendly: boolean;
  regions: string[];
  currencies: string[];
  features: {
    recurring: boolean;
    chargebacks: boolean;
    refunds: boolean;
    escrow: boolean;
    instantPayouts: boolean;
    multiCurrency: boolean;
    tokenization: boolean;
    fraudProtection: boolean;
    threedsecure: boolean;
  };
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
    chargebackFee?: number;
    refundFee?: number;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
    monthly: number;
  };
  settlementTime: string;
  kycRequired: boolean;
  status: 'active' | 'testing' | 'inactive';
  priority: number;
  documentation: string;
  apiEndpoint?: string;
  webhookUrl?: string;
}

/**
 * ALL ADULT-FRIENDLY PAYMENT PROCESSORS
 */
export const ADULT_PAYMENT_PROCESSORS: Record<string, PaymentProcessorConfig> = {
  // ========== PRIMARY CARD PROCESSORS ==========

  'ccbill': {
    id: 'ccbill',
    name: 'CCBill',
    type: 'card',
    adultFriendly: true,
    regions: ['US', 'CA', 'EU', 'UK', 'AU', 'GLOBAL'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: true,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 10.9,
      fixed: 0,
      currency: 'USD',
      chargebackFee: 25,
      refundFee: 0
    },
    limits: {
      min: 2.95,
      max: 10000,
      daily: 100000,
      monthly: 1000000
    },
    settlementTime: '7-14 days',
    kycRequired: true,
    status: 'active',
    priority: 1,
    documentation: 'https://ccbill.com/doc/ccbill-restful-transaction-api',
    apiEndpoint: 'https://api.ccbill.com',
    webhookUrl: '/webhooks/ccbill'
  },

  'segpay': {
    id: 'segpay',
    name: 'Segpay',
    type: 'card',
    adultFriendly: true,
    regions: ['US', 'EU', 'UK', 'CA', 'AU', 'LATAM', 'ASIA'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL', 'MXN'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: true,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 11.5,
      fixed: 0,
      currency: 'USD',
      chargebackFee: 30,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 15000,
      daily: 150000,
      monthly: 2000000
    },
    settlementTime: '14 days',
    kycRequired: true,
    status: 'active',
    priority: 2,
    documentation: 'https://segpay.com/developers',
    apiEndpoint: 'https://api.segpay.com',
    webhookUrl: '/webhooks/segpay'
  },

  'epoch': {
    id: 'epoch',
    name: 'Epoch',
    type: 'card',
    adultFriendly: true,
    regions: ['EU', 'UK', 'US', 'CA', 'AU'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 12,
      fixed: 0,
      currency: 'USD',
      chargebackFee: 25,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 5000,
      daily: 50000,
      monthly: 500000
    },
    settlementTime: '7-21 days',
    kycRequired: true,
    status: 'active',
    priority: 3,
    documentation: 'https://epoch.com/developers',
    apiEndpoint: 'https://api.epoch.com',
    webhookUrl: '/webhooks/epoch'
  },

  'vendo': {
    id: 'vendo',
    name: 'Vendo',
    type: 'card',
    adultFriendly: true,
    regions: ['GLOBAL', 'EU', 'LATAM', 'ASIA'],
    currencies: ['USD', 'EUR', 'GBP', 'BRL', 'MXN', 'ARS'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 9.9,
      fixed: 0,
      currency: 'USD',
      chargebackFee: 20,
      refundFee: 0
    },
    limits: {
      min: 3,
      max: 20000,
      daily: 200000,
      monthly: 3000000
    },
    settlementTime: '7 days',
    kycRequired: true,
    status: 'active',
    priority: 4,
    documentation: 'https://vendo.com/docs',
    apiEndpoint: 'https://api.vendo.com',
    webhookUrl: '/webhooks/vendo'
  },

  'verotel': {
    id: 'verotel',
    name: 'Verotel',
    type: 'card',
    adultFriendly: true,
    regions: ['EU', 'UK', 'US', 'GLOBAL'],
    currencies: ['EUR', 'USD', 'GBP', 'CHF'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 11,
      fixed: 0,
      currency: 'EUR',
      chargebackFee: 25,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 10000,
      daily: 100000,
      monthly: 1000000
    },
    settlementTime: '14 days',
    kycRequired: true,
    status: 'active',
    priority: 5,
    documentation: 'https://www.verotel.com/en/support/api',
    apiEndpoint: 'https://secure.verotel.com/api',
    webhookUrl: '/webhooks/verotel'
  },

  'rocketgate': {
    id: 'rocketgate',
    name: 'RocketGate',
    type: 'card',
    adultFriendly: true,
    regions: ['US', 'CA', 'EU', 'GLOBAL'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: true,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 10,
      fixed: 0,
      currency: 'USD',
      chargebackFee: 25,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 15000,
      daily: 150000,
      monthly: 2000000
    },
    settlementTime: '7-14 days',
    kycRequired: true,
    status: 'active',
    priority: 6,
    documentation: 'https://developer.rocketgate.com',
    apiEndpoint: 'https://gateway.rocketgate.com',
    webhookUrl: '/webhooks/rocketgate'
  },

  'netbilling': {
    id: 'netbilling',
    name: 'NetBilling',
    type: 'card',
    adultFriendly: true,
    regions: ['US', 'EU', 'GLOBAL'],
    currencies: ['USD', 'EUR', 'GBP'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 12,
      fixed: 0,
      currency: 'USD',
      chargebackFee: 30,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 10000,
      daily: 100000,
      monthly: 1000000
    },
    settlementTime: '14-21 days',
    kycRequired: true,
    status: 'active',
    priority: 7,
    documentation: 'https://www.netbilling.com/developers',
    apiEndpoint: 'https://secure.netbilling.com/api',
    webhookUrl: '/webhooks/netbilling'
  },

  'commercegate': {
    id: 'commercegate',
    name: 'CommerceGate',
    type: 'card',
    adultFriendly: true,
    regions: ['EU', 'US', 'UK'],
    currencies: ['EUR', 'USD', 'GBP'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 11.5,
      fixed: 0,
      currency: 'EUR',
      chargebackFee: 25,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 8000,
      daily: 80000,
      monthly: 800000
    },
    settlementTime: '14 days',
    kycRequired: true,
    status: 'active',
    priority: 8,
    documentation: 'https://commercegate.com/docs',
    apiEndpoint: 'https://api.commercegate.com',
    webhookUrl: '/webhooks/commercegate'
  },

  'centrobill': {
    id: 'centrobill',
    name: 'CentroBill',
    type: 'card',
    adultFriendly: true,
    regions: ['EU', 'UK', 'US'],
    currencies: ['EUR', 'USD', 'GBP'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 10.5,
      fixed: 0,
      currency: 'EUR',
      chargebackFee: 20,
      refundFee: 0
    },
    limits: {
      min: 5,
      max: 10000,
      daily: 100000,
      monthly: 1000000
    },
    settlementTime: '7-14 days',
    kycRequired: true,
    status: 'active',
    priority: 9,
    documentation: 'https://centrobill.com/api',
    apiEndpoint: 'https://api.centrobill.com',
    webhookUrl: '/webhooks/centrobill'
  },

  'payze': {
    id: 'payze',
    name: 'Payze',
    type: 'card',
    adultFriendly: true,
    regions: ['EU', 'CIS'],
    currencies: ['EUR', 'USD', 'GEL'],
    features: {
      recurring: true,
      chargebacks: true,
      refunds: true,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: true,
      fraudProtection: true,
      threedsecure: true
    },
    fees: {
      percentage: 3.5,
      fixed: 0.3,
      currency: 'EUR',
      chargebackFee: 15,
      refundFee: 0
    },
    limits: {
      min: 1,
      max: 50000,
      daily: 500000,
      monthly: 5000000
    },
    settlementTime: 'instant',
    kycRequired: true,
    status: 'active',
    priority: 10,
    documentation: 'https://payze.io/docs',
    apiEndpoint: 'https://api.payze.io',
    webhookUrl: '/webhooks/payze'
  },

  // ========== CRYPTOCURRENCY PROCESSORS ==========

  'coinbase_commerce': {
    id: 'coinbase_commerce',
    name: 'Coinbase Commerce',
    type: 'crypto',
    adultFriendly: true,
    regions: ['GLOBAL'],
    currencies: ['BTC', 'ETH', 'USDC', 'USDT', 'DAI', 'LTC', 'BCH'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 1,
      fixed: 0,
      currency: 'USD'
    },
    limits: {
      min: 1,
      max: 1000000,
      daily: 10000000,
      monthly: 100000000
    },
    settlementTime: '10-60 minutes',
    kycRequired: false,
    status: 'active',
    priority: 11,
    documentation: 'https://commerce.coinbase.com/docs',
    apiEndpoint: 'https://api.commerce.coinbase.com',
    webhookUrl: '/webhooks/coinbase'
  },

  'nowpayments': {
    id: 'nowpayments',
    name: 'NOWPayments',
    type: 'crypto',
    adultFriendly: true,
    regions: ['GLOBAL'],
    currencies: ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'DOGE', 'TRX', 'LTC'],
    features: {
      recurring: true,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 0.5,
      fixed: 0,
      currency: 'USD'
    },
    limits: {
      min: 0.5,
      max: 1000000,
      daily: 10000000,
      monthly: 100000000
    },
    settlementTime: '10-30 minutes',
    kycRequired: false,
    status: 'active',
    priority: 12,
    documentation: 'https://nowpayments.io/doc/api',
    apiEndpoint: 'https://api.nowpayments.io',
    webhookUrl: '/webhooks/nowpayments'
  },

  'coinpayments': {
    id: 'coinpayments',
    name: 'CoinPayments',
    type: 'crypto',
    adultFriendly: true,
    regions: ['GLOBAL'],
    currencies: ['BTC', 'ETH', 'LTC', 'DASH', 'DOGE', 'BCH', 'XMR', 'ZEC'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 0.5,
      fixed: 0,
      currency: 'USD'
    },
    limits: {
      min: 1,
      max: 1000000,
      daily: 10000000,
      monthly: 100000000
    },
    settlementTime: '10-60 minutes',
    kycRequired: false,
    status: 'active',
    priority: 13,
    documentation: 'https://www.coinpayments.net/apidoc',
    apiEndpoint: 'https://www.coinpayments.net/api.php',
    webhookUrl: '/webhooks/coinpayments'
  },

  'btcpayserver': {
    id: 'btcpayserver',
    name: 'BTCPay Server',
    type: 'crypto',
    adultFriendly: true,
    regions: ['GLOBAL'],
    currencies: ['BTC', 'LTC', 'DASH', 'BCH', 'XMR'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 0,
      fixed: 0,
      currency: 'USD'
    },
    limits: {
      min: 1,
      max: 1000000,
      daily: 10000000,
      monthly: 100000000
    },
    settlementTime: '10-60 minutes',
    kycRequired: false,
    status: 'active',
    priority: 14,
    documentation: 'https://docs.btcpayserver.org',
    apiEndpoint: 'self-hosted',
    webhookUrl: '/webhooks/btcpay'
  },

  // ========== PAYOUT PROVIDERS ==========

  'paxum': {
    id: 'paxum',
    name: 'Paxum',
    type: 'wallet',
    adultFriendly: true,
    regions: ['GLOBAL', 'US', 'EU', 'CA'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: true,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 2,
      fixed: 1,
      currency: 'USD'
    },
    limits: {
      min: 50,
      max: 100000,
      daily: 500000,
      monthly: 5000000
    },
    settlementTime: '1-2 business days',
    kycRequired: true,
    status: 'active',
    priority: 1,
    documentation: 'https://www.paxum.com/payment_docs/index.php',
    apiEndpoint: 'https://www.paxum.com/payment/api',
    webhookUrl: '/webhooks/paxum'
  },

  'epayservice': {
    id: 'epayservice',
    name: 'ePayService',
    type: 'wallet',
    adultFriendly: true,
    regions: ['GLOBAL', 'EU', 'ASIA'],
    currencies: ['USD', 'EUR', 'GBP', 'RUB'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 1.5,
      fixed: 0.5,
      currency: 'USD'
    },
    limits: {
      min: 10,
      max: 50000,
      daily: 200000,
      monthly: 2000000
    },
    settlementTime: '24 hours',
    kycRequired: true,
    status: 'active',
    priority: 2,
    documentation: 'https://epayservices.com/en/api/',
    apiEndpoint: 'https://api.epayservices.com',
    webhookUrl: '/webhooks/epayservice'
  },

  'cosmopayment': {
    id: 'cosmopayment',
    name: 'Cosmo Payment',
    type: 'wallet',
    adultFriendly: true,
    regions: ['GLOBAL', 'EU', 'ASIA'],
    currencies: ['USD', 'EUR', 'GBP', 'CNY'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: true,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 2.5,
      fixed: 1,
      currency: 'USD'
    },
    limits: {
      min: 50,
      max: 50000,
      daily: 200000,
      monthly: 2000000
    },
    settlementTime: '1-3 business days',
    kycRequired: true,
    status: 'active',
    priority: 3,
    documentation: 'https://www.cosmopayment.com/docs',
    apiEndpoint: 'https://api.cosmopayment.com',
    webhookUrl: '/webhooks/cosmopayment'
  },

  'wise': {
    id: 'wise',
    name: 'Wise (TransferWise)',
    type: 'bank',
    adultFriendly: false, // May reject adult businesses
    regions: ['GLOBAL'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 0.5,
      fixed: 0.5,
      currency: 'USD'
    },
    limits: {
      min: 1,
      max: 1000000,
      daily: 5000000,
      monthly: 50000000
    },
    settlementTime: '1-2 business days',
    kycRequired: true,
    status: 'testing',
    priority: 20,
    documentation: 'https://api-docs.wise.com',
    apiEndpoint: 'https://api.wise.com',
    webhookUrl: '/webhooks/wise'
  },

  'payoneer': {
    id: 'payoneer',
    name: 'Payoneer',
    type: 'wallet',
    adultFriendly: false, // May reject adult businesses
    regions: ['GLOBAL'],
    currencies: ['USD', 'EUR', 'GBP', 'JPY'],
    features: {
      recurring: false,
      chargebacks: false,
      refunds: false,
      escrow: false,
      instantPayouts: false,
      multiCurrency: true,
      tokenization: false,
      fraudProtection: true,
      threedsecure: false
    },
    fees: {
      percentage: 3,
      fixed: 0,
      currency: 'USD'
    },
    limits: {
      min: 50,
      max: 100000,
      daily: 500000,
      monthly: 5000000
    },
    settlementTime: '2-3 business days',
    kycRequired: true,
    status: 'testing',
    priority: 21,
    documentation: 'https://developer.payoneer.com',
    apiEndpoint: 'https://api.payoneer.com',
    webhookUrl: '/webhooks/payoneer'
  }
};

/**
 * Get all active adult-friendly processors
 */
export function getActiveAdultProcessors(): PaymentProcessorConfig[] {
  return Object.values(ADULT_PAYMENT_PROCESSORS)
    .filter(p => p.adultFriendly && p.status === 'active')
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get processors by type
 */
export function getProcessorsByType(type: 'card' | 'crypto' | 'wallet' | 'bank' | 'alternative'): PaymentProcessorConfig[] {
  return Object.values(ADULT_PAYMENT_PROCESSORS)
    .filter(p => p.type === type && p.adultFriendly)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get processors by region
 */
export function getProcessorsByRegion(region: string): PaymentProcessorConfig[] {
  return Object.values(ADULT_PAYMENT_PROCESSORS)
    .filter(p => p.regions.includes(region) || p.regions.includes('GLOBAL'))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get processor with escrow support
 */
export function getEscrowProcessors(): PaymentProcessorConfig[] {
  return Object.values(ADULT_PAYMENT_PROCESSORS)
    .filter(p => p.features.escrow && p.adultFriendly)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get crypto processors
 */
export function getCryptoProcessors(): PaymentProcessorConfig[] {
  return getProcessorsByType('crypto');
}

/**
 * Get payout providers
 */
export function getPayoutProviders(): PaymentProcessorConfig[] {
  return Object.values(ADULT_PAYMENT_PROCESSORS)
    .filter(p => (p.type === 'wallet' || p.type === 'bank') && p.adultFriendly)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get processor by ID
 */
export function getProcessorById(id: string): PaymentProcessorConfig | undefined {
  return ADULT_PAYMENT_PROCESSORS[id];
}

/**
 * Get all supported currencies
 */
export function getAllSupportedCurrencies(): string[] {
  const currencies = new Set<string>();
  Object.values(ADULT_PAYMENT_PROCESSORS).forEach(processor => {
    processor.currencies.forEach(currency => currencies.add(currency));
  });
  return Array.from(currencies).sort();
}

/**
 * Get best processor for amount and region
 */
export function getBestProcessor(amount: number, currency: string, region: string): PaymentProcessorConfig | null {
  const processors = getProcessorsByRegion(region)
    .filter(p =>
      p.currencies.includes(currency) &&
      p.limits.min <= amount &&
      p.limits.max >= amount &&
      p.status === 'active'
    )
    .sort((a, b) => {
      // Sort by lowest fees
      const aFee = (amount * a.fees.percentage / 100) + a.fees.fixed;
      const bFee = (amount * b.fees.percentage / 100) + b.fees.fixed;
      return aFee - bFee;
    });

  return processors[0] || null;
}
