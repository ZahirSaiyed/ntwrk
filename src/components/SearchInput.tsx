interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <input
      type="search"
      placeholder="Search contacts..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E1E3F]"
    />
  );
}
