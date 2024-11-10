export default function ViewToggle({ view, onViewChange }: { 
  view: 'grid' | 'table', 
  onViewChange: (view: 'grid' | 'table') => void 
}) {
  return (
    <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => onViewChange('grid')}
        className={`px-4 py-2 rounded-md transition-all ${
          view === 'grid' 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`px-4 py-2 rounded-md transition-all ${
          view === 'table' 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
