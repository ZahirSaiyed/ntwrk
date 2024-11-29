interface ImportStatusProps {
  status: 'loading' | 'success' | 'error';
  contactCount?: number;
  error?: string;
}

export default function ImportStatus({ status, contactCount, error }: ImportStatusProps) {
  return (
    <div className="fixed top-4 right-4 max-w-sm w-full bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      {status === 'loading' && (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#1E1E3F] border-t-transparent rounded-full animate-spin" />
          <div>
            <h3 className="font-medium text-[#1E1E3F]">Importing your contacts...</h3>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-[#1E1E3F]">Import complete!</h3>
            <p className="text-sm text-gray-500">
              {contactCount} contacts successfully imported
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-[#1E1E3F]">Import failed</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 