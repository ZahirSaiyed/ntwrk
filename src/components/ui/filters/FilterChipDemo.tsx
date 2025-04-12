import React, { useState } from 'react';
import FilterChip from './FilterChip';
import { Icon } from '../icons/Icon';

/**
 * Demo component to showcase the enhanced FilterChip interactions
 */
export default function FilterChipDemo() {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [totalFound, setTotalFound] = useState<number>(128);
  
  // Toggle a filter
  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return newFilters;
    });
    
    // Simulate filter results changing
    setTotalFound(Math.floor(Math.random() * 100) + 50);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters(new Set());
    setTotalFound(128);
  };
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Enhanced Filter Interactions</h2>
        <p className="text-sm text-gray-600">
          Experience the improved filter interactions with clear selected states, tooltips, and keyboard navigation.
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Click or use keyboard to toggle filters:</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Active"
            icon="Activity"
            selected={selectedFilters.has('active')}
            onClick={() => handleFilterToggle('active')}
            tooltipContent="Show active contacts"
            badge={selectedFilters.has('active') ? 42 : undefined}
          />
          
          <FilterChip
            label="Recent"
            icon="Clock"
            selected={selectedFilters.has('recent')}
            onClick={() => handleFilterToggle('recent')}
            tooltipContent="Show contacts from the last 30 days"
            badge={selectedFilters.has('recent') ? 27 : undefined}
          />
          
          <FilterChip
            label="Favorites"
            icon="Star"
            selected={selectedFilters.has('favorites')}
            onClick={() => handleFilterToggle('favorites')}
            tooltipContent="Show favorite contacts"
            badge={selectedFilters.has('favorites') ? 15 : undefined}
          />
          
          <FilterChip
            label="Needs Attention"
            icon="AlertCircle"
            selected={selectedFilters.has('needsAttention')}
            onClick={() => handleFilterToggle('needsAttention')}
            tooltipContent="Show contacts that need attention"
            badge={selectedFilters.has('needsAttention') ? 8 : undefined}
          />
          
          <FilterChip
            label="Work"
            icon="Briefcase"
            selected={selectedFilters.has('work')}
            onClick={() => handleFilterToggle('work')}
            tooltipContent="Show work contacts"
            badge={selectedFilters.has('work') ? 36 : undefined}
          />
        </div>
        
        {selectedFilters.size > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {selectedFilters.size} filter{selectedFilters.size > 1 ? 's' : ''} active
            </span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#1E1E3F] font-medium hover:underline flex items-center gap-1"
            >
              <Icon name="X" size={12} />
              Clear all filters
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-[#F4F4FF] rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between">
          <span className="text-[#1E1E3F] font-medium">Results</span>
          <span className="bg-[#1E1E3F] text-white px-2 py-0.5 rounded-full text-xs font-medium">
            {totalFound}
          </span>
        </div>
        
        {selectedFilters.size >= 2 && (
          <div className="mt-4 bg-[#FFFFFF] rounded p-3 border border-[#1E1E3F]/10 flex items-start gap-2">
            <Icon name="Lightbulb" size={16} className="text-[#F59E0B] mt-0.5" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">Pro tip:</span> You can combine filters to build powerful groups.
              Try adding more filters to refine your selection further.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700 mb-1">Accessibility features:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Clear visual distinction between selected and unselected states</li>
          <li>Proper focus indicators for keyboard navigation (try tabbing)</li>
          <li>ARIA attributes for screen readers</li>
          <li>Tooltips for additional context</li>
          <li>Mobile-friendly with touch targets &gt; 44px</li>
        </ul>
      </div>
    </div>
  );
} 