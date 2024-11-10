// Add Props interface
interface GroupFABProps {
  onClick: () => void;
}

// Update component to use props
export default function GroupFAB({ onClick }: GroupFABProps) {
  return (
    <button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 group transition-all">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
        New Group
      </span>
    </button>
  );
}
