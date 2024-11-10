'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function Auth() {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/contacts' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[#1E1E3F]">ntwrk</h1>
          </Link>
          <h2 className="mt-8 text-4xl font-bold text-[#1E1E3F]">
            Grow your network
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            Connect your email to automatically organize your professional relationships
          </p>
        </div>

        {/* Sign-in Options */}
        <div className="space-y-4">
          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 transition-all group"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
            <span className="text-[#1E1E3F] font-medium">Continue with Google</span>
            <svg 
              className="w-4 h-4 ml-2 text-gray-400 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border border-gray-200 opacity-50 cursor-not-allowed"
          >
            <Image src="/outlook-icon.svg" alt="Outlook" width={20} height={20} />
            <span className="text-[#1E1E3F] font-medium">Continue with Outlook</span>
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#FAFAFA] text-gray-500">or</span>
            </div>
          </div>

          <button 
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl border border-gray-200 opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-[#1E1E3F] font-medium">Import from CSV</span>
          </button>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-[#1E1E3F] hover:text-[#2D2D5F] font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#1E1E3F] hover:text-[#2D2D5F] font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
