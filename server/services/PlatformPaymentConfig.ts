/**
 * Platform-Specific Payment Configuration
 * Each of the 94 FANZ platforms has its own payment processor credentials
 */

import { randomUUID } from 'crypto';

export interface PlatformPaymentConfig {
  platformId: string;
  platformName: string;
  enabled: boolean;

  // CCBill Configuration (Each platform has unique credentials)
  ccbill: {
    merchantId: string;
    subAccount: string;
    formName: string;
    salt: string;
    apiKey?: string;
    datalinkUsername?: string;
    datalinkPassword?: string;
  };

  // Segpay Configuration
  segpay: {
    packageId: string;
    merchantId: string;
    accessKey: string;
    apiKey?: string;
  };

  // Epoch Configuration
  epoch: {
    merchantId: string;
    secretKey: string;
    piCode?: string;
  };

  // Vendo Configuration
  vendo?: {
    merchantId: string;
    apiKey: string;
    secretKey: string;
  };

  // Crypto Configuration (Can be shared or platform-specific)
  crypto: {
    coinbaseCommerceApiKey?: string;
    nowpaymentsApiKey?: string;
    coinpaymentsPublicKey?: string;
    coinpaymentsPrivateKey?: string;
  };

  // Payout Configuration
  payouts: {
    paxumApiKey?: string;
    paxumApiSecret?: string;
    epayserviceApiKey?: string;
    cosmoPaymentApiKey?: string;
  };

  // Platform-specific settings
  settings: {
    defaultCurrency: string;
    supportedCurrencies: string[];
    escrowEnabled: boolean;
    escrowHoldDays: number;
    minTransactionAmount: number;
    maxTransactionAmount: number;
    platformFeePercentage: number;
    customContentEnabled: boolean;
  };

  // Metadata
  created: Date;
  updated: Date;
}

// All 94 FANZ Platforms
export const ALL_PLATFORMS = [
  // Original Core Platforms
  'boyfanz', 'girlfanz', 'pupfanz', 'transfanz', 'taboofanz',
  'bearfanz', 'cougarfanz', 'gayfanz', 'femmefanz', 'guyz',
  'dlbroz', 'southernfanz', 'fanzuncut',

  // Extended Platforms
  'fanzdash', 'fanzmoneydash', 'fanzfinance', 'fanzhub', 'fanzcentral',
  'fanztube', 'fanzclips', 'fanzlive', 'fanzstream', 'fanzcam',
  'fanzpay', 'fanzcoin', 'fanzvault', 'fanzsecure', 'fanzshield',
  'fanzprotect', 'fanzdefender', 'fanzguard', 'fanzlock', 'fanzsafe',

  // Niche Platforms
  'daddyfanz', 'mommyfanz', 'milfanz', 'dilfanz', 'twinkfanz',
  'otterfa nz', 'cubfanz', 'studfanz', 'jockfanz', 'geekfanz',
  'gothfanz', 'emofanz', 'punkfanz', 'metalfanz', 'hipsterfanz',
  'skaterfa nz', 'surferfa nz', 'yogafanz', 'fitfanz', 'muscleaf nz',

  // International Platforms
  'fanzasia', 'fanzeurope', 'fanzlatam', 'fanzafrica', 'fanzaustralia',
  'fanzcanada', 'fanzuk', 'fanzfrance', 'fanzgermany', 'fanzspain',
  'fanzitaly', 'fanzbrazil', 'fanzmexic o', 'fanzjapan', 'fanzkorea',
  'fanzchina', 'fanzindia', 'fanzrussia', 'fanzpoland', 'fanzturkey',

  // Specialty Platforms
  'cosplayfanz', 'gam erfanz', 'techfanz', 'artfanz', 'musicfanz',
  'dancefanz', 'actorfanz', 'modelfanz', 'athletefanz', 'cheffanz',
  'teacherfanz', 'nursefanz', 'firefighterfanz', 'policefanz', 'militaryfanz',

  // Plus Size & Body Positive
  'plusfanz', 'curvyfanz', 'thickfanz', 'bbwfanz', 'bhfanz',

  // Age Groups
  'maturefanz', 'vintag efanz', 'silverfanz', 'goldenfa nz', 'primefanz',

  // Additional Niche
  'leatherfanz', 'latexfanz', 'fetishfanz', 'kinkfanz', 'bds mfanz'
];

export class PlatformPaymentConfigService {
  private configs = new Map<string, PlatformPaymentConfig>();

