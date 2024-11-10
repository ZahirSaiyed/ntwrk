export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8"
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 relative animate-spin">
        <div className="w-16 h-16 rounded-full border-4 border-[#F4F4FF] border-t-[#1E1E3F]"></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
