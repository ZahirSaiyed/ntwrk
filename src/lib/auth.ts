import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";
import { SessionStrategy } from "next-auth";

interface CustomSession extends DefaultSession {
  accessToken?: string;
  provider?: string;
}

interface CustomToken extends JWT {
  accessToken?: string;
  provider?: string;
}

// Check and log essential environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

console.log("Environment variables check:");
console.log(`GOOGLE_CLIENT_ID exists: ${!!googleClientId}`);
console.log(`GOOGLE_CLIENT_SECRET exists: ${!!googleClientSecret}`);
console.log(`MICROSOFT_CLIENT_ID exists: ${!!microsoftClientId}`);
console.log(`MICROSOFT_CLIENT_SECRET exists: ${!!microsoftClientSecret}`);
console.log(`NEXTAUTH_SECRET exists: ${!!nextAuthSecret}`);

// Ensure the credentials exist
if (!googleClientId || !googleClientSecret) {
  console.error("Missing Google OAuth credentials. Please check your .env.local file.");
}

if (!microsoftClientId || !microsoftClientSecret) {
  console.error("Missing Microsoft Entra ID credentials. Please check your .env.local file.");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly"
        },
      },
    }),
    AzureADProvider({
      id: "microsoft-entra-id",
      clientId: microsoftClientId || "",
      clientSecret: microsoftClientSecret || "",
      tenantId: "common", // Use 'common' for multi-tenant support
      authorization: {
        params: {
          scope: "openid profile email offline_access https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.Read",
          response_type: "code",
          prompt: "consent"
        }
      },
      client: {
        token_endpoint_auth_method: "client_secret_post"
      },
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: any }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession, token: CustomToken }) {
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/contacts`;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
  debug: process.env.AUTH_DEBUG === "true",
};