  constructor() {
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default configurations for all platforms
   */
  private initializeDefaultConfigs(): void {
    // Create default config template
    ALL_PLATFORMS.forEach(platformId => {
      const config: PlatformPaymentConfig = {
        platformId,
        platformName: this.getPlatformDisplayName(platformId),
        enabled: true,
        ccbill: {
          merchantId: `CCBILL_${platformId.toUpperCase()}_MERCHANT_ID`,
          subAccount: `CCBILL_${platformId.toUpperCase()}_SUBACCOUNT`,
          formName: `CCBILL_${platformId.toUpperCase()}_FORM`,
          salt: `CCBILL_${platformId.toUpperCase()}_SALT`
        },
        segpay: {
          packageId: `SEGPAY_${platformId.toUpperCase()}_PACKAGE`,
          merchantId: `SEGPAY_${platformId.toUpperCase()}_MERCHANT`,
          accessKey: `SEGPAY_${platformId.toUpperCase()}_ACCESS_KEY`
        },
        epoch: {
          merchantId: `EPOCH_${platformId.toUpperCase()}_MERCHANT`,
          secretKey: `EPOCH_${platformId.toUpperCase()}_SECRET`
        },
        crypto: {
          coinbaseCommerceApiKey: process.env.COINBASE_COMMERCE_API_KEY,
          nowpaymentsApiKey: process.env.NOWPAYMENTS_API_KEY,
          coinpaymentsPublicKey: process.env.COINPAYMENTS_PUBLIC_KEY,
          coinpaymentsPrivateKey: process.env.COINPAYMENTS_PRIVATE_KEY
        },
        payouts: {
          paxumApiKey: process.env.PAXUM_API_KEY,
          paxumApiSecret: process.env.PAXUM_API_SECRET,
          epayserviceApiKey: process.env.EPAYSERVICE_API_KEY,
          cosmoPaymentApiKey: process.env.COSMO_PAYMENT_API_KEY
        },
        settings: {
          defaultCurrency: 'USD',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BTC', 'ETH'],
          escrowEnabled: true,
          escrowHoldDays: 7,
          minTransactionAmount: 5,
          maxTransactionAmount: 10000,
          platformFeePercentage: 15,
          customContentEnabled: true
        },
        created: new Date(),
        updated: new Date()
      };

      this.configs.set(platformId, config);
    });

    console.log(`✅ Initialized payment configs for ${ALL_PLATFORMS.length} platforms`);
  }

  /**
   * Get platform display name
   */
  private getPlatformDisplayName(platformId: string): string {
    return platformId
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get payment config for specific platform
   */
  getConfig(platformId: string): PlatformPaymentConfig | undefined {
    return this.configs.get(platformId);
  }

  /**
   * Update platform payment config
   */
  updateConfig(platformId: string, updates: Partial<PlatformPaymentConfig>): PlatformPaymentConfig {
    const existing = this.configs.get(platformId);

    if (!existing) {
      throw new Error(`Platform ${platformId} not found`);
    }

    const updated = {
      ...existing,
      ...updates,
      updated: new Date()
    };

    this.configs.set(platformId, updated);

    console.log(`🔄 Updated payment config for ${platformId}`);

    return updated;
  }

  /**
   * Get all platform configs
   */
  getAllConfigs(): PlatformPaymentConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get enabled platforms
   */
  getEnabledPlatforms(): PlatformPaymentConfig[] {
    return Array.from(this.configs.values()).filter(c => c.enabled);
  }

  /**
   * Enable/disable platform
   */
  setPlatformStatus(platformId: string, enabled: boolean): PlatformPaymentConfig {
    const config = this.configs.get(platformId);

    if (!config) {
      throw new Error(`Platform ${platformId} not found`);
    }

    config.enabled = enabled;
    config.updated = new Date();

    console.log(`${enabled ? '✅' : '❌'} ${platformId} payment processing ${enabled ? 'enabled' : 'disabled'}`);

    return config;
  }

  /**
   * Get platforms by region
   */
  getPlatformsByRegion(region: string): PlatformPaymentConfig[] {
    const regionalPlatforms = ALL_PLATFORMS.filter(p =>
      p.includes(region.toLowerCase()) ||
      (region === 'US' && !p.includes('europe') && !p.includes('asia'))
    );

    return regionalPlatforms
      .map(p => this.configs.get(p))
      .filter(Boolean) as PlatformPaymentConfig[];
  }

  /**
   * Bulk update all platforms
   */
  bulkUpdate(updates: Partial<PlatformPaymentConfig>): void {
    this.configs.forEach((config, platformId) => {
      this.updateConfig(platformId, updates);
    });

    console.log(`🔄 Bulk updated ${this.configs.size} platform configs`);
  }

  /**
   * Export platform configs as environment variables
   */
  exportEnvVars(platformId: string): string {
    const config = this.configs.get(platformId);

    if (!config) {
      throw new Error(`Platform ${platformId} not found`);
    }

    const prefix = platformId.toUpperCase();

    return `
# ${config.platformName} Payment Configuration

# CCBill
${prefix}_CCBILL_MERCHANT_ID="${config.ccbill.merchantId}"
${prefix}_CCBILL_SUBACCOUNT="${config.ccbill.subAccount}"
${prefix}_CCBILL_FORM_NAME="${config.ccbill.formName}"
${prefix}_CCBILL_SALT="${config.ccbill.salt}"

# Segpay
${prefix}_SEGPAY_PACKAGE_ID="${config.segpay.packageId}"
${prefix}_SEGPAY_MERCHANT_ID="${config.segpay.merchantId}"
${prefix}_SEGPAY_ACCESS_KEY="${config.segpay.accessKey}"

# Epoch
${prefix}_EPOCH_MERCHANT_ID="${config.epoch.merchantId}"
${prefix}_EPOCH_SECRET_KEY="${config.epoch.secretKey}"

# Settings
${prefix}_ESCROW_ENABLED=${config.settings.escrowEnabled}
${prefix}_ESCROW_HOLD_DAYS=${config.settings.escrowHoldDays}
${prefix}_PLATFORM_FEE=${config.settings.platformFeePercentage}
${prefix}_CUSTOM_CONTENT_ENABLED=${config.settings.customContentEnabled}
    `.trim();
  }
}

// Export singleton
export const platformPaymentConfig = new PlatformPaymentConfigService();
