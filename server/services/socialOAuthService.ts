import { db } from "../db";
import { socialOAuthConnections, profileUrlSpots } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// 🔗 SOCIAL MEDIA OAUTH & INTEGRATION SERVICE
// Handles OAuth flows, token management, and profile syncing for all social platforms

export interface OAuthProvider {
  provider: "google" | "facebook" | "twitter" | "tiktok" | "reddit" | "instagram" | "patreon";
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

export interface SocialProfile {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  followerCount?: number;
  verified?: boolean;
  profileUrl?: string;
  additionalData?: Record<string, any>;
}

export class SocialOAuthService {
  private static instance: SocialOAuthService;

  private constructor() {}

  static getInstance(): SocialOAuthService {
    if (!SocialOAuthService.instance) {
      SocialOAuthService.instance = new SocialOAuthService();
    }
    return SocialOAuthService.instance;
  }

  /**
   * Get OAuth provider configuration
   */
  private getProviderConfig(provider: string): OAuthProvider | null {
    const configs: Record<string, Partial<OAuthProvider>> = {
      google: {
        provider: "google",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.BASE_URL}/auth/google/callback`,
        scopes: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/analytics.readonly",
        ],
      },
      facebook: {
        provider: "facebook",
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        redirectUri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.BASE_URL}/auth/facebook/callback`,
        scopes: ["public_profile", "email", "pages_show_list", "ads_read"],
      },
      twitter: {
        provider: "twitter",
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        redirectUri: process.env.TWITTER_REDIRECT_URI || `${process.env.BASE_URL}/auth/twitter/callback`,
        scopes: ["tweet.read", "users.read", "follows.read", "offline.access"],
      },
      tiktok: {
        provider: "tiktok",
        clientId: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        redirectUri: process.env.TIKTOK_REDIRECT_URI || `${process.env.BASE_URL}/auth/tiktok/callback`,
        scopes: ["user.info.basic", "video.list", "user.info.stats"],
      },
      reddit: {
        provider: "reddit",
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        redirectUri: process.env.REDDIT_REDIRECT_URI || `${process.env.BASE_URL}/auth/reddit/callback`,
        scopes: ["identity", "read", "submit"],
      },
      instagram: {
        provider: "instagram",
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BASE_URL}/auth/instagram/callback`,
        scopes: ["user_profile", "user_media"],
      },
      patreon: {
        provider: "patreon",
        clientId: process.env.PATREON_CLIENT_ID,
        clientSecret: process.env.PATREON_CLIENT_SECRET,
        redirectUri: process.env.PATREON_REDIRECT_URI || `${process.env.BASE_URL}/auth/patreon/callback`,
        scopes: ["identity", "identity[email]", "campaigns", "w:campaigns.webhook"],
      },
    };

    const config = configs[provider];
    if (!config || !config.clientId || !config.clientSecret) {
      return null;
    }

    return config as OAuthProvider;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(
    provider: string,
    state: string,
    additionalParams?: Record<string, string>
  ): string | null {
    const config = this.getProviderConfig(provider);
    if (!config) return null;

    const authUrls: Record<string, string> = {
      google: "https://accounts.google.com/o/oauth2/v2/auth",
      facebook: "https://www.facebook.com/v18.0/dialog/oauth",
      twitter: "https://twitter.com/i/oauth2/authorize",
      tiktok: "https://www.tiktok.com/v2/auth/authorize/",
      reddit: "https://www.reddit.com/api/v1/authorize",
      instagram: "https://api.instagram.com/oauth/authorize",
      patreon: "https://www.patreon.com/oauth2/authorize",
    };

    const baseUrl = authUrls[provider];
    if (!baseUrl) return null;

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      state,
      scope: config.scopes.join(" "),
      ...additionalParams,
    });

    // Provider-specific adjustments
    if (provider === "twitter") {
      params.set("code_challenge", "challenge");
      params.set("code_challenge_method", "plain");
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    provider: string,
    code: string,
    codeVerifier?: string
  ): Promise<OAuthTokens | null> {
    const config = this.getProviderConfig(provider);
    if (!config) return null;

    const tokenUrls: Record<string, string> = {
      google: "https://oauth2.googleapis.com/token",
      facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
      twitter: "https://api.twitter.com/2/oauth2/token",
      tiktok: "https://open-api.tiktok.com/oauth/access_token/",
      reddit: "https://www.reddit.com/api/v1/access_token",
      instagram: "https://api.instagram.com/oauth/access_token",
      patreon: "https://www.patreon.com/api/oauth2/token",
    };

    const tokenUrl = tokenUrls[provider];
    if (!tokenUrl) return null;

    try {
      const body: Record<string, string> = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      };

      if (codeVerifier) {
        body.code_verifier = codeVerifier;
      }

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(provider === "reddit" ? {
            Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
          } : {}),
        },
        body: new URLSearchParams(body),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`${provider} token exchange failed:`, error);
        return null;
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        scope: data.scope,
      };
    } catch (error) {
      console.error(`Error exchanging code for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    provider: string,
    refreshToken: string
  ): Promise<OAuthTokens | null> {
    const config = this.getProviderConfig(provider);
    if (!config) return null;

    const tokenUrls: Record<string, string> = {
      google: "https://oauth2.googleapis.com/token",
      facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
      twitter: "https://api.twitter.com/2/oauth2/token",
      tiktok: "https://open-api.tiktok.com/oauth/refresh_token/",
      reddit: "https://www.reddit.com/api/v1/access_token",
      patreon: "https://www.patreon.com/api/oauth2/token",
    };

    const tokenUrl = tokenUrls[provider];
    if (!tokenUrl) return null;

    try {
      const body: Record<string, string> = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      };

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(provider === "reddit" ? {
            Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
          } : {}),
        },
        body: new URLSearchParams(body),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`${provider} token refresh failed:`, error);
        return null;
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        scope: data.scope,
      };
    } catch (error) {
      console.error(`Error refreshing token for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Fetch user profile from provider
   */
  async fetchProfile(provider: string, accessToken: string): Promise<SocialProfile | null> {
    const profileUrls: Record<string, string> = {
      google: "https://www.googleapis.com/oauth2/v2/userinfo",
      facebook: "https://graph.facebook.com/me?fields=id,name,email,picture",
      twitter: "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified",
      tiktok: "https://open-api.tiktok.com/user/info/?fields=open_id,union_id,avatar_url,display_name",
      reddit: "https://oauth.reddit.com/api/v1/me",
      instagram: "https://graph.instagram.com/me?fields=id,username,account_type,media_count",
      patreon: "https://www.patreon.com/api/oauth2/v2/identity?fields[user]=email,full_name,image_url,thumb_url",
    };

    const profileUrl = profileUrls[provider];
    if (!profileUrl) return null;

    try {
      const response = await fetch(profileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${provider} profile:`, await response.text());
        return null;
      }

      const data = await response.json();

      // Parse provider-specific response format
      switch (provider) {
        case "google":
          return {
            id: data.id,
            email: data.email,
            displayName: data.name,
            avatar: data.picture,
            verified: data.verified_email,
          };

        case "facebook":
          return {
            id: data.id,
            displayName: data.name,
            email: data.email,
            avatar: data.picture?.data?.url,
          };

        case "twitter":
          return {
            id: data.data.id,
            username: data.data.username,
            displayName: data.data.name,
            avatar: data.data.profile_image_url,
            verified: data.data.verified,
            followerCount: data.data.public_metrics?.followers_count,
            profileUrl: `https://twitter.com/${data.data.username}`,
          };

        case "tiktok":
          return {
            id: data.data.user.open_id,
            username: data.data.user.display_name,
            displayName: data.data.user.display_name,
            avatar: data.data.user.avatar_url,
          };

        case "reddit":
          return {
            id: data.id,
            username: data.name,
            displayName: data.name,
            avatar: data.icon_img,
            verified: data.verified,
          };

        case "instagram":
          return {
            id: data.id,
            username: data.username,
            followerCount: data.followers_count,
          };

        case "patreon":
          return {
            id: data.data.id,
            email: data.data.attributes.email,
            displayName: data.data.attributes.full_name,
            avatar: data.data.attributes.image_url,
          };

        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching ${provider} profile:`, error);
      return null;
    }
  }

  /**
   * Save OAuth connection to database
   */
  async saveConnection(
    userId: string,
    provider: string,
    tokens: OAuthTokens,
    profile: SocialProfile
  ): Promise<any> {
    try {
      // Check if connection already exists
      const existing = await db
        .select()
        .from(socialOAuthConnections)
        .where(
          and(
            eq(socialOAuthConnections.userId, userId),
            eq(socialOAuthConnections.provider, provider)
          )
        )
        .limit(1);

      const connectionData = {
        userId,
        provider,
        providerAccountId: profile.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.expiresAt,
        scope: tokens.scope,
        profileData: profile as any,
        isActive: true,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        // Update existing connection
        const result = await db
          .update(socialOAuthConnections)
          .set(connectionData)
          .where(eq(socialOAuthConnections.id, existing[0].id))
          .returning();

        return result[0];
      } else {
        // Create new connection
        const result = await db
          .insert(socialOAuthConnections)
          .values(connectionData)
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error("Error saving OAuth connection:", error);
      throw error;
    }
  }

  /**
   * Get user's OAuth connections
   */
  async getUserConnections(userId: string, provider?: string) {
    try {
      if (provider) {
        return await db
          .select()
          .from(socialOAuthConnections)
          .where(
            and(
              eq(socialOAuthConnections.userId, userId),
              eq(socialOAuthConnections.provider, provider),
              eq(socialOAuthConnections.isActive, true)
            )
          );
      }

      return await db
        .select()
        .from(socialOAuthConnections)
        .where(
          and(
            eq(socialOAuthConnections.userId, userId),
            eq(socialOAuthConnections.isActive, true)
          )
        );
    } catch (error) {
      console.error("Error fetching user connections:", error);
      return [];
    }
  }

  /**
   * Refresh token if expired
   */
  async ensureValidToken(connectionId: string): Promise<string | null> {
    try {
      const connections = await db
        .select()
        .from(socialOAuthConnections)
        .where(eq(socialOAuthConnections.id, connectionId))
        .limit(1);

      if (connections.length === 0) return null;

      const connection = connections[0];

      // Check if token is expired
      if (connection.tokenExpiry && new Date() >= connection.tokenExpiry) {
        if (!connection.refreshToken) {
          console.error("Token expired and no refresh token available");
          return null;
        }

        // Refresh the token
        const newTokens = await this.refreshAccessToken(
          connection.provider,
          connection.refreshToken
        );

        if (!newTokens) {
          console.error("Failed to refresh token");
          return null;
        }

        // Update database
        await db
          .update(socialOAuthConnections)
          .set({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken || connection.refreshToken,
            tokenExpiry: newTokens.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(socialOAuthConnections.id, connectionId));

        return newTokens.accessToken;
      }

      return connection.accessToken;
    } catch (error) {
      console.error("Error ensuring valid token:", error);
      return null;
    }
  }

  /**
   * Disconnect OAuth connection
   */
  async disconnect(userId: string, provider: string): Promise<boolean> {
    try {
      await db
        .update(socialOAuthConnections)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialOAuthConnections.userId, userId),
            eq(socialOAuthConnections.provider, provider)
          )
        );

      return true;
    } catch (error) {
      console.error("Error disconnecting OAuth:", error);
      return false;
    }
  }

  /**
   * Save profile URL spot
   */
  async saveProfileUrl(
    userId: string,
    platformId: string,
    urlType: string,
    url: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      // Check if URL spot already exists
      const existing = await db
        .select()
        .from(profileUrlSpots)
        .where(
          and(
            eq(profileUrlSpots.userId, userId),
            eq(profileUrlSpots.platformId, platformId),
            eq(profileUrlSpots.urlType, urlType)
          )
        )
        .limit(1);

      const urlData = {
        userId,
        platformId,
        urlType,
        url,
        displayText: metadata?.displayText,
        iconUrl: metadata?.iconUrl,
        sortOrder: metadata?.sortOrder || 0,
        isVerified: metadata?.isVerified || false,
        isActive: true,
        metadata: metadata || {},
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        const result = await db
          .update(profileUrlSpots)
          .set(urlData)
          .where(eq(profileUrlSpots.id, existing[0].id))
          .returning();

        return result[0];
      } else {
        const result = await db
          .insert(profileUrlSpots)
          .values(urlData)
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error("Error saving profile URL:", error);
      throw error;
    }
  }

  /**
   * Get user's profile URLs
   */
  async getProfileUrls(userId: string, platformId?: string) {
    try {
      if (platformId) {
        return await db
          .select()
          .from(profileUrlSpots)
          .where(
            and(
              eq(profileUrlSpots.userId, userId),
              eq(profileUrlSpots.platformId, platformId),
              eq(profileUrlSpots.isActive, true)
            )
          );
      }

      return await db
        .select()
        .from(profileUrlSpots)
        .where(
          and(
            eq(profileUrlSpots.userId, userId),
            eq(profileUrlSpots.isActive, true)
          )
        );
    } catch (error) {
      console.error("Error fetching profile URLs:", error);
      return [];
    }
  }
}

// Export singleton instance
export const socialOAuthService = SocialOAuthService.getInstance();
