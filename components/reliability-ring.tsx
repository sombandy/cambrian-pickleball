import React from "react";

interface ReliabilityRingProps {
  value: number; // 0-100
  size?: number; // diameter in pixels, default 28
}

export const ReliabilityRing = React.forwardRef<SVGSVGElement, ReliabilityRingProps>(
  ({ value, size = 28 }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value));

    // Determine color based on reliability tier
    let strokeColor: string;
    if (clampedValue >= 70) {
      strokeColor = "#10b981"; // green — Established
    } else if (clampedValue >= 40) {
      strokeColor = "#3b82f6"; // blue — Developing
    } else {
      strokeColor = "#eab308"; // yellow — Provisional
    }

    const strokeWidth = 2;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="inline-block flex-shrink-0"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.05))" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Percentage text */}
        {size >= 28 && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dy="0.3em"
            fontSize={Math.max(7, size / 4)}
            fontWeight="700"
            fill="#374151"
          >
            {Math.round(clampedValue)}
          </text>
        )}
      </svg>
    );
  }
);

ReliabilityRing.displayName = "ReliabilityRing";
