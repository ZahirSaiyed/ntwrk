interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'green' | 'yellow';
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-[#1E1E3F] text-white',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
