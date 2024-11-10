import { motion } from 'framer-motion';

interface Props {
  onSelect: (outcome: 'organize' | 'engage' | 'analyze' | null) => void;
  selectedOutcome: 'organize' | 'engage' | 'analyze' | null;
}

export default function OutcomeSelector({ onSelect, selectedOutcome }: Props) {
  return (
    <motion.div
      layout
      className={`transition-all ${
        selectedOutcome ? 'mb-6' : 'mb-8'
      }`}
    >
      <motion.div
        layout
        className={`grid ${
          selectedOutcome 
            ? 'grid-cols-3 gap-4' 
            : 'grid-cols-1 md:grid-cols-3 gap-6'
        }`}
      >
        {['organize', 'engage', 'analyze'].map((outcome) => (
          <motion.button
            layout
            key={outcome}
            onClick={() => onSelect(outcome as 'organize' | 'engage' | 'analyze')}
            className={`p-6 bg-white rounded-2xl transition-all ${
              selectedOutcome === outcome 
                ? 'ring-2 ring-[#1E1E3F] ring-opacity-50' 
                : 'hover:shadow-md'
            } ${
              selectedOutcome && selectedOutcome !== outcome 
                ? 'opacity-50' 
                : ''
            }`}
          >
            <motion.div
              layout
              className={`flex items-center ${
                selectedOutcome ? 'gap-3' : 'flex-col'
              }`}
            >
              <motion.div
                layout
                className={`${
                  selectedOutcome 
                    ? 'w-8 h-8' 
                    : 'h-48 w-full flex items-center justify-center mb-4'
                }`}
              >
                <img
                  src={`/undraw_${outcome}.svg`}
                  alt={outcome}
                  className={`transition-all ${
                    selectedOutcome 
                      ? 'w-8 h-8' 
                      : 'w-40 h-40 group-hover:scale-105'
                  }`}
                />
              </motion.div>
              <motion.div layout className="text-left">
                <motion.h3 
                  layout
                  className={`font-semibold ${
                    selectedOutcome ? 'text-base' : 'text-lg mb-2'
                  }`}
                >
                  {outcome === 'organize' && 'Organize Network'}
                  {outcome === 'engage' && 'Engage Contacts'}
                  {outcome === 'analyze' && 'Analyze Patterns'}
                </motion.h3>
                {!selectedOutcome && (
                  <motion.p 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-gray-500"
                  >
                    {outcome === 'organize' && 'Create smart groups and categorize your contacts'}
                    {outcome === 'engage' && 'Get actionable insights to maintain relationships'}
                    {outcome === 'analyze' && 'Visualize your network growth and patterns'}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
