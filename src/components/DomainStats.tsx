import React, { useState } from 'react';
import { Contact } from '@/types';

interface DomainStatsProps {
  contacts: Contact[];
  // Function to extract domain from email
  extractDomain: (email: string) => string;
  // Selected domain (if any)
  selectedDomain?: string;
  // Handle domain selection
  onDomainSelect?: (domain: string) => void;
}

/**
 * Component to display domain distribution statistics
 */
const DomainStats: React.FC<DomainStatsProps> = ({
  contacts,
  extractDomain,
  selectedDomain,
  onDomainSelect
}) => {
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // Get domain distribution
  const domainDistribution = React.useMemo(() => {
    const distribution = new Map<string, number>();
    
    contacts.forEach(contact => {
      const domain = extractDomain(contact.email);
      distribution.set(domain, (distribution.get(domain) || 0) + 1);
    });
    
    // Convert to array and sort by count (descending)
    return Array.from(distribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Show top 10 domains
  }, [contacts, extractDomain]);
  
  // Calculate percentages for visualization
  const totalContacts = contacts.length;
  
  if (domainDistribution.length === 0) {
    return null;
  }
  
  // Transform the data for use in the component
  const domainData = domainDistribution.map(([domain, count]) => {
    const percentage = totalContacts ? (count / totalContacts) * 100 : 0;
    return {
      domain,
      count,
      percentage
    };
  });
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <svg 
              className="w-4 h-4 text-[#4B4BA6] mr-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span className="text-sm font-medium text-gray-700">Domain Distribution</span>
          </div>
          <button 
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="text-xs text-[#4B4BA6] flex items-center font-medium hover:underline transition-colors"
          >
            {showDetailedView ? 'Show Less' : 'Show Details'}
            <svg 
              className={`ml-1 w-3 h-3 transition-transform duration-200 ${showDetailedView ? 'transform rotate-180' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        
        {/* Always visible: Top domains as pills */}
        <div className="flex flex-wrap items-center gap-2 py-1">
          {domainData.slice(0, 5).map(({ domain, count, percentage }) => (
            <button
              key={domain}
              onClick={() => onDomainSelect?.(domain)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors whitespace-nowrap
                ${selectedDomain === domain 
                  ? 'bg-[#1E1E3F] text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              {domain.split('.')[0]}
              <span className="ml-1 opacity-80">{Math.round(percentage)}%</span>
            </button>
          ))}
        </div>
        
        {/* Expandable detailed view */}
        {showDetailedView && (
          <div className="mt-3 pt-3 border-t border-gray-100 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {domainData.slice(0, 8).map(({ domain, count, percentage }) => (
                <div 
                  key={domain}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors
                    ${selectedDomain === domain ? 'bg-[#F4F4FF]' : 'hover:bg-gray-50'}`}
                  onClick={() => onDomainSelect?.(domain)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`w-2 h-2 rounded-full ${selectedDomain === domain ? 'bg-[#4B4BA6]' : 'bg-gray-300'}`}></span>
                    <span className="text-sm truncate max-w-[120px]">{domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#4B4BA6]/60 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {domainDistribution.length > 8 && (
              <div className="mt-2 text-xs text-gray-500 text-center italic">
                Showing top 8 of {new Set(contacts.map(c => extractDomain(c.email))).size} domains
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add styles for animations */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default DomainStats; 