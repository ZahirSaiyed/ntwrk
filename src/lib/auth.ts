import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

interface CustomSession extends DefaultSession {
  accessToken?: string;
}

interface CustomToken extends JWT {
  accessToken?: string;
}

// Check and log essential environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

console.log("Environment variables check:");
console.log(`GOOGLE_CLIENT_ID exists: ${!!googleClientId}`);
console.log(`GOOGLE_CLIENT_SECRET exists: ${!!googleClientSecret}`);
console.log(`NEXTAUTH_SECRET exists: ${!!nextAuthSecret}`);

// Ensure the credentials exist
if (!googleClientId || !googleClientSecret) {
  console.error("Missing Google OAuth credentials. Please check your .env.local file.");
}

export const authOptions = {
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
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
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession, token: CustomToken }) {
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith('/')) return `${baseUrl}${url}`;
      return '/overview';
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error', // Add an error page to better capture issues
  },
  debug: true, // Enable debug for all environments temporarily to troubleshoot
};
