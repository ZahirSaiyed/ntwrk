import { Contact } from '@/types';
import { calculateNetworkScore } from '@/utils/networkAnalytics';
import { getNetworkMetricsExplanation } from '@/utils/metricExplanations';
import Tooltip from '@/components/Tooltip';

interface Props {
  contacts: Contact[];
  className?: string;
  onViewChange: (view: 'organize' | 'analyze') => void;
}

export default function NetworkScore({ contacts, className = '', onViewChange }: Props) {
  const baseMetrics = calculateNetworkScore(contacts);
  const metrics = getNetworkMetricsExplanation(baseMetrics.metrics);
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Score Section */}
        <div className="flex items-center gap-8">
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
            <p className="text-sm text-gray-600 mt-2 max-w-xs">
              {baseMetrics.score >= 80 ? 'Excellent network health! Keep up the great work.' :
               baseMetrics.score >= 50 ? 'Good foundation. Room for strengthening connections.' :
               'Let\'s work on building stronger relationships.'}
            </p>
          </div>

          <div className="h-16 w-px bg-gray-200 hidden lg:block" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow">
          <MetricCard
            value={metrics.activeRelationships.count}
            trend="up"
            label="Active Relationships"
            explanation={metrics.activeRelationships.explanation}
            suggestion="Try reaching out to 3 contacts this week"
          />
          
          <MetricCard
            value={`${metrics.avgResponseTime.hours}h`}
            trend="neutral"
            label="Avg Response Time"
            explanation={metrics.avgResponseTime.explanation}
            suggestion="Aim to respond within 24 hours"
          />
          
          <MetricCard
            value={metrics.networkReach.value}
            trend="up"
            label="Network Reach"
            explanation={metrics.networkReach.explanation}
            suggestion="Connect with similar professionals"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">Suggested Actions</h4>
          <button className="text-sm text-[#1E1E3F] hover:text-[#2D2D5F]">
            View All →
          </button>
        </div>
        <div className="mt-4 flex gap-4">
          <QuickAction
            icon="👥"
            label="Organize Network"
            description="Discover and manage groups"
            onClick={() => onViewChange('organize')}
          />
          <QuickAction
            icon="📊"
            label="Activity Timeline"
            description="Track communication patterns over time"
            onClick={() => onViewChange('analyze')}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  label: string;
  explanation: string;
  suggestion: string;
}

function MetricCard({ value, trend, label, explanation, suggestion }: MetricCardProps) {
  return (
    <Tooltip content={
      <div className="space-y-2">
        <p>{explanation}</p>
        <p className="text-sm text-[#22C55E]">💡 Tip: {suggestion}</p>
      </div>
    }>
      <div className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-help">
        <div className="text-3xl font-semibold text-[#1E1E3F] flex items-center justify-center gap-2">
          {value}
          {trend === 'up' && <span className="text-[#22C55E] text-lg">↗</span>}
          {trend === 'down' && <span className="text-red-500 text-lg">↘</span>}
          {trend === 'neutral' && <span className="text-[#3B82F6] text-lg">→</span>}
        </div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
    </Tooltip>
  );
}

interface QuickActionProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}

function QuickAction({ icon, label, description, onClick }: QuickActionProps) {
  return (
    <button className="flex-1 p-4 rounded-xl border border-gray-200 hover:border-[#1E1E3F] hover:bg-[#F4F4FF] transition-all group" onClick={onClick}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-[#1E1E3F]">{label}</div>
      <div className="text-xs text-gray-500 group-hover:text-gray-600">{description}</div>
    </button>
  );
}