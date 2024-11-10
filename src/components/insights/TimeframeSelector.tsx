interface TimeframeSelectorProps {
  selected: '30d' | '90d' | '1y';
  onChange: (timeframe: '30d' | '90d' | '1y') => void;
}

export default function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-2">
      {['30d', '90d', '1y'].map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onChange(timeframe as '30d' | '90d' | '1y')}
          className={`px-3 py-1 rounded ${
            selected === timeframe
              ? 'bg-[#1E1E3F] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
} 