import { Contact } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { getRelationshipHealth } from '@/utils/metricExplanations';
import Tooltip from '@/components/Tooltip';
interface Props {
  contact: Contact;
}

export default function RelationshipVelocityCard({ contact }: Props) {
  const health = getRelationshipHealth(contact);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-[#1E1E3F]">{contact.name}</h4>
        <Tooltip content={health.status.explanation}>
          <div className="text-sm font-medium">
            {health.status.label}
          </div>
        </Tooltip>
      </div>
      
      <div className="space-y-3">
        <Tooltip content={health.trend.explanation}>
          <div className="text-sm text-gray-600">
            Trend: {health.trend.direction}
          </div>
        </Tooltip>
        
        <Tooltip content={health.activityMetrics.recentActivity.explanation}>
          <div className="text-sm text-gray-500">
            Recent Activity: {health.activityMetrics.recentActivity.count} interactions
          </div>
        </Tooltip>
        
        <Tooltip content={health.activityMetrics.responseRate.explanation}>
          <div className="text-sm text-gray-500">
            Response Rate: {health.activityMetrics.responseRate.percentage.toFixed(0)}%
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
