interface Action {
  id: string;
  contactId: string;
  type: string;
  priority: string;
  // Add other action properties as needed
}

interface ActionCardProps {
  action: Action;
  onComplete: () => void;
}

export default function ActionCard({ action, onComplete }: ActionCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      {/* Basic implementation - expand based on your needs */}
      <h3>{action.type}</h3>
      <button onClick={onComplete}>Complete</button>
    </div>
  );
} 