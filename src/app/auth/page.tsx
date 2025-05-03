'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Auth() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/contacts' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F4F4FF] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className={`max-w-5xl w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Value Proposition */}
          <div className="text-center md:text-left">
            <div className="mb-4">
              <Link href="/" className="inline-block">
                <h1 className="text-2xl font-bold text-[#1E1E3F]">Node</h1>
              </Link>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1E3F] mb-4">Your Network,<br />Simplified</h2>
            
            <div className="mb-4">
              <p className="text-gray-600 text-sm md:text-base">Node helps you understand your connections with minimal data access:</p>
            </div>

            <div className="space-y-2 text-gray-600 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 ${isLoaded ? 'scale-100' : 'scale-0'}`}>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Only <span className="font-semibold text-[#1E1E3F]">basic email headers</span> — no content or subjects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 delay-100 ${isLoaded ? 'scale-100' : 'scale-0'}`}>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Your data is <span className="font-semibold text-[#1E1E3F]">never stored</span> or <span className="font-semibold text-[#1E1E3F]">sold</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 delay-200 ${isLoaded ? 'scale-100' : 'scale-0'}`}>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm"><span className="font-semibold text-[#1E1E3F]">Read-only access</span> with transparent permissions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 transition-transform duration-500 delay-300 ${isLoaded ? 'scale-100' : 'scale-0'}`}>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm"><span className="font-semibold text-[#1E1E3F]">You control access</span> and can revoke anytime</span>
              </div>
            </div>

            <div className="mb-1">
              <p className="text-gray-500 text-xs font-medium">Learn more about our privacy approach:</p>
            </div>
            <div className="space-y-2 mb-6">
              <Link 
                href="/demo" 
                className="w-full text-xs text-[#1E1E3F]/80 bg-[#F4F4FF]/70 hover:bg-[#E8E8FF]/80 px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-200 border border-[#1E1E3F]/10 group hover:shadow-sm"
              >
                <div className="bg-[#1E1E3F]/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-[#1E1E3F]/15">
                  <svg className="w-5 h-5 text-[#1E1E3F]/80 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Watch a 2-min Demo</span>
                  <span className="text-xs text-[#1E1E3F]/60">No account needed</span>
                </div>
                <svg className="w-3.5 h-3.5 ml-auto text-[#1E1E3F]/40 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full text-xs text-[#1E1E3F]/80 bg-[#F4F4FF]/70 hover:bg-[#E8E8FF]/80 px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-200 border border-[#1E1E3F]/10 group hover:shadow-sm"
              >
                <div className="bg-[#1E1E3F]/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-[#1E1E3F]/15">
                  <svg className="w-5 h-5 text-[#1E1E3F]/80 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">View Data Details</span>
                  <span className="text-xs text-[#1E1E3F]/60">See what we access — and what we don't</span>
                </div>
                <svg className="w-3.5 h-3.5 ml-auto text-[#1E1E3F]/40 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Sign In */}
          <div className="bg-white rounded-2xl p-8 border border-[#1E1E3F]/10 shadow-md relative z-10 transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
            {/* Sign In Options */}
            <div className="space-y-6">
              <div className="mb-2 text-center">
                <h3 className="text-xl font-semibold text-[#1E1E3F] mb-1">Get Started</h3>
                <p className="text-sm text-gray-500">Connect your account to visualize your network</p>
              </div>
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
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#1E1E3F] hover:text-[#2D2D5F] font-medium">
                Terms
              </Link>{' '}
              &{' '}
              <Link href="/privacy" className="text-[#1E1E3F] hover:text-[#2D2D5F] font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-xl w-full mx-auto shadow-lg border border-[#1E1E3F]/10 animate-scale-in my-4 sm:my-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-[#1E1E3F]">Your Data Security</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <p className="text-gray-600 text-base sm:text-lg">
                Node requires minimal Gmail access to build your contact network while ensuring your privacy.
              </p>
              
              <div className="border-t border-[#1E1E3F]/10 pt-3">
                <h4 className="text-[#1E1E3F] font-medium text-base sm:text-lg mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  What Node DOES access:
                </h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                    <div>
                      <span className="font-medium">Email headers only</span>
                      <p className="text-sm text-gray-600">From, To, Cc, Bcc fields to identify who you've communicated with</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                    <div>
                      <span className="font-medium">Email timestamps</span>
                      <p className="text-sm text-gray-600">To determine when you last interacted with a contact</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                    <div>
                      <span className="font-medium">Your name & email</span>
                      <p className="text-sm text-gray-600">For account identification and personalization</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#1E1E3F]/10 pt-3">
                <h4 className="text-[#1E1E3F] font-medium text-base sm:text-lg mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  What Node DOES NOT access:
                </h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">✗</span>
                    <div>
                      <span className="font-medium">Email content/body & subject lines</span>
                      <p className="text-sm text-gray-600">We never read the contents of your emails or access subject lines</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">✗</span>
                    <div>
                      <span className="font-medium">Attachments</span>
                      <p className="text-sm text-gray-600">We don't access or process any file attachments</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">✗</span>
                    <div>
                      <span className="font-medium">Google Drive or other Google services</span>
                      <p className="text-sm text-gray-600">We only access the minimal Gmail data needed</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#1E1E3F]/10 pt-3">
                <h4 className="text-[#1E1E3F] font-medium text-base sm:text-lg mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Our Promise to You:
                </h4>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-3 bg-[#F4F4FF] p-3 rounded-lg transition-transform hover:scale-[1.01]">
                    <svg className="w-5 h-5 text-[#1E1E3F] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-[#1E1E3F]">Temporary Processing Only</p>
                      <p className="text-sm text-gray-600">We process your data in-memory and never store email content.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-[#F4F4FF] p-3 rounded-lg transition-transform hover:scale-[1.01]">
                    <svg className="w-5 h-5 text-[#1E1E3F] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-[#1E1E3F]">No Data Selling</p>
                      <p className="text-sm text-gray-600">Your data is never sold or shared with third parties.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-[#F4F4FF] p-3 rounded-lg transition-transform hover:scale-[1.01]">
                    <svg className="w-5 h-5 text-[#1E1E3F] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-[#1E1E3F]">You Control Access</p>
                      <p className="text-sm text-gray-600">You can revoke access at any time through your Google account.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#1E1E3F]/10 pt-3">
                <h4 className="text-[#1E1E3F] font-medium text-base sm:text-lg mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Technical Implementation:
                </h4>
                <div className="bg-[#F4F4FF] p-3 rounded-lg text-sm overflow-x-auto">
                  <p className="mb-2">Our Gmail API requests are specifically designed to prevent access to message content:</p>
                  <div className="font-mono bg-[#E8E8FF] p-2 rounded mb-2 text-xs">
                    <code>format: 'metadata',</code><br/>
                    <code>metadataHeaders: ['From', 'To', 'Cc', 'Bcc', 'Date', 'References', 'In-Reply-To', 'Message-ID']</code>
                  </div>
                  <p>The <span className="font-semibold">format: 'metadata'</span> parameter ensures we <span className="text-red-600 font-semibold">never</span> receive message bodies, and the <span className="font-semibold">metadataHeaders</span> list explicitly defines the only headers we request.</p>
                </div>
              </div>

              <div className="border-t border-[#1E1E3F]/10 pt-3">
                <h4 className="text-[#1E1E3F] font-medium text-base sm:text-lg mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  OAuth Scopes Used:
                </h4>
                <div className="bg-[#F4F4FF] p-3 rounded-lg text-sm font-mono overflow-x-auto">
                  <div><span className="text-purple-600">gmail.readonly</span> - Read-only access to basic email headers (From, To, Cc, Bcc, Date)</div>
                  <div><span className="text-purple-600">userinfo.email</span> - Verify your Google account identity only</div>
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">These are the minimal permissions required to build your network map.</p>
              </div>

              <div className="border-t border-[#1E1E3F]/10 pt-3">
                <h4 className="text-[#1E1E3F] font-medium text-base sm:text-lg mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  For Business Users:
                </h4>
                <div className="bg-[#F4F4FF] p-3 rounded-lg mb-2">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium text-[#1E1E3F]">Concerned about confidential business information?</span> We understand professional emails may contain sensitive client data.
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    We offer these options:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                    <li><span className="font-medium">Watch a demo video</span> to see exactly how Node works without connecting</li>
                    <li><span className="font-medium">Try with a personal account</span> first to evaluate privacy protection</li>
                  </ul>
                </div>
                <div className="flex justify-center mt-2">
                  <Link href="/demo" className="text-sm text-[#1E1E3F] hover:text-[#2D2D5F] inline-flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch demo video
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#1E1E3F]/10">
              <Link href="/privacy" className="text-[#1E1E3F] hover:text-[#2D2D5F] font-medium text-sm group">
                Read our full privacy policy <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
