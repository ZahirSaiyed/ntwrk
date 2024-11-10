import { useState } from 'react';
import { Contact } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { calculateVelocityScore } from '@/utils/velocityTracking';

interface ActionCenterProps {
  contacts: Contact[];
  onActionComplete: (contactId: string, actionType: string) => void;
}

interface Action {
  id: string;
  type: string;
  priority: 'high' | 'medium';
  contact: Contact;
  description: string;
  suggestedMessage: string;
}

export default function ActionCenter({ contacts, onActionComplete }: ActionCenterProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const generateActions = (): Action[] => {
    const actions: Action[] = [];
    const now = new Date();

    // Priority 1: Declining Relationships
    contacts.forEach(contact => {
      const velocity = calculateVelocityScore(contact);
      if (velocity?.trend === 'falling' && velocity.score < 40) {
        actions.push({
          id: `reconnect-${contact.email}`,
          type: 'reconnect',
          priority: 'high',
          contact,
          description: `Reconnect with ${contact.name} - relationship needs attention`,
          suggestedMessage: `Hey ${contact.name.split(' ')[0]}, it's been a while! Would love to catch up and hear what you've been working on.`
        });
      }
    });

    // Priority 2: Strategic Follow-ups
    contacts.forEach(contact => {
      const lastInteraction = contact.interactions[contact.interactions.length - 1];
      if (lastInteraction?.type === 'sent' && 
          new Date(lastInteraction.date).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        actions.push({
          id: `followup-${contact.email}`,
          type: 'followup',
          priority: 'medium',
          contact,
          description: `Follow up on recent conversation with ${contact.name}`,
          suggestedMessage: `Thanks for your message last week. I wanted to follow up on...`
        });
      }
    });

    return actions.sort((a, b) => 
      a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
    );
  };

  const actions = generateActions();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1E1E3F]">Action Center</h2>
          <p className="text-sm text-gray-500">
            {actions.length} actions recommended
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map(action => (
          <div 
            key={action.id}
            className={`p-4 rounded-xl border transition-all ${
              completedActions.has(action.id)
                ? 'border-green-100 bg-green-50'
                : action.priority === 'high'
                ? 'border-yellow-100 bg-yellow-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[#1E1E3F]">
                    {action.description}
                  </h3>
                  {action.priority === 'high' && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Priority
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Last contact: {formatDistanceToNow(new Date(action.contact.lastContacted))} ago
                </p>
              </div>
              
              <button
                onClick={() => {
                  setCompletedActions(prev => {
                    const next = new Set(prev);
                    next.add(action.id);
                    return next;
                  });
                  onActionComplete(action.contact.email, action.type);
                }}
                disabled={completedActions.has(action.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  completedActions.has(action.id)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[#1E1E3F] text-white hover:bg-[#2D2D5F]'
                }`}
              >
                {completedActions.has(action.id) ? 'Completed' : 'Take Action'}
              </button>
            </div>

            {!completedActions.has(action.id) && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                  <div className="font-medium mb-1">Suggested Message:</div>
                  {action.suggestedMessage}
                </div>
              </div>
            )}
          </div>
        ))}

        {actions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No actions needed right now. Great job staying on top of your network!
          </div>
        )}
      </div>
    </div>
  );
}
