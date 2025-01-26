import React, { useState, useCallback } from 'react';
import { Contact } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { Tab } from '@headlessui/react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newContacts: Contact[]) => void;
}

interface CSVContact {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  company?: string;
  lastContacted?: string;
}

interface DataSource {
  id: 'template' | 'luma' | 'eventbrite' | 'linkedin';
  name: string;
  icon: string;
  description: string;
  headerMappings: {
    name: string[];
    email: string[];
    company?: string[];
    url?: string[];
    position?: string[];
    connectedOn?: string[];
    lastContacted?: string[];
    ticket?: string[];
  };
  sampleData: string;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'template',
    name: 'Standard Template',
    icon: '📝',
    description: 'Simple format with basic contact information',
    headerMappings: {
      name: ['full name', 'name', 'first name', 'last name'],
      email: ['email', 'email address'],
      company: ['company', 'organization'],
      lastContacted: ['last contacted', 'last contact date']
    },
    sampleData: `full name,email,company,last contacted
John Doe,john@example.com,Acme Inc,2024-03-20
Jane Smith,jane@example.com,Tech Corp,2024-03-19`
  },
  {
    id: 'luma',
    name: 'Luma',
    icon: '🎫',
    description: 'Import your event attendees directly from Luma',
    headerMappings: {
      name: ['name', 'attendee name', 'first name', 'last name'],
      email: ['email', 'attendee email'],
      company: ['company', 'organization'],
      lastContacted: ['registration date']
    },
    sampleData: `name,email,company,registration_date
John Doe,john@example.com,Acme Inc,2024-03-20
Jane Smith,jane@example.com,Tech Corp,2024-03-19`
  },
  {
    id: 'eventbrite',
    name: 'Eventbrite',
    icon: '🎪',
    description: 'Import your Eventbrite attendee list seamlessly',
    headerMappings: {
      name: ['attendee name', 'first name', 'last name', 'attendee first name', 'attendee last name'],
      email: ['email', 'attendee email'],
      company: ['company', 'organization'],
      lastContacted: ['order date', 'registration date']
    },
    sampleData: `Attendee First Name,Attendee Last Name,Attendee Email,Company,Order Date
John,Doe,john@example.com,Acme Inc,2024-03-20
Jane,Smith,jane@example.com,Tech Corp,2024-03-19`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Import your LinkedIn connections export (.csv)',
    headerMappings: {
      name: ['First Name', 'Last Name'],
      email: ['Email Address'],
      company: ['Company'],
      url: ['URL'],
      position: ['Position'],
      connectedOn: ['Connected On']
    },
    sampleData: `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://linkedin.com/in/johndoe,john@example.com,Acme Inc,CEO,2024-01-15
Jane,Smith,https://linkedin.com/in/janesmith,jane@example.com,Tech Corp,CTO,2024-02-20`
  }
];

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<CSVContact[]>([]);
  const [displayedContacts, setDisplayedContacts] = useState<CSVContact[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, duplicate: 0 });
  const [selectedSource, setSelectedSource] = useState<DataSource>(DATA_SOURCES[0]);
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_PAGE_SIZE = 10;

  const resetState = () => {
    setFile(null);
    setError('');
    setImporting(false);
    setPreviewData([]);
    setDisplayedContacts([]);
    setStep('upload');
    setImportStats({ total: 0, valid: 0, duplicate: 0 });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    try {
      const text = await selectedFile.text();
      
      // First do a complete parse to get total count
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (fullResults) => {
          const totalCount = (fullResults.data as Record<string, string>[]).length;
          
          // Then get preview data
          Papa.parse<CSVContact>(text, {
            header: true,
            skipEmptyLines: true,
            preview: 5, // Show first 5 rows
            complete: (previewResults) => {
              const headers = Object.keys(previewResults.data[0] || {});
              const mappedPreview = previewResults.data.map(row => ({
                ...row,
                name: `${row['First Name']} ${row['Last Name']}`.trim(),
                company: row['Company'] || '',
                position: row['Position'] || ''
              }));

              setPreviewData(mappedPreview);
              setDisplayedContacts(mappedPreview.slice(0, 10));
              setStep('preview');
              
              // Use the total from full parse
              setImportStats({ 
                total: totalCount,
                valid: totalCount, // For LinkedIn, all records are valid
                duplicate: 0 
              });
            }
          });
        }
      });
    } catch (err) {
      setError('Error reading file preview');
    }
  };

  const downloadTemplate = () => {
    const template = 'name,email,company,lastContacted\nJohn Doe,john@example.com,Acme Inc,2024-03-20\nJane Smith,jane@example.com,Tech Corp,2024-03-19\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const mapHeadersToContact = (headers: string[], values: string[]): Partial<Contact> => {
    const findValue = (mappings: string[]) => {
      const headerIndex = headers.findIndex(h => 
        mappings.some(m => h.toLowerCase() === m.toLowerCase())
      );
      return headerIndex !== -1 ? values[headerIndex]?.trim() : '';
    };

    const { headerMappings } = selectedSource;
    
    // Special handling for LinkedIn name fields
    let name = '';
    if (selectedSource.id === 'linkedin') {
      const firstNameIndex = headers.findIndex(h => h === 'First Name');
      const lastNameIndex = headers.findIndex(h => h === 'Last Name');
      if (firstNameIndex !== -1 && lastNameIndex !== -1) {
        const firstName = values[firstNameIndex]?.trim() || '';
        const lastName = values[lastNameIndex]?.trim() || '';
        name = `${firstName} ${lastName}`.trim();
      }
    } else {
      name = findValue(headerMappings.name);
    }
    
    return {
      name,
      email: findValue(headerMappings.email).toLowerCase(),
      company: findValue(headerMappings.company || []),
      lastContacted: findValue(headerMappings.lastContacted || []) || new Date().toISOString()
    };
  };

  const validateContact = (contact: Partial<Contact>, source: DataSource) => {
    const errors: string[] = [];
    
    // Required fields for all sources except LinkedIn
    if (source.id !== 'linkedin') {
      if (!contact.name || contact.name === 'Unnamed Contact') {
        errors.push('Name is required');
      }
      if (!contact.email) {
        errors.push('Email is required');
      }
    }

    // LinkedIn-specific validation
    if (source.id === 'linkedin') {
      if (!contact.name || contact.name === 'Unnamed Contact') {
        errors.push('First Name and Last Name are required');
      }
    }

    // Email format validation when present
    if (contact.email && !contact.email.includes('@')) {
      errors.push('Invalid email format');
    }

    // Company validation - optional but must be string if present
    if (contact.company && typeof contact.company !== 'string') {
      errors.push('Company must be text');
    }

    return errors;
  };

  const handleImport = async () => {
    if (!file) return;
    
    setStep('importing');
    setImporting(true);
    setError('');

    try {
      const text = await file.text();
      Papa.parse<CSVContact>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: async (results: ParseResult<CSVContact>) => {
          if (results.errors.length > 0) {
            const errorMessages = results.errors
              .map(err => `Row ${(err.row ?? 0) + 1}: ${err.message}`)
              .join('\n');
            setError(`CSV parsing errors:\n${errorMessages}`);
            setImporting(false);
            setStep('preview'); // Go back to preview on error
            return;
          }

          const headers = Object.keys(results.data[0] || {});
          
          // Filter out invalid LinkedIn contacts before processing
          let validData = results.data;
          if (selectedSource.id === 'linkedin') {
            validData = results.data.filter(row => {
              const firstName = row['First Name']?.trim();
              const lastName = row['Last Name']?.trim();
              return firstName && lastName;
            });
          }

          const contacts = validData.map(row => {
            const values = Object.values(row).map(v => v?.toString() || '');
            const mappedContact = mapHeadersToContact(headers, values);
            
            // Include any additional columns as custom fields
            const customFields = headers.reduce((acc, header, index) => {
              if (!['name', 'email', 'company', 'lastContacted'].includes(header.toLowerCase())) {
                acc.push({
                  id: `custom-${index}`,
                  label: header,
                  value: row[header]?.trim() || ''
                });
              }
              return acc;
            }, [] as { id: string; label: string; value: string }[]);

            return {
              ...mappedContact,
              // Provide defaults for blank fields
              name: mappedContact.name || 'Unnamed Contact',
              company: mappedContact.company || '',
              lastContacted: mappedContact.lastContacted || new Date().toISOString(),
              customFields
            };
          });

          // Only validate email format
          const invalidContacts = contacts.filter(contact => {
            // For LinkedIn imports, allow contacts without email
            if (selectedSource.id === 'linkedin') {
              // Only validate email format if email is present
              return contact.email ? !contact.email.includes('@') : false;
            }
            // For other sources, require valid email
            return !contact.email || !contact.email.includes('@');
          });

          if (invalidContacts.length > 0) {
            setError(`Found ${invalidContacts.length} invalid email(s). Please check your CSV file.`);
            setImporting(false);
            setStep('preview'); // Go back to preview on error
            return;
          }

          const validationErrors: { row: number; errors: string[] }[] = [];

          contacts.forEach((contact, index) => {
            const errors = validateContact(contact, selectedSource);
            if (errors.length > 0) {
              validationErrors.push({ row: index + 1, errors });
            }
          });

          if (validationErrors.length > 0) {
            const errorMessage = validationErrors
              .map(({ row, errors }) => `Row ${row}: ${errors.join(', ')}`)
              .join('\n');
            setError(`Validation errors:\n${errorMessage}`);
            setImporting(false);
            setStep('preview');
            return;
          }

          try {
            const response = await fetch('/api/contacts/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contacts }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const importedContacts = await response.json();
            onImportComplete(importedContacts);
            resetState();
            onClose();
          } catch (err) {
            setError(err instanceof Error 
              ? `Import failed: ${err.message}` 
              : 'Failed to import contacts. Please try again.'
            );
            setImporting(false);
            setStep('preview'); // Go back to preview on error
          }
        },
        error: (error: Error) => {
          setError(`CSV reading error: ${error.message}`);
          setImporting(false);
          setStep('preview'); // Go back to preview on error
        },
      });
    } catch (err) {
      setError(err instanceof Error 
        ? `File error: ${err.message}` 
        : 'Error reading file. Please try again.'
      );
      setImporting(false);
      setStep('preview'); // Go back to preview on error
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = e.currentTarget;
    dropzone.classList.add('border-[#1E1E3F]', 'bg-[#F4F4FF]');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = e.currentTarget;
    dropzone.classList.remove('border-[#1E1E3F]', 'bg-[#F4F4FF]');
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dropzone = e.currentTarget;
    dropzone.classList.remove('border-[#1E1E3F]', 'bg-[#F4F4FF]');

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!droppedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(droppedFile);
    setError('');

    try {
      const text = await droppedFile.text();
      
      // First do a complete parse to get total count
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (fullResults) => {
          const totalCount = (fullResults.data as Record<string, string>[]).length;
          
          // Then get preview data
          Papa.parse<CSVContact>(text, {
            header: true,
            skipEmptyLines: true,
            preview: 5,
            complete: (previewResults) => {
              const headers = Object.keys(previewResults.data[0] || {});
              const mappedPreview = previewResults.data.map(row => ({
                ...row,
                name: `${row['First Name']} ${row['Last Name']}`.trim(),
                company: row['Company'] || '',
                position: row['Position'] || ''
              }));

              setPreviewData(mappedPreview);
              setDisplayedContacts(mappedPreview.slice(0, 10));
              setStep('preview');
              
              // Use the total from full parse
              setImportStats({ 
                total: totalCount,
                valid: totalCount, // For LinkedIn, all records are valid
                duplicate: 0 
              });
            }
          });
        }
      });
    } catch (err) {
      setError('Error reading file preview');
    }
  };

  const handleFilePreview = async (file: File) => {
    try {
      const text = await file.text();
      
      // First pass: get total count from full file
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (fullResults) => {
          // Second pass: get preview rows
          Papa.parse<CSVContact>(text, {
            header: true,
            skipEmptyLines: true,
            preview: 5, // Show first 5 rows for preview
            complete: (previewResults) => {
              const headers = Object.keys(previewResults.data[0] || {});
              const mappedPreview = previewResults.data.map(row => {
                const values = Object.values(row).map(v => v?.toString() || '');
                const mappedContact = mapHeadersToContact(headers, values);
                return {
                  ...row,
                  name: mappedContact.name,
                  email: mappedContact.email,
                  company: mappedContact.company,
                  lastContacted: mappedContact.lastContacted
                } as CSVContact;
              });

              setPreviewData(mappedPreview);
              setDisplayedContacts(mappedPreview.slice(0, 10));
              setStep('preview');
              
              // Calculate total from full file
              const total = (fullResults.data as Record<string, string>[]).length;
              
              // Count valid contacts - accept if we have either name or email
              const validCount = (fullResults.data as Record<string, string>[]).filter(row => {
                if (selectedSource.id === 'linkedin') {
                  // For LinkedIn, count as valid if we have both first and last name
                  const firstName = row['First Name']?.trim();
                  const lastName = row['Last Name']?.trim();
                  return firstName && lastName;
                }
                // For other sources, count as valid if we have name
                return row['name']?.trim();
              }).length;
              
              setImportStats({ 
                total,
                valid: validCount,
                duplicate: 0 
              });
            }
          });
        }
      });
    } catch (err) {
      setError('Error reading file preview');
    }
  };

  const handlePageChange = (newPage: number) => {
    const startIndex = (newPage - 1) * 10;
    const endIndex = startIndex + 10;
    setDisplayedContacts(previewData.slice(startIndex, endIndex));
    setPreviewPage(newPage);
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return renderSourceSelector();

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-[#F4F4FF] p-6 rounded-lg">
              <h3 className="font-semibold text-[#1E1E3F] text-lg mb-3">Import Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Contacts</div>
                  <div className="text-2xl font-semibold text-[#1E1E3F]">
                    {importStats.total.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Valid Records</div>
                  <div className="text-2xl font-semibold text-[#1E1E3F]">
                    {importStats.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F4F4FF]">
                  <tr>
                    {getPreviewHeaders(selectedSource.id).map(header => (
                      <th key={header.key} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedContacts.slice(0, 5).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {getPreviewHeaders(selectedSource.id).map(header => (
                        <td key={header.key} className="px-6 py-4 text-sm text-gray-600">
                          {header.key === 'name' && selectedSource.id === 'linkedin' 
                            ? `${row['First Name']} ${row['Last Name']}`
                            : row[header.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Update pagination controls */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                Showing {Math.min(10, previewData.length)} of {importStats.total.toLocaleString()} contacts
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(previewPage - 1)}
                  disabled={previewPage === 1}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(previewPage + 1)}
                  disabled={previewPage * 10 >= previewData.length}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Loading indicator for large files */}
            {importStats.total > 1000 && (
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  Large file detected. Preview shows a sample of contacts. All {importStats.total.toLocaleString()} contacts will be imported.
                </span>
              </div>
            )}
          </div>
        );

      case 'importing':
        return (
          <div className="text-center py-8">
            {!error ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[#F4F4FF]"></div>
                  <div className="w-16 h-16 rounded-full border-4 border-t-[#1E1E3F] animate-spin absolute inset-0"></div>
                </div>
                <h3 className="text-xl font-semibold text-[#1E1E3F] mb-2">
                  Importing Your Contacts
                </h3>
                <p className="text-gray-600">
                  This will just take a moment...
                </p>
              </>
            ) : (
              <div className="text-red-600">
                <h3 className="text-xl font-semibold mb-2">Import Failed</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        );
    }
  };

  const renderSourceSelector = () => (
    <div className="space-y-6">
      <Tab.Group>
        <Tab.List className="grid grid-cols-4 gap-3">
          {DATA_SOURCES.map((source) => (
            <Tab
              key={source.id}
              className={({ selected }) =>
                `w-full rounded-xl p-4 text-left transition-all hover:bg-[#F4F4FF] focus:outline-none
                ${selected 
                  ? 'bg-[#F4F4FF] ring-2 ring-[#1E1E3F] ring-opacity-60'
                  : 'bg-white border border-gray-200'
                }`
              }
              onClick={() => setSelectedSource(source)}
            >
              <div className="space-y-2">
                <span className="text-2xl">{source.icon}</span>
                <h3 className="font-medium text-[#1E1E3F]">{source.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {source.description}
                </p>
              </div>
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>

      <div className="bg-[#F4F4FF] rounded-xl p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[#1E1E3F]">Expected Format</h3>
            <button
              onClick={() => {
                const blob = new Blob([selectedSource.sampleData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedSource.id}_template.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 bg-white text-[#1E1E3F] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium border border-gray-200"
            >
              <span>Download Template</span>
              <span className="text-xs">↓</span>
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Headers (copy this line):</div>
                <div className="text-xs font-mono bg-gray-50 p-2 rounded select-all">
                  {selectedSource.id === 'linkedin' && 
                    'First Name,Last Name,URL,Email Address,Company,Position,Connected On'
                  }
                  {selectedSource.id === 'eventbrite' && 
                    'Attendee first name,Attendee last name,Attendee email,Order #,Ticket Type'
                  }
                  {selectedSource.id === 'luma' && 
                    'name,email,company,ticket_type,registration_date'
                  }
                  {selectedSource.id === 'template' && 
                    'name,email,company'
                  }
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Example row (copy this line):</div>
                <div className="text-xs font-mono bg-gray-50 p-2 rounded select-all">
                  {selectedSource.id === 'linkedin' && 
                    'John,Doe,https://linkedin.com/in/john-doe,john@example.com,Innovation Works,"Managing Director, Software",22 Oct 2024'
                  }
                  {selectedSource.id === 'eventbrite' && 
                    'John,Doe,john@example.com,12345,VIP Pass'
                  }
                  {selectedSource.id === 'luma' && 
                    'John Doe,john@example.com,Acme Inc,VIP,2024-03-20'
                  }
                  {selectedSource.id === 'template' && 
                    'John Doe,john@example.com,Acme Inc'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#1E1E3F] hover:bg-white/50 transition-all cursor-pointer bg-white"
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="space-y-4 block cursor-pointer">
            <div className="w-16 h-16 mx-auto bg-[#F4F4FF] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#1E1E3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-[#1E1E3F]">
                Drop your {selectedSource.name} CSV file here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or <span className="text-[#1E1E3F] underline">browse</span> to upload
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  // First, add a function to get headers based on source type
  const getPreviewHeaders = (sourceId: DataSource['id']) => {
    // Standard preview headers for all sources
    return [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'company', label: 'Company' },
      { key: 'lastContacted', label: 'Last Contact' }
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-3xl mx-auto relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1E1E3F]">Import Contacts</h2>
              {step !== 'importing' && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {renderStep()}

            {step === 'preview' && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setFile(null);
                    setStep('upload');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
                >
                  Import {importStats.total} Contacts
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 