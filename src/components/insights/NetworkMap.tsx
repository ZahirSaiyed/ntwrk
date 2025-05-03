import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Contact } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateVelocityScore, VelocityScore } from '@/utils/velocityTracking';

interface NetworkMapProps {
  contacts: Contact[];
  timeframe: '30d' | '90d' | '1y';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// Add this interface before the NetworkMap component
interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  velocity: VelocityScore;
  radius: number;
  group: string;
}

const calculateNodeSize = (contact: Contact) => {
  const velocityScore = calculateVelocityScore(contact).score;
  return Math.max(5, Math.min(15, velocityScore * 0.15)); // Returns size between 5-15px
};

const generateNetworkLinks = (contacts: Contact[]) => {
  const links: { source: string | { x: number; y: number }; target: string | { x: number; y: number }; value: number; }[] = [];
  
  // Create links between contacts who have interacted
  contacts.forEach((contact, i) => {
    contacts.slice(i + 1).forEach(otherContact => {
      // You can customize this logic based on your Contact type structure
      // This is just an example assuming there's some interaction data
      const interactionStrength = 1; // Calculate this based on your data
      
      links.push({
        source: contact.email,
        target: otherContact.email,
        value: interactionStrength
      });
    });
  });
  
  return links;
};

const inferContactGroup = (contact: Contact) => {
  const velocityScore = calculateVelocityScore(contact).score;
  if (velocityScore >= 80) return 'Strong';
  if (velocityScore >= 50) return 'Stable';
  return 'Needs Attention';
};

// Function to get node color based on trend
const getNodeColor = (trend: 'rising' | 'stable' | 'falling' | undefined) => {
  switch (trend) {
    case 'rising':
      return '#22C55E'; // Green
    case 'stable':
      return '#3B82F6'; // Blue
    case 'falling':
      return '#EAB308'; // Yellow
    default:
      return '#6B7280'; // Gray
  }
};

// Add this function before the useEffect
const drag = (simulation: d3.Simulation<NetworkNode, undefined>) => {
  return d3.drag<any, NetworkNode>()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
};

export default function NetworkMap({ contacts, timeframe, isExpanded, onToggleExpand }: NetworkMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !isExpanded || contacts.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Calculate network metrics
    const nodes: NetworkNode[] = contacts.map(contact => ({
      id: contact.email,
      name: contact.name,
      velocity: calculateVelocityScore(contact),
      radius: calculateNodeSize(contact),
      group: inferContactGroup(contact),
      x: undefined,
      y: undefined,
      index: undefined,
      vx: undefined,
      vy: undefined
    }));

    // Create links based on interaction patterns
    const links = generateNetworkLinks(contacts);

    // Setup dimensions
    const width = svgRef.current.clientWidth;
    const height = 500;

    // Setup force simulation
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force("link", d3.forceLink<NetworkNode, any>(links).id((d) => d.id))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => (d as NetworkNode).radius + 5));

    // Create SVG elements
    const svg = d3.select(svgRef.current);

    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ddd")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => getNodeColor(d.velocity.trend))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(drag(simulation));

    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.name)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", 4);

    // Add tooltips
    node.append("title")
      .text(d => `${d.name}\nVelocity: ${d.velocity.score}\nGroup: ${d.group}`);

    // Update positions
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("cx", d => d.x ?? 0)
        .attr("cy", d => d.y ?? 0);

      label
        .attr("x", d => d.x ?? 0)
        .attr("y", d => d.y ?? 0);
    });

  }, [contacts, isExpanded, timeframe]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E3F]">Network Map</h2>
            <p className="text-sm text-gray-500">
              Visualize your professional relationships
            </p>
          </div>
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="p-2 hover:bg-gray-50 rounded-full"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <svg 
                ref={svgRef} 
                width="100%" 
                height="500"
                className="bg-[#FAFAFA] rounded-xl"
              />
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <LegendItem color="#22C55E" label="Strong Relationships" />
                <LegendItem color="#3B82F6" label="Stable Connections" />
                <LegendItem color="#EAB308" label="Needs Attention" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: color }} />
    <span className="text-gray-600">{label}</span>
  </div>
);
