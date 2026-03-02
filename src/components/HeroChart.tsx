import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const demoData = Array.from({ length: 13 }, (_, i) => ({
  month: i,
  median: 50000 + i * 3000 + Math.sin(i * 0.5) * 2000,
  low: 45000 + i * 2000,
  high: 55000 + i * 4500 + Math.sin(i * 0.3) * 3000,
}));

export default function HeroChart() {
  return (
    <div className="h-64 w-full opacity-0 animate-fade-in-delay-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={demoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="heroBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.08} />
              <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Area type="monotone" dataKey="high" stroke="none" fill="url(#heroBand)" />
          <Area type="monotone" dataKey="median" stroke="hsl(174, 72%, 46%)" strokeWidth={2} fill="url(#heroGrad)" />
          <Area type="monotone" dataKey="low" stroke="none" fill="url(#heroBand)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
