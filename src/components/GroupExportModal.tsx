import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Contact } from '@/types';

interface GroupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  contacts: Contact[];
}

type ExportFormat = 'csv' | 'json' | 'zapier';

const formatIcons = {
  csv: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  json: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18C12 19.1046 11.1046 20 10 20C8.89543 20 8 19.1046 8 18C8 16.8954 8.89543 16 10 16C11.1046 16 12 16.8954 12 18Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 14C16 15.1046 15.1046 16 14 16C12.8954 16 12 15.1046 12 14C12 12.8954 12.8954 12 14 12C15.1046 12 16 12.8954 16 14Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  zapier: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 8L12 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export default function GroupExportModal({ isOpen, onClose, groupName, contacts }: GroupExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookError, setWebhookError] = useState('');

  const handleExport = async () => {
    if (selectedFormat === 'zapier') {
      if (!webhookUrl) {
        setWebhookError('Please enter a webhook URL');
        return;
      }

      try {
        setIsExporting(true);
        setWebhookError('');

        // Validate webhook URL
        const url = new URL(webhookUrl);
        if (!url.hostname.includes('zapier.com')) {
          throw new Error('Please enter a valid Zapier webhook URL');
        }

        // Send data to Zapier
        const response = await fetch('/api/contacts/zapier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl,
            contacts
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send data to Zapier');
        }

      } catch (err) {
        setWebhookError(err instanceof Error ? err.message : 'Failed to export to Zapier');
        setIsExporting(false);
        return;
      }
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setExportProgress(i);
    }

    if (selectedFormat !== 'zapier') {
      // Format and download the file
      const content = selectedFormat === 'json' 
        ? JSON.stringify(contacts, null, 2)
        : formatContactsForCSV(contacts);
      
      const type = selectedFormat === 'json' ? 'application/json' : 'text/csv';
      const extension = selectedFormat === 'json' ? 'json' : 'csv';
      
      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${groupName.toLowerCase().replace(/\s+/g, '-')}-contacts.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    setIsExporting(false);
    setShowSuccess(true);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Reset after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const formatContactsForCSV = (contacts: Contact[]) => {
    const headers = ['Name', 'Email', 'Company', 'Last Contacted', 'Relationship Score', 'Response Rate'];
    
    const rows = contacts.map(contact => [
      contact.name,
      contact.email,
      contact.company || '',
      new Date(contact.lastContacted).toLocaleDateString(),
      contact.relationshipStrength?.score.toString() || '',
      contact.velocity?.interactionMetrics.responseRate.toString() || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const copyShareableLink = () => {
    // In a real implementation, this would generate and copy a secure, temporary link
    navigator.clipboard.writeText(`https://app.network/shared/groups/${groupName.toLowerCase().replace(/\s+/g, '-')}`);
    setShowShareLink(true);
    setTimeout(() => setShowShareLink(false), 2000);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-[600px] max-w-[95vw] bg-white rounded-2xl shadow-xl">
          <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-900">
                  Export {groupName}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  {contacts.length} contacts will be exported
                </Dialog.Description>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Choose Format</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['csv', 'json', 'zapier'] as ExportFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`
                      p-3 rounded-xl border-2 transition-all
                      ${selectedFormat === format 
                        ? 'border-[#1E1E3F] bg-[#F4F4FF]' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className={`
                      flex flex-col items-center gap-2
                      ${selectedFormat === format ? 'text-[#1E1E3F]' : 'text-gray-500'}
                    `}>
                      {formatIcons[format]}
                      <span className="text-sm font-medium uppercase">
                        {format}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format-specific content */}
            <div className="space-y-4">
              {selectedFormat === 'zapier' ? (
                <>
                  <div className="bg-[#F4F4FF] rounded-xl p-4">
                    <h3 className="font-medium text-[#1E1E3F] mb-3">How to get your Zapier Webhook URL:</h3>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1E1E3F] text-white flex items-center justify-center text-xs">1</span>
                        <span>Create a new Zap in Zapier</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1E1E3F] text-white flex items-center justify-center text-xs">2</span>
                        <span>Choose "Webhooks by Zapier" as your trigger</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1E1E3F] text-white flex items-center justify-center text-xs">3</span>
                        <span>Select "Catch Hook" as the trigger event</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1E1E3F] text-white flex items-center justify-center text-xs">4</span>
                        <span>Copy the webhook URL provided by Zapier</span>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
                      Zapier Webhook URL
                    </label>
                    <input
                      id="webhook-url"
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E1E3F] focus:border-transparent outline-none transition-all"
                    />
                    {webhookError && (
                      <p className="text-sm text-red-600">{webhookError}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Data Format</h4>
                    <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                      {JSON.stringify({
                        timestamp: new Date().toISOString(),
                        contact: {
                          name: contacts[0]?.name || "Example Name",
                          email: contacts[0]?.email || "example@email.com",
                          company: contacts[0]?.company || "Company Name",
                          lastContacted: contacts[0]?.lastContacted || new Date().toISOString(),
                          relationshipStrength: contacts[0]?.relationshipStrength?.score || 0,
                          responseRate: contacts[0]?.velocity?.interactionMetrics.responseRate || 0
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                    <span className="text-xs text-gray-500">
                      {contacts.length.toLocaleString()} contact{contacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                    {contacts.slice(0, 5).map((contact) => (
                      <div key={contact.email} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E1E3F] flex items-center justify-center text-white text-sm">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    ))}
                    {contacts.length > 5 && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                          +{contacts.length - 5} more contacts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Progress and Success Messages */}
            <AnimatePresence>
              {isExporting && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exporting contacts...</span>
                    <span className="text-gray-900 font-medium">{exportProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#1E1E3F]"
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-green-50 text-green-800 rounded-xl p-4 flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {selectedFormat === 'zapier' ? 'Contacts successfully sent to Zapier!' : 'Export complete! Your file is ready.'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={copyShareableLink}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Link
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || (selectedFormat === 'zapier' && !webhookUrl)}
                  className={`
                    px-6 py-2 text-sm font-medium text-white rounded-lg
                    ${isExporting || (selectedFormat === 'zapier' && !webhookUrl)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#1E1E3F] hover:bg-[#2D2D5F]'
                    }
                    transition-colors
                  `}
                >
                  {isExporting ? 'Exporting...' : 'Export Now'}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}