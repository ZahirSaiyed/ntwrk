'use client';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-[#1E1E3F]">
              Node
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auth" className="px-6 py-2 bg-[#1E1E3F] text-white rounded-full hover:bg-[#2D2D5F] transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#1E1E3F] mb-6 leading-tight">
              Your network,
              <br />
              simplified
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Keep track of your professional relationships without the complexity.
              Clean, simple, effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth" 
                className="px-8 py-4 bg-[#1E1E3F] text-white rounded-full hover:bg-[#2D2D5F] transition-all flex items-center group"
              >
                <span>Try it for free</span>
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
                className="px-8 py-4 border border-[#1E1E3F] text-[#1E1E3F] rounded-full hover:bg-[#F4F4FF] transition-all flex items-center"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          {/* Primary Features - Most Valuable */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Email Sync - Starting Point */}
            <div className="text-center transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-[#F4F4FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Setup</h3>
              <p className="text-gray-600">
                Connect your email and instantly import your professional network. Works with Gmail, Outlook, and more
              </p>
            </div>

            {/* Smart Organization - Core Value */}
            <div className="text-center transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-[#F4F4FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Organization</h3>
              <p className="text-gray-600">
                AI-powered contact categorization and tagging. Your network organizes itself
              </p>
            </div>

            {/* Follow-up Reminders - Key Outcome */}
            <div className="text-center transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-[#F4F4FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
              <p className="text-gray-600">
                Never miss important follow-ups with intelligent reminders based on relationship strength
              </p>
            </div>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-[#F4F4FF] rounded-2xl p-8">
              <h4 className="text-lg font-semibold mb-2">Network Analytics</h4>
              <p className="text-gray-600 mb-4">
                Understand and improve your networking effectiveness
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Relationship strength scoring
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Network health monitoring
                </li>
              </ul>
            </div>

            <div className="bg-[#F4F4FF] rounded-2xl p-8">
              <h4 className="text-lg font-semibold mb-2">Smart Groups</h4>
              <p className="text-gray-600 mb-4">
                Organize contacts your way
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom group creation
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Automated suggestions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500">© 2024 ntwrk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
