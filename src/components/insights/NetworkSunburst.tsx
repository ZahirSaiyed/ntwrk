import { ResponsiveSunburst } from '@nivo/sunburst';
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
}

interface SunburstData {
  name: string;
  children?: SunburstData[];
  value?: number;
}

interface NetworkSunburstProps {
  contacts: Contact[];
}

const NetworkSunburst = ({ contacts }: NetworkSunburstProps) => {
  const sunburstData = useMemo(() => {
    const processField = (fieldName: keyof Contact) => {
      const groups: { [key: string]: Contact[] } = {};
      
      contacts.forEach(contact => {
        const value = contact[fieldName]?.toString() || 'Unknown';
        if (!groups[value]) groups[value] = [];
        groups[value].push(contact);
      });

      return {
        name: fieldName,
        children: Object.entries(groups).map(([key, contacts]) => ({
          name: key,
          value: contacts.length
        }))
      };
    };

    return {
      name: 'Network',
      children: [
        processField('company'),
        processField('industry'),
        processField('role'),
        processField('location'),
        processField('relationshipStrength'),
      ]
    };
  }, [contacts]);

  return (
    <div className="h-[400px] bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">Network Distribution</h3>
      <div className="h-[340px]">
        <ResponsiveSunburst
          data={sunburstData}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          id="name"
          value="value"
          cornerRadius={2}
          borderColor={{ theme: 'background' }}
          colors={{ scheme: 'nivo' }}
          childColor={{
            from: 'color',
            modifiers: [['brighter', 0.1]]
          }}
          enableArcLabels={true}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 1.4]]
          }}
        />
      </div>
    </div>
  );
};

export default NetworkSunburst;