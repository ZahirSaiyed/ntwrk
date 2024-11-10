import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact } from '@/types';

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
      const dateStr = date.toISOString();
      
      // Count interactions for this date
      const dayInteractions = contacts.reduce((acc, contact) => {
        const dayContacts = new Set();
        contact.interactions.forEach(interaction => {
          const interactionDate = new Date(interaction.date);
          if (format(interactionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
            if (interaction.type === 'sent') acc.sent++;
            if (interaction.type === 'received') acc.received++;
            dayContacts.add(contact.email);
          }
        });
        acc.uniqueContacts = dayContacts.size;
        return acc;
      }, { sent: 0, received: 0, uniqueContacts: 0 });

      data.push({
        date: dateStr,
        sent: dayInteractions.sent,
        received: dayInteractions.received,
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
          <p className="text-sm text-blue-600">Received: {payload[1].value}</p>
          <p className="text-sm text-gray-600">Active Contacts: {payload[2].value}</p>
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
            <p className="text-sm text-gray-500">Track your network engagement over time</p>
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
                      name="Messages Sent"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="received" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Messages Received"
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