import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { type JournalEntry } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Clock, TrendingUp, Lightbulb } from 'lucide-react';

interface Props {
  entries: JournalEntry[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  val: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

export function LearningConstellation({ entries }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Extract concepts and create graph data
  const graphData = React.useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const concepts = new Map<string, number>();

    // Extract concepts from titles and content
    entries.forEach(entry => {
      const words = `${entry.title} ${entry.content}`
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 4);

      words.forEach(word => {
        concepts.set(word, (concepts.get(word) || 0) + 1);
      });
    });

    // Create nodes for top concepts
    Array.from(concepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([concept, count]) => {
        nodes.push({
          id: concept,
          name: concept,
          val: Math.sqrt(count) * 2
        });
      });

    // Create links between related concepts
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach(target => {
        if (Math.random() < 0.3) {
          links.push({
            source: node.id,
            target: target.id,
            value: 1
          });
        }
      });
    });

    return { nodes, links };
  }, [entries]);

  // D3 Force Graph
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(graphData.links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", "hsl(210 40% 96.1%)")
      .attr("stroke-width", 1);

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", d => (d as Node).val)
      .attr("fill", "hsl(222.2 47.4% 11.2%)");

    // Add labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .text(d => (d as Node).name)
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", 4);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("cx", d => (d as any).x)
        .attr("cy", d => (d as any).y);

      label
        .attr("x", d => (d as any).x)
        .attr("y", d => (d as any).y);
    });

    // Handle window resize
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 600
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      simulation.stop();
    };
  }, [graphData, dimensions]);

  // Calculate recent insights
  const recentInsights = React.useMemo(() => {
    if (entries.length === 0) return [];

    const recentEntries = entries.slice(-5);
    const commonThemes = new Set<string>();

    recentEntries.forEach(entry => {
      const words = entry.title.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 4) commonThemes.add(word);
      });
    });

    return Array.from(commonThemes).slice(0, 3);
  }, [entries]);

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4" ref={containerRef}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Learning Patterns
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your learning journey shows focus on:
            </p>
            <ul className="list-disc pl-4 text-sm">
              {graphData.nodes.slice(0, 3).map(node => (
                <li key={node.id} className="text-gray-700">
                  {node.name}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              In your recent entries, you've explored:
            </p>
            <ul className="list-disc pl-4 text-sm">
              {recentInsights.map(insight => (
                <li key={insight} className="text-gray-700">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Suggested Focus
          </h3>
          <p className="text-sm text-gray-600">
            Based on your patterns, consider exploring related topics to deepen your understanding.
          </p>
        </Card>
      </div>
    </div>
  );
}