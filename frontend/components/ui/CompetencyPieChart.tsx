'use client';

import * as React from 'react';

export const SKILL_DIMENSIONS = [
  { key: 'empathy', label: 'Empathy', color: '#2563eb' },            // Blue
  { key: 'communication', label: 'Communication', color: '#0284c7' },  // Sky
  { key: 'discovery', label: 'Discovery', color: '#0d9488' },          // Teal
  { key: 'objectionHandling', label: 'Objection Handling', color: '#f59e0b' }, // Amber
  { key: 'solutionOffering', label: 'Solution Offering', color: '#f97316' },   // Orange
  { key: 'closing', label: 'Closing', color: '#6366f1' },              // Indigo
  { key: 'compliance', label: 'Compliance', color: '#10b981' },        // Emerald
];

export interface CompetencyPieChartProps {
  skills?: Record<string, number>;
  isLoading?: boolean;
}

export function CompetencyPieChart({ skills = {}, isLoading = false }: CompetencyPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  const items = React.useMemo(() => {
    const s = skills || {};
    return SKILL_DIMENSIONS.map((dim) => ({
      ...dim,
      score: s[dim.key] ?? (s as Record<string, number>)[dim.key.toLowerCase()] ?? 0,
    }));
  }, [skills]);

  const totalScore = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.score, 0);
  }, [items]);

  // Center and radius for SVG canvas
  const cx = 380;
  const cy = 230;
  const r = 135;

  // Build slice paths, in-slice badges, and connector callouts
  const slices = React.useMemo(() => {
    if (totalScore <= 0) return [];

    let currentAngle = -Math.PI / 2; // Start at 12 o'clock

    return items.map((item, index) => {
      const sliceAngle = (item.score / totalScore) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      if (sliceAngle <= 0.0001) {
        return {
          ...item,
          pathData: '',
          dx: 0,
          dy: 0,
          index,
          innerX: 0,
          innerY: 0,
          x0: 0,
          y0: 0,
          x1Callout: 0,
          y1Callout: 0,
          x2Callout: 0,
          y2Callout: 0,
          textX: 0,
          textAnchor: 'start' as const,
        };
      }

      let pathData = '';
      if (sliceAngle >= 2 * Math.PI - 0.001) {
        pathData = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
      } else {
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
        pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      }

      const midAngle = (startAngle + endAngle) / 2;
      const offset = 6;
      const dx = Math.cos(midAngle) * offset;
      const dy = Math.sin(midAngle) * offset;

      // In-slice label coordinate
      const innerR = r * 0.65;
      const innerX = cx + innerR * Math.cos(midAngle);
      const innerY = cy + innerR * Math.sin(midAngle);

      // External callout line coordinates
      const x0 = cx + r * Math.cos(midAngle);
      const y0 = cy + r * Math.sin(midAngle);
      const x1Callout = cx + (r + 24) * Math.cos(midAngle);
      const y1Callout = cy + (r + 24) * Math.sin(midAngle);
      const isRight = Math.cos(midAngle) >= 0;
      const x2Callout = isRight ? x1Callout + 20 : x1Callout - 20;
      const textX = isRight ? x2Callout + 7 : x2Callout - 7;
      const textAnchor: 'start' | 'end' = isRight ? 'start' : 'end';

      return {
        ...item,
        pathData,
        dx,
        dy,
        index,
        innerX,
        innerY,
        x0,
        y0,
        x1Callout,
        y1Callout,
        x2Callout,
        y2Callout: y1Callout,
        textX,
        textAnchor,
      };
    });
  }, [items, totalScore, cx, cy, r]);

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredIndex(index);
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Loading competency scores...
      </div>
    );
  }

  if (totalScore <= 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        No competency score data available for this employee.
      </div>
    );
  }

  const activeItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center w-full py-2">
      {/* Centered Integrated Fully Labeled Pie Chart SVG */}
      <div ref={chartRef} className="relative w-full max-w-2xl flex items-center justify-center">
        <svg
          viewBox="0 0 760 460"
          className="w-full h-auto overflow-visible select-none drop-shadow-xs"
        >
          {/* Connector lines and outer direct labels */}
          {slices.map((slice) => {
            if (!slice.pathData) return null;
            const isHovered = hoveredIndex === slice.index;

            return (
              <g
                key={`callout-${slice.key}`}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={(e) => handleMouseMove(e, slice.index)}
                onMouseMove={(e) => handleMouseMove(e, slice.index)}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setTooltipPos(null);
                }}
              >
                {/* Elbow connector polyline */}
                <polyline
                  points={`${slice.x0},${slice.y0} ${slice.x1Callout},${slice.y1Callout} ${slice.x2Callout},${slice.y2Callout}`}
                  fill="none"
                  stroke={isHovered ? slice.color : '#94a3b8'}
                  strokeWidth={isHovered ? 2.2 : 1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors duration-150"
                />

                {/* Anchor indicator dot */}
                <circle
                  cx={slice.x2Callout}
                  cy={slice.y2Callout}
                  r={isHovered ? 4.5 : 3.5}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* Direct skill label & score text */}
                <text
                  x={slice.textX}
                  y={slice.y2Callout + 4.5}
                  textAnchor={slice.textAnchor}
                  className="transition-all duration-150 text-xs select-none"
                  style={{
                    fontSize: '12.5px',
                    filter: isHovered ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : undefined,
                  }}
                >
                  <tspan
                    fontWeight={isHovered ? '700' : '600'}
                    fill={isHovered ? slice.color : '#1e293b'}
                  >
                    {slice.label}
                  </tspan>
                  <tspan
                    fontWeight="700"
                    fill={isHovered ? slice.color : '#0f172a'}
                    className="font-mono"
                  >
                    {' '}— {slice.score}%
                  </tspan>
                </text>
              </g>
            );
          })}

          {/* Slices and inside score badges */}
          {slices.map((slice) => {
            if (!slice.pathData) return null;
            const isHovered = hoveredIndex === slice.index;

            return (
              <g
                key={`slice-${slice.key}`}
                className="cursor-pointer"
                onMouseEnter={(e) => handleMouseMove(e, slice.index)}
                onMouseMove={(e) => handleMouseMove(e, slice.index)}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setTooltipPos(null);
                }}
              >
                {/* Pie Slice */}
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="transition-all duration-200"
                  style={{
                    transform: isHovered ? `translate(${slice.dx}px, ${slice.dy}px)` : undefined,
                    filter: isHovered ? 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2))' : undefined,
                    opacity: hoveredIndex !== null && !isHovered ? 0.65 : 1,
                  }}
                >
                  <title>{`${slice.label}: ${slice.score}%`}</title>
                </path>

                {/* In-slice score percentage badge */}
                <text
                  x={slice.innerX + (isHovered ? slice.dx : 0)}
                  y={slice.innerY + 1 + (isHovered ? slice.dy : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  className="font-mono font-bold pointer-events-none select-none transition-all duration-200"
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {slice.score}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activeItem && tooltipPos && (
          <div
            className="pointer-events-none absolute z-30 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white shadow-xl text-xs flex flex-col gap-0.5 transform -translate-x-1/2 -translate-y-full mb-3 transition-all duration-75 backdrop-blur-xs border border-slate-700/60"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 8}px`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeItem.color }}
              />
              <span className="font-semibold text-slate-100">{activeItem.label}</span>
              <span className="font-mono font-bold text-blue-300 ml-auto">{activeItem.score}%</span>
            </div>
            <span className="text-[10px] text-slate-400">Independent competency benchmark</span>
          </div>
        )}
      </div>

      {/* Visual Subtitle Note */}
      <p className="mt-3 text-center text-[11px] text-slate-400">
        * Slice proportions represent relative competency balance across evaluated dimensions; original benchmark scores are displayed directly.
      </p>
    </div>
  );
}
