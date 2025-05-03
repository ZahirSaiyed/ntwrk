import { Inter } from 'next/font/google';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Node - Connect, Collaborate, Create',
  description: 'A next-generation platform for professional networking and collaboration',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers session={session}>
          <div className="min-h-screen bg-[#FAFAFA]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
