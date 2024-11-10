import { Contact } from '@/types';
import { calculateNetworkScore } from '@/utils/networkAnalytics';
import { getNetworkMetricsExplanation } from '@/utils/metricExplanations';
import Tooltip from '@/components/Tooltip';

interface Props {
  contacts: Contact[];
  className?: string;
}

export default function NetworkScore({ contacts, className = '' }: Props) {
  const baseMetrics = calculateNetworkScore(contacts);
  const metrics = getNetworkMetricsExplanation(baseMetrics.metrics);
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <Tooltip content={metrics.score.explanation}>
          <div>
            <div className="flex items-center gap-3">
              <div className="text-6xl font-bold text-[#1E1E3F]">
                {baseMetrics.score}
              </div>
              <div className={`h-12 w-1.5 rounded-full ${
                baseMetrics.score >= 80 ? 'bg-[#22C55E]' : 
                baseMetrics.score >= 50 ? 'bg-[#EAB308]' : 
                'bg-red-500'
              }`} />
            </div>
            <div className="text-sm font-medium text-gray-500 mt-1">Network Score</div>
          </div>
        </Tooltip>

        <div className="grid grid-cols-3 gap-12">
          <Tooltip content={metrics.activeRelationships.explanation}>
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#1E1E3F] flex items-center justify-center gap-2">
                {metrics.activeRelationships.count}
                <span className="text-[#22C55E] text-lg">↗</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">Active Relationships</div>
            </div>
          </Tooltip>
          
          <Tooltip content={metrics.avgResponseTime.explanation}>
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#1E1E3F] flex items-center justify-center gap-2">
                {metrics.avgResponseTime.hours}h
                <span className="text-[#3B82F6] text-lg">→</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Response Time</div>
            </div>
          </Tooltip>
          
          <Tooltip content={metrics.networkReach.explanation}>
            <div className="text-center">
              <div className="text-3xl font-semibold text-[#1E1E3F] flex items-center justify-center gap-2">
                {metrics.networkReach.value}
                <span className="text-[#22C55E] text-lg">↗</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">Network Reach</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}