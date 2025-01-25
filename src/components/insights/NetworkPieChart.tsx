import { ResponsivePie } from '@nivo/pie';
import { useMemo } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  industry?: string;
  role?: string;
  location?: string;
  lastInteraction?: string;
  relationshipStrength?: number;
  tags?: string[];
  [key: string]: any; // Allow for dynamic custom fields
}

interface NetworkPieChartProps {
  contacts: Contact[];
}

const NetworkPieChart = ({ contacts }: NetworkPieChartProps) => {
  const pieData = useMemo(() => {
    // Get all unique fields from contacts excluding certain base fields
    const excludedFields = new Set([
      'id', 
      'name', 
      'email', 
      'lastInteraction', 
      'tags',
      'createdAt',
      'updatedAt'
    ]);

    // Collect all unique field names from all contacts
    const allFields = new Set<string>();
    contacts.forEach(contact => {
      Object.keys(contact).forEach(field => {
        if (!excludedFields.has(field)) {
          allFields.add(field);
        }
      });
    });
    
    return Array.from(allFields).map(field => {
      const total = contacts.reduce((acc, contact) => {
        return contact[field] ? acc + 1 : acc;
      }, 0);

      return {
        id: field,
        label: field.charAt(0).toUpperCase() + 
              field.slice(1).replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to Title Case
        value: total,
      };
    });
  }, [contacts]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4 text-[#1E1E3F]">Network Distribution</h3>
      <div className="h-[400px]">
        <ResponsivePie
          data={pieData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]]
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
          }}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: '#999',
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: 'circle',
            }
          ]}
        />
      </div>
    </div>
  );
};

export default NetworkPieChart;