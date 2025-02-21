'use client';

import Image from 'next/image';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-red-600 mb-4">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-[#1E1E3F] text-white rounded-full hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#1E1E3F]/20 border-t-[#1E1E3F] rounded-full animate-spin"></div>
    </div>
  );
}

// Main content component
function HomeContent() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    "Organize contacts intelligently 🧠",
    "Stay on top of relationships ⭐️",
    "Protect your privacy 🔒",
    "Get smart insights 📊",
    "Automate your networking 🚀",
    "Never miss a follow-up ⏰"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-[#1E1E3F] hover:scale-105 transition-transform">
              Node
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {status === 'loading' ? (
                <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-full"></div>
              ) : session ? (
                <Link 
                  href="/contacts" 
                  className="px-6 py-2.5 bg-[#1E1E3F] text-white rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out"
                >
                  View Your Network
                </Link>
              ) : (
                <Link 
                  href="/auth" 
                  className="px-6 py-2.5 bg-[#1E1E3F] text-white rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="text-center relative">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#1E1E3F] mb-6 leading-tight">
              Your network,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1E1E3F] via-purple-600 to-pink-500 animate-gradient">
                intelligently managed
              </span>
            </h1>

            <div className="h-8 mb-6">
              <p className="text-xl text-gray-600 transition-all duration-300 transform">
                {features[currentFeature]}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {status === 'loading' ? (
                <div className="w-48 h-14 bg-gray-200 animate-pulse rounded-full"></div>
              ) : session ? (
                <Link 
                  href="/contacts" 
                  className="group px-8 py-4 bg-gradient-to-r from-[#1E1E3F] via-[#2D2D5F] to-[#1E1E3F] text-white rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <span>View Your Network</span>
                  <svg 
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth" 
                    className="group px-8 py-4 bg-gradient-to-r from-[#1E1E3F] via-[#2D2D5F] to-[#1E1E3F] text-white rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center"
                  >
                    <span>Try it free</span>
                    <svg 
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </Link>
                  <Link 
                    href="/demo" 
                    className="group px-8 py-4 bg-white text-[#1E1E3F] rounded-full hover:scale-105 hover:shadow-md transition-all duration-300 flex items-center border border-[#1E1E3F]/10"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>Watch demo</span>
                  </Link>
                </>
              )}
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="group bg-gradient-to-b from-white to-[#F4F4FF] p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-xl border border-[#1E1E3F]/5">
                <div className="w-14 h-14 bg-[#F4F4FF] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <svg className="w-7 h-7 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Lightning Fast</h3>
                <p className="text-gray-600 text-center">
                  Connect and organize your network in seconds. No complex setup needed.
                </p>
              </div>

              <div className="group bg-gradient-to-b from-white to-[#F4F4FF] p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-xl border border-[#1E1E3F]/5">
                <div className="w-14 h-14 bg-[#F4F4FF] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <svg className="w-7 h-7 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Smart Tools</h3>
                <p className="text-gray-600 text-center">
                  Intelligent insights and automated organization at your fingertips.
                </p>
              </div>

              <div className="group bg-gradient-to-b from-white to-[#F4F4FF] p-8 rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-xl border border-[#1E1E3F]/5">
                <div className="w-14 h-14 bg-[#F4F4FF] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <svg className="w-7 h-7 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Privacy First</h3>
                <p className="text-gray-600 text-center">
                  Your data stays private and secure. Always under your control.
                </p>
              </div>
            </div>

            {/* Add subtle separator */}
            <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-[#1E1E3F]/10 to-transparent my-12"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 mb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-[#1E1E3F]">
                Smart features,
                <br />
                smarter networking
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#F4F4FF] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Organization</h3>
                    <p className="text-gray-600 text-sm">Automatically categorize and tag your contacts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#F4F4FF] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Intelligent Reminders</h3>
                    <p className="text-gray-600 text-sm">Never miss important follow-ups</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#F4F4FF] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Network Analytics</h3>
                    <p className="text-gray-600 text-sm">Get insights into your networking effectiveness</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-10 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:scale-[1.02] transition-transform border border-[#1E1E3F]/5">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[#1E1E3F]">JD</span>
                      </div>
                      <div>
                        <div className="font-medium">John Doe</div>
                        <div className="text-sm text-gray-500">Last contact: 2 weeks ago</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Follow up</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[#1E1E3F]">AS</span>
                      </div>
                      <div>
                        <div className="font-medium">Alice Smith</div>
                        <div className="text-sm text-gray-500">Strong connection</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[#1E1E3F]">RJ</span>
                      </div>
                      <div>
                        <div className="font-medium">Robert Johnson</div>
                        <div className="text-sm text-gray-500">New connection</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">New</span>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Network health</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-16 h-2 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
                        <span className="text-green-600 font-medium">Good</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1E1E3F] via-[#2D2D5F] to-[#1E1E3F] relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your network?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the future of intelligent networking. Your relationships deserve better.
          </p>
          {!session ? (
            <Link 
              href="/auth" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-white via-gray-50 to-white text-[#1E1E3F] rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Get Started For Free
            </Link>
          ) : (
            <Link 
              href="/contacts" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-white via-gray-50 to-white text-[#1E1E3F] rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              View Your Network
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 Node</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#1E1E3F] transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-[#1E1E3F] transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .bg-gradient-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// Main export
export default function Home() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <HomeContent />
      </Suspense>
    </ErrorBoundary>
  );
}
