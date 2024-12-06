import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact } from '@/types';

interface ZapierWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onExport: (webhookUrl: string) => void;
}

export default function ZapierWebhookModal({ isOpen, onClose, contacts, onExport }: ZapierWebhookModalProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validateAndExport = async () => {
    if (!webhookUrl) {
      setError('Please enter a webhook URL');
      return;
    }

    try {
      setIsValidating(true);
      setError('');

      // Validate webhook URL format
      const url = new URL(webhookUrl);
      if (!url.hostname.includes('zapier.com')) {
        throw new Error('Please enter a valid Zapier webhook URL');
      }

      // Send test payload to validate webhook
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      if (!testResponse.ok) {
        throw new Error('Failed to validate webhook URL');
      }

      // If validation succeeds, trigger the export
      onExport(webhookUrl);
      setShowSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setWebhookUrl('');
        setShowSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid webhook URL');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-2xl shadow-xl">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-900">
                  Export to Zapier
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  Send {contacts.length} contacts to your Zapier workflow
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

            {/* Zapier Instructions */}
            <div className="bg-[#F4F4FF] rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-[#1E1E3F]">How to get your Zapier Webhook URL:</h3>
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

            {/* Webhook URL Input */}
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
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Data Preview</h3>
                <span className="text-xs text-gray-500">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''} will be exported
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Sample contact data:</span>
                  <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto text-xs">
                    {JSON.stringify(contacts[0], null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Success Message */}
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
                  Contacts successfully sent to Zapier!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={validateAndExport}
                disabled={isValidating}
                className={`
                  px-6 py-2 text-sm font-medium text-white rounded-lg
                  ${isValidating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#1E1E3F] hover:bg-[#2D2D5F]'
                  }
                  transition-colors
                `}
              >
                {isValidating ? 'Validating...' : 'Export to Zapier'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 