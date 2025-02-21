import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

interface CustomSession extends DefaultSession {
  accessToken?: string;
  error?: string;
}

interface CustomToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: any; user: any }) {
      // Initial sign in
      if (account && user) {
        console.log('Auth - Initial sign in:', { 
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          hasUser: !!user
        });
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        console.log('Auth - Using existing token:', {
          hasAccessToken: !!token.accessToken,
          expiresIn: Math.round((token.accessTokenExpires as number - Date.now()) / 1000),
          hasUser: !!token.user
        });
        return token;
      }

      // Access token has expired, try to refresh it
      console.log('Auth - Token expired, attempting refresh');
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
          method: "POST",
        });

        const tokens = await response.json();

        if (!response.ok) throw tokens;

        console.log('Auth - Token refresh successful');
        return {
          ...token, // Preserve all existing token properties including user
          accessToken: tokens.access_token,
          accessTokenExpires: Date.now() + tokens.expires_in * 1000,
          // Fall back to old refresh token, but allow rotation of refresh token
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error("Auth - Error refreshing access token:", error);
        return {
          ...token, // Preserve user information even in error case
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }: { session: CustomSession; token: CustomToken }) {
      console.log('Auth - Creating session:', {
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error,
        hasUser: !!token.user
      });
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return `${baseUrl}${url}`;
      return "/overview";
    },
  },
  pages: {
    signIn: "/auth",
  },
};
