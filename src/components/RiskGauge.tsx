interface Props {
  score: number;
  size?: 'sm' | 'lg';
}

export default function RiskGauge({ score, size = 'lg' }: Props) {
  const color = score >= 70 ? 'hsl(0 72% 51%)' : score >= 40 ? 'hsl(38 92% 50%)' : 'hsl(160 84% 39%)';
  const label = score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM' : 'SAFE';
  const dim = size === 'lg' ? 180 : 80;
  const stroke = size === 'lg' ? 12 : 6;
  const r = (dim - stroke) / 2;
  const circumference = Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dim} height={dim / 2 + stroke} viewBox={`0 0 ${dim} ${dim / 2 + stroke}`}>
        <path
          d={`M ${stroke / 2} ${dim / 2} A ${r} ${r} 0 0 1 ${dim - stroke / 2} ${dim / 2}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${dim / 2} A ${r} ${r} 0 0 1 ${dim - stroke / 2} ${dim / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {size === 'lg' && (
          <>
            <text x={dim / 2} y={dim / 2 - 10} textAnchor="middle" fill={color} fontSize="36" fontWeight="800" fontFamily="Inter">{score}</text>
            <text x={dim / 2} y={dim / 2 + 12} textAnchor="middle" fill={color} fontSize="11" fontWeight="600" fontFamily="Inter">{label}</text>
          </>
        )}
      </svg>
    </div>
  );
}
