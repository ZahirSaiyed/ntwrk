import React from 'react';

interface StepperProps {
  currentStep: 'name' | 'select';
}

export default function CreateGroupStepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className={`flex items-center ${currentStep === 'name' ? 'text-[#1E1E3F]' : 'text-gray-400'}`}>
        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium">
          1
        </div>
        <span className="ml-2">Name Group</span>
      </div>
      <div className="w-16 h-[2px] mx-4 bg-gray-200" />
      <div className={`flex items-center ${currentStep === 'select' ? 'text-[#1E1E3F]' : 'text-gray-400'}`}>
        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium">
          2
        </div>
        <span className="ml-2">Select Contacts</span>
      </div>
    </div>
  );
}
