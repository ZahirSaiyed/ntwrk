import { Inter } from 'next/font/google';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Modern Network - Connect, Collaborate, Create',
  description: 'A next-generation platform for professional networking and collaboration',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
