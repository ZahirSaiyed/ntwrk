'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaMicrosoft } from 'react-icons/fa';

export default function SignIn() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = status === 'authenticated';

  const handleAuth = async () => {
    if (isAuthenticated) {
      signOut();
    } else {
      try {
        setIsLoading(true);
        console.log('Signing in with Microsoft Entra ID...');
        await signIn('microsoft-entra-id', { 
          callbackUrl: window.location.origin,
          redirect: true 
        });
      } catch (error) {
        console.error('Sign in error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Choose a provider to sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white py-3 text-lg"
          >
            <FaMicrosoft className="h-5 w-5" />
            <span>{isLoading ? 'Connecting...' : isAuthenticated ? 'Sign Out' : 'Sign in with Microsoft'}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 