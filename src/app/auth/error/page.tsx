'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F4F4FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-800">
              {error === 'OAuthSignin' && 'Error signing in with Google. Please try again.'}
              {error === 'Configuration' && 'There is an issue with the server configuration.'}
              {error === 'AccessDenied' && 'You do not have permission to access this resource.'}
              {!error && 'An unknown error occurred during authentication.'}
            </p>
            
            {error && (
              <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700 font-mono overflow-auto">
                Error code: {error}
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <p className="text-gray-600 mb-4">
              Please check that the application is properly configured with valid Google OAuth credentials.
            </p>
            
            <Link 
              href="/auth" 
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 