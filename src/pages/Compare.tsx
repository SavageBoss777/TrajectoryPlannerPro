import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { runSimulation, type SimulationResult, type ProfileInput, type HabitInput } from '@/lib/simulation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import MetricCard from '@/components/MetricCard';
import { formatDollar } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitCompare, Play } from 'lucide-react';

export default function Compare() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileInput | null>(null);
  const [baseHabits, setBaseHabits] = useState<HabitInput | null>(null);
  const [altHabits, setAltHabits] = useState<HabitInput | null>(null);
  const [horizon, setHorizon] = useState('1year');
  const [results, setResults] = useState<{ current: SimulationResult; alt: SimulationResult } | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('habits').select('*').eq('user_id', user.id).maybeSingle(),
    ]).then(([pRes, hRes]) => {
      if (pRes.data) {
        setProfileData({
          age: pRes.data.age || 21,
          education_level: pRes.data.education_level || 'undergraduate',
          major: pRes.data.major || '',
          baseline_gpa: Number(pRes.data.baseline_gpa) || 3.0,
          income: Number(pRes.data.income) || 45000,
          health_score: Number(pRes.data.health_score) || 70,
        });
      }
      if (hRes.data) {
        const h: HabitInput = {
          study_hours: Number(hRes.data.study_hours) || 10,
          workout_freq: Number(hRes.data.workout_freq) || 3,
          skill_hours: Number(hRes.data.skill_hours) || 5,
          sleep_avg: Number(hRes.data.sleep_avg) || 7,
          spending: Number(hRes.data.spending) || 1500,
          savings_rate: Number(hRes.data.savings_rate) || 15,
        };
        setBaseHabits(h);
        setAltHabits({ ...h });
      }
    });
  }, [user]);

  const handleCompare = () => {
    if (!profileData || !baseHabits || !altHabits) {
      toast.error('Complete profile & habits first');
      return;
    }
    setRunning(true);
    setTimeout(() => {
      const current = runSimulation(profileData, baseHabits, horizon);
      const alt = runSimulation(profileData, altHabits, horizon);
      setResults({ current, alt });
      setRunning(false);
    }, 800);
  };

  const delta = (curr: number, alt: number) => {
    const diff = alt - curr;
    const pct = curr !== 0 ? ((diff / Math.abs(curr)) * 100).toFixed(1) : '0';
    return { diff, pct, positive: diff >= 0 };
  };

  const altFields = [
    { key: 'study_hours' as const, label: 'Study Hours/wk' },
    { key: 'workout_freq' as const, label: 'Workouts/wk' },
    { key: 'skill_hours' as const, label: 'Skill Hours/wk' },
    { key: 'sleep_avg' as const, label: 'Sleep (hrs)' },
    { key: 'spending' as const, label: 'Spending/mo ($)' },
    { key: 'savings_rate' as const, label: 'Savings Rate (%)' },
  ];

  // Merge timelines for overlay chart
  const mergedTimeline = results
    ? results.current.timeline.map((pt, i) => ({
        month: pt.month,
        currentIncome: pt.incomeMedian,
        altIncome: results.alt.timeline[i]?.incomeMedian || 0,
        currentGpa: pt.gpaMedian,
        altGpa: results.alt.timeline[i]?.gpaMedian || 0,
      }))
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 opacity-0 animate-fade-in">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <GitCompare className="h-6 w-6 text-primary" /> Path Comparison
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Modify habits and compare outcomes side-by-side.</p>
      </div>

      {!altHabits ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Complete your <a href="/profile" className="text-primary underline">Profile</a> and <a href="/habits" className="text-primary underline">Habits</a> first.
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-xl border border-border bg-card p-6 opacity-0 animate-fade-in-delay-1">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Alternative Habits</h2>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {altFields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type="number"
                    value={altHabits[f.key]}
                    onChange={(e) => setAltHabits({ ...altHabits, [f.key]: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Horizon</Label>
                <Select value={horizon} onValueChange={setHorizon}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="5years">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCompare} disabled={running} className="mt-auto bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Play className="mr-2 h-4 w-4" /> {running ? 'Comparing...' : 'Compare'}
              </Button>
            </div>
          </div>

          {results && (
            <div className="space-y-8 opacity-0 animate-fade-in">
              {/* Delta cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Income Δ', d: delta(results.current.income.median, results.alt.income.median), fmt: (v: number) => formatDollar(v) },
                  { label: 'GPA Δ', d: delta(results.current.gpa.median, results.alt.gpa.median), fmt: (v: number) => v.toFixed(2) },
                  { label: 'Savings Δ', d: delta(results.current.savings.median, results.alt.savings.median), fmt: (v: number) => formatDollar(v, 1) },
                  { label: 'Burnout Δ', d: delta(results.current.riskScores.burnout, results.alt.riskScores.burnout), fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
                ].map((item) => (
                  <MetricCard
                    key={item.label}
                    label={item.label}
                    value={`${item.d.positive ? '+' : ''}${item.fmt(item.d.diff)}`}
                    subtitle={`${item.d.positive ? '+' : ''}${item.d.pct}%`}
                    trend={item.label === 'Burnout Δ' ? (item.d.positive ? 'down' : 'up') : (item.d.positive ? 'up' : 'down')}
                  />
                ))}
              </div>

              {/* Overlay charts */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Income Comparison</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mergedTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                        <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(v) => formatDollar(v)} width={55} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '8px', fontSize: 12 }} />
                        <Legend />
                        <Area type="monotone" dataKey="currentIncome" name="Current" stroke="hsl(215, 15%, 55%)" fill="hsl(215, 15%, 55%)" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="altIncome" name="Alternative" stroke="hsl(174, 72%, 46%)" fill="hsl(174, 72%, 46%)" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">GPA Comparison</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mergedTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                        <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} domain={[0, 4]} width={35} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 25%, 10%)', border: '1px solid hsl(222, 20%, 16%)', borderRadius: '8px', fontSize: 12 }} />
                        <Legend />
                        <Area type="monotone" dataKey="currentGpa" name="Current" stroke="hsl(215, 15%, 55%)" fill="hsl(215, 15%, 55%)" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="altGpa" name="Alternative" stroke="hsl(174, 72%, 46%)" fill="hsl(174, 72%, 46%)" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
