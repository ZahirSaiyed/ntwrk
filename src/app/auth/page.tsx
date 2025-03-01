'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Auth page - Initial load:', {
      status,
      isAuthenticated: status === 'authenticated'
    });
    
    setIsLoaded(true);
    if (status === 'authenticated') {
      console.log('Auth page - Redirecting to contacts');
      router.push('/contacts');
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { 
      callbackUrl: '/contacts'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F4F4FF] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className={`max-w-5xl w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Value Proposition */}
          <div className="text-center md:text-left">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <h1 className="text-2xl font-bold text-[#1E1E3F]">Node</h1>
              </Link>
            </div>
            <h2 className="text-4xl font-bold text-[#1E1E3F] mb-6">Your Network,<br />Simplified</h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 ${isLoaded ? 'scale-100' : 'scale-0'}`}>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>We only fetch the <span className="font-semibold text-[#1E1E3F]">minimal data required</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 delay-100 ${isLoaded ? 'scale-100' : 'scale-0'}`}>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Your data is <span className="font-semibold text-[#1E1E3F]">never stored</span> or <span className="font-semibold text-[#1E1E3F]">sold</span></span>
              </div>
            </div>
          </div>

          {/* Right Column - Sign In */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-[#1E1E3F]/10 shadow-sm">
            {/* Sign In Options */}
            <div className="space-y-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                  <button 
                    onClick={() => setError(null)}
                    className="float-right text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button 
                onClick={handleGoogleSignIn}
                className={`w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-white rounded-xl hover:bg-[#1E1E3F]/5 border border-[#1E1E3F]/10 transition-all group relative shadow-sm hover:shadow-md ${isLoaded ? 'animate-subtle-pulse' : ''}`}
              >
                <Image src="/google-icon.svg" alt="Google" width={24} height={24} />
                <span className="text-[#1E1E3F] font-medium">Continue with Google</span>
                <svg 
                  className="w-5 h-5 ml-2 text-[#1E1E3F]/40 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="flex justify-center">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-[#1E1E3F] hover:text-[#2D2D5F] underline inline-flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why do we need access?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1E1E3F]/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-gray-400">More options coming soon</span>
                </div>
              </div>

              <div className="opacity-40">
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#1E1E3F]/10 cursor-not-allowed shadow-sm"
                >
                  <Image src="/outlook-icon.svg" alt="Outlook" width={24} height={24} />
                  <span className="text-[#1E1E3F] font-medium">Outlook</span>
                </button>
              </div>
            </div>

            {/* Terms Text - Simplified */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-auto shadow-lg border border-[#1E1E3F]/10 animate-scale-in">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-semibold text-[#1E1E3F]">Why We Ask for Access</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                We're committed to your privacy. Here's how we handle your data:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 bg-[#F4F4FF] p-4 rounded-lg transition-transform hover:scale-[1.02]">
                  <svg className="w-6 h-6 text-[#1E1E3F] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#1E1E3F]">Minimal Access</p>
                    <p className="text-gray-600">We only access data necessary to provide you with meaningful insights.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 bg-[#F4F4FF] p-4 rounded-lg transition-transform hover:scale-[1.02]">
                  <svg className="w-6 h-6 text-[#1E1E3F] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#1E1E3F]">Temporary Use</p>
                    <p className="text-gray-600">Your data is fetched, used for processing, and never stored.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 bg-[#F4F4FF] p-4 rounded-lg transition-transform hover:scale-[1.02]">
                  <svg className="w-6 h-6 text-[#1E1E3F] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#1E1E3F]">No Selling</p>
                    <p className="text-gray-600">We never sell or share your data. Privacy is our core value.</p>
                  </div>
                </li>
              </ul>
              <div className="flex items-center justify-between pt-4">
                <Link href="/privacy" className="text-[#1E1E3F] hover:text-[#2D2D5F] font-medium text-sm group">
                  Read our privacy policy <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
