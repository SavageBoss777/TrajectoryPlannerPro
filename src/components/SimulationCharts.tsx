import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TimelinePoint } from '@/lib/simulation';
import { formatDollar } from '@/lib/format';

interface SimChartProps {
  data: TimelinePoint[];
  dataKeyMedian: string;
  dataKeyLow: string;
  dataKeyHigh: string;
  label: string;
  format?: (v: number) => string;
}

function SimChart({ data, dataKeyMedian, dataKeyLow, dataKeyHigh, label, format }: SimChartProps) {
  const formatter = format || ((v: number) => v.toLocaleString());

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`grad-${dataKeyMedian}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(v) => formatter(v)} width={60} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '8px', fontSize: 12 }}
              labelFormatter={(l) => `Month ${l}`}
              formatter={(value: number) => [formatter(value), '']}
            />
            <Area type="monotone" dataKey={dataKeyHigh} stroke="none" fill="hsl(174, 72%, 46%)" fillOpacity={0.06} />
            <Area type="monotone" dataKey={dataKeyLow} stroke="none" fill="hsl(174, 72%, 46%)" fillOpacity={0.06} />
            <Area type="monotone" dataKey={dataKeyMedian} stroke="hsl(174, 72%, 46%)" strokeWidth={2} fill={`url(#grad-${dataKeyMedian})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SimulationCharts({ data }: { data: TimelinePoint[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SimChart data={data} dataKeyMedian="incomeMedian" dataKeyLow="incomeLow" dataKeyHigh="incomeHigh" label="Income Projection" format={(v) => formatDollar(v)} />
      <SimChart data={data} dataKeyMedian="gpaMedian" dataKeyLow="gpaLow" dataKeyHigh="gpaHigh" label="GPA Trajectory" format={(v) => v.toFixed(2)} />
      <SimChart data={data} dataKeyMedian="savingsMedian" dataKeyLow="savingsMedian" dataKeyHigh="savingsMedian" label="Savings Growth" format={(v) => formatDollar(v, 1)} />
      <SimChart data={data} dataKeyMedian="healthMedian" dataKeyLow="healthMedian" dataKeyHigh="healthMedian" label="Health Score" format={(v) => v.toFixed(0)} />
    </div>
  );
}
