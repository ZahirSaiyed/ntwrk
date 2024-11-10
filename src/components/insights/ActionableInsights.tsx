import { Contact } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { generateActions } from '@/utils/actionGeneration';
import ActionCard from '@/components/insights/ActionCard';

interface Props {
  contacts: Contact[];
  timeframe: '30d' | '90d' | '1y';
  isExpanded: boolean;
  onToggleExpand: () => void;
  onActionComplete: (contactId: string, actionType: string) => void;
}

export default function ActionableInsights({ 
  contacts, 
  timeframe, 
  isExpanded,
  onToggleExpand,
  onActionComplete 
}: Props) {
  const actions = generateActions(contacts, timeframe);
  const priorityActions = actions.filter(a => a.priority === 'high');
  
  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E1E3F]">
              Priority Actions
            </h2>
            <p className="text-sm text-gray-500">
              {priorityActions.length} high-priority actions needed
            </p>
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
            <div className="px-6 pb-6 space-y-4">
              {actions.map(action => (
                <ActionCard 
                  key={action.id}
                  action={action}
                  onComplete={() => onActionComplete(action.contactId, action.type)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
