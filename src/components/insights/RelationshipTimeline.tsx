import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact } from '@/types';
import { adaptContact } from '@/utils/contactAdapter';

interface RelationshipTimelineProps {
  contacts: Contact[];
  timeframe: '30d' | '90d' | '1y';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function RelationshipTimeline({ contacts, timeframe, isExpanded, onToggleExpand }: RelationshipTimelineProps) {
  const getTimelineEvents = () => {
    const days = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    const data = [];
    
    // Create array of dates
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      // Set to start of day in UTC
      const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const dateStr = utcDate.toISOString();
      
      // Count interactions for this date
      const dayInteractions = contacts.reduce((acc, contact) => {
        const adaptedContact = adaptContact(contact);
        const dayContacts = new Set();
        
        // First check for sentDates if available
        if (contact.sentDates && contact.sentDates.length > 0) {
          contact.sentDates.forEach(sentDate => {
            const interactionDate = new Date(sentDate);
            // Convert interaction date to UTC and set to start of day
            const utcInteractionDate = new Date(Date.UTC(
              interactionDate.getUTCFullYear(),
              interactionDate.getUTCMonth(),
              interactionDate.getUTCDate()
            ));
            
            if (utcInteractionDate.getTime() === utcDate.getTime()) {
              acc.sent++;
              dayContacts.add(contact.email);
            }
          });
        } 
        // Fall back to interactions for backward compatibility
        else if (adaptedContact.interactions) {
          adaptedContact.interactions.forEach(interaction => {
            const interactionDate = new Date(interaction.date);
            // Convert interaction date to UTC and set to start of day
            const utcInteractionDate = new Date(Date.UTC(
              interactionDate.getUTCFullYear(),
              interactionDate.getUTCMonth(),
              interactionDate.getUTCDate()
            ));
            
            if (utcInteractionDate.getTime() === utcDate.getTime() && interaction.type === 'sent') {
              acc.sent++;
              dayContacts.add(contact.email);
            }
          });
        }
        
        acc.uniqueContacts = dayContacts.size;
        return acc;
      }, { sent: 0, uniqueContacts: 0 });

      data.push({
        date: dateStr,
        sent: dayInteractions.sent,
        uniqueContacts: dayInteractions.uniqueContacts
      });
    }
    
    return data;
  };

  const timelineData = getTimelineEvents();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-sm text-green-600">Sent: {payload[0].value}</p>
          <p className="text-sm text-gray-600">Active Contacts: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E3F]">Activity Timeline</h2>
            <p className="text-sm text-gray-500">Track your outbound engagement over time</p>
          </div>
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="p-2 hover:bg-gray-50 rounded-full"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="h-[400px] bg-[#FAFAFA] rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      stroke="#6B7280"
                    />
                    <YAxis stroke="#6B7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sent" 
                      stroke="#22C55E" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Emails Sent"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uniqueContacts" 
                      stroke="#6B7280" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Active Contacts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 