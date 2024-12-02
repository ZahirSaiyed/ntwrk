import React from 'react';
import Link from 'next/link';

interface CleanupShortcutProps {
  flaggedCount: number;
}

export default function CleanupShortcut({ flaggedCount }: CleanupShortcutProps) {
  if (flaggedCount === 0) return null;

  return (
    <Link href="/cleanup-assistant">
      <div className="fixed bottom-4 right-4 bg-[#1E1E3F] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#2D2D5F] transition-colors flex items-center gap-2 cursor-pointer">
        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <span>{flaggedCount} contacts need review</span>
      </div>
    </Link>
  );
}
