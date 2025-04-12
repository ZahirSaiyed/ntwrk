'use client';

import React from 'react';
import FilterChipDemo from '@/components/ui/filters/FilterChipDemo';

export default function FilterDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-[#1E1E3F] mb-4">Filter Interaction Patterns</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our redesigned filter interactions focus on clarity, accessibility, and delight.
            The new patterns make it immediately obvious what's selected and provide intuitive
            ways to toggle filters on and off.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1E1E3F]">Interactive Demo</h2>
            <p className="text-gray-500 text-sm mt-1">
              Try selecting and deselecting filters using mouse or keyboard (Tab + Enter/Space)
            </p>
          </div>
          <FilterChipDemo />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1E1E3F]">Design Improvements</h2>
              <p className="text-gray-500 text-sm mt-1">Key visual and interaction enhancements</p>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#1E1E3F] font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Clear Visual States</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Selected filters now have a distinct visual appearance with contrasting colors,
                      shadows, and a checkmark icon for immediate recognition.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#1E1E3F] font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Intuitive Toggling</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Users can now easily toggle filters on and off by clicking the same chip again.
                      The transition animations provide feedback about the state change.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#1E1E3F] font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Rich Tooltips & Context</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Tooltips provide additional information about what each filter does.
                      Badges show the number of matching items for quick feedback.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1E1E3F]">Accessibility Enhancements</h2>
              <p className="text-gray-500 text-sm mt-1">Making filters usable for everyone</p>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#1E1E3F] font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Keyboard Navigation</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Full keyboard support allows users to tab between filters and toggle them
                      with Enter or Space keys. Visible focus indicators help keep track of position.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#1E1E3F] font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ARIA Attributes</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Proper aria-pressed, role, and aria-label attributes help screen readers
                      accurately convey the purpose and state of each filter chip.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F4F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#1E1E3F] font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mobile Optimization</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Horizontally scrolling chip containers on mobile with appropriately sized
                      touch targets (at least 44x44px) ensure usability on smaller screens.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 