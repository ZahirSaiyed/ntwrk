import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

// Static step label component - no animations
const StepLabel = React.memo(({ step, isActive }: { step: number; isActive: boolean }) => (
  <div className={`text-sm font-medium ${
    isActive ? 'text-[#1E1E3F]' : 'text-gray-400'
  }`}>
    Step {step}
  </div>
));
StepLabel.displayName = 'StepLabel';

// Inner dot animation component
const StepDot = React.memo(({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-2 h-2 rounded-full bg-white"
    />
  );
});
StepDot.displayName = 'StepDot';

// Static step indicator with animated inner dot
const StepIndicator = React.memo(({ isActive }: { step: number; isActive: boolean }) => (
  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
    isActive
      ? 'bg-[#1E1E3F] border-[#1E1E3F] text-white'
      : 'bg-white border-gray-300'
  }`}>
    <StepDot isActive={isActive} />
  </div>
));
StepIndicator.displayName = 'StepIndicator';

// Animated progress line between steps
const ProgressLine = React.memo(({ isActive, shouldAnimate }: { isActive: boolean; shouldAnimate: boolean }) => {
  return (
    <div className="flex-1 mx-2">
      <div className="h-2 bg-gray-200 rounded-full relative">
        {shouldAnimate ? (
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: isActive ? '100%' : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ) : (
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] rounded-full"
            style={{ width: isActive ? '100%' : 0 }}
          />
        )}
      </div>
    </div>
  );
});
ProgressLine.displayName = 'ProgressLine';

// Progress section (combines indicator and line)
const ProgressSection = React.memo(({ 
  step, 
  isActive, 
  isLastStep,
  currentStep 
}: { 
  step: number; 
  isActive: boolean; 
  isLastStep: boolean;
  currentStep: number;
}) => (
  <React.Fragment>
    <StepIndicator step={step} isActive={isActive} />
    {!isLastStep && (
      <ProgressLine 
        isActive={step < currentStep}
        shouldAnimate={step === currentStep - 1}
      />
    )}
  </React.Fragment>
));
ProgressSection.displayName = 'ProgressSection';

const ProgressBar = React.memo(function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  // Memoize steps array
  const steps = useMemo(() => 
    Array.from({ length: totalSteps }, (_, i) => i + 1),
    [totalSteps]
  );

  // Memoize the labels section
  const StepLabels = useMemo(() => (
    <div className="flex justify-between mb-2">
      {steps.map((step) => (
        <StepLabel 
          key={step} 
          step={step} 
          isActive={step <= currentStep} 
        />
      ))}
    </div>
  ), [steps, currentStep]);

  return (
    <div className="w-full mb-6">
      {StepLabels}
      <div className="relative">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <ProgressSection
              key={step}
              step={step}
              isActive={step <= currentStep}
              isLastStep={index === steps.length - 1}
              currentStep={currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProgressBar;
