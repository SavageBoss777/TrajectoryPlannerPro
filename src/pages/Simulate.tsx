import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { runSimulation, type SimulationResult, type ProfileInput, type HabitInput } from '@/lib/simulation';
import { runSensitivityAnalysis, type InsightsResult } from '@/lib/sensitivity';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import MetricCard from '@/components/MetricCard';
import RiskBar from '@/components/RiskBar';
import SimulationCharts from '@/components/SimulationCharts';
import InsightsPanel from '@/components/InsightsPanel';
import { Play, Save } from 'lucide-react';
import { formatDollar } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import ResultsChat from "@/components/ResultsChat";

export default function Simulate() {
  const { user } = useAuth();
  const [horizon, setHorizon] = useState('1year');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [profileData, setProfileData] = useState<ProfileInput | null>(null);
  const [habitData, setHabitData] = useState<HabitInput | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('habits').select('*').eq('user_id', user.id).maybeSingle(),
    ]).then(([profileRes, habitsRes]) => {
      if (profileRes.data) {
        setProfileData({
          age: profileRes.data.age || 21,
          education_level: profileRes.data.education_level || 'undergraduate',
          major: profileRes.data.major || '',
          baseline_gpa: Number(profileRes.data.baseline_gpa) || 3.0,
          income: Number(profileRes.data.income) || 45000,
          health_score: Number(profileRes.data.health_score) || 70,
        });
      }
      if (habitsRes.data) {
        setHabitData({
          study_hours: Number(habitsRes.data.study_hours) || 10,
          workout_freq: Number(habitsRes.data.workout_freq) || 3,
          skill_hours: Number(habitsRes.data.skill_hours) || 5,
          sleep_avg: Number(habitsRes.data.sleep_avg) || 7,
          spending: Number(habitsRes.data.spending) || 1500,
          savings_rate: Number(habitsRes.data.savings_rate) || 15,
        });
      }
    });
  }, [user]);

  const handleRun = () => {
    if (!profileData || !habitData) {
      toast.error('Please complete your Profile and Habits first');
      return;
    }
    setRunning(true);
    setResult(null);
    setInsights(null);
    setTimeout(() => {
      const res = runSimulation(profileData, habitData, horizon);
      setResult(res);
      setRunning(false);
      // Run sensitivity sweep in next tick to keep UI responsive
      setTimeout(() => {
        const ins = runSensitivityAnalysis(profileData, habitData, horizon);
        setInsights(ins);
      }, 50);
    }, 600);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    const { error } = await supabase.from('simulations').insert({
      user_id: user.id,
      time_horizon: result.timeHorizon,
      result_json: result as any,
    });
    if (error) toast.error(error.message);
    else toast.success('Simulation saved');
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold">Run Simulation</h1>
            <p className="mt-1 text-sm text-muted-foreground">Monte Carlo projection based on your current profile and habits.</p>
          </motion.div>
          <motion.div
            className="flex items-end gap-3"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="space-y-1.5">
              <Label className="text-xs">Time Horizon</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                  <SelectItem value="5years">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleRun} disabled={running} className="bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90">
                <Play className="mr-2 h-4 w-4" /> {running ? 'Running...' : 'Run Simulation'}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {!profileData && (
          <motion.div
            className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            Complete your <a href="/profile" className="text-primary underline">Profile</a> and <a href="/habits" className="text-primary underline">Habits</a> to run a simulation.
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {running && (
            <motion.div
              key="running"
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="mt-4 text-sm text-muted-foreground">Running 1,000 simulations...</p>
            </motion.div>
          )}

          {result && !running && (
            <motion.div
              key="results"
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Results</h2>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-3.5 w-3.5" /> Save
                  </Button>
                </motion.div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <MetricCard label="GPA" value={result.gpa.median.toFixed(2)} subtitle={`${result.gpa.low}–${result.gpa.high}`} delay={0} />
                <MetricCard label="Income" value={formatDollar(result.income.median)} subtitle={`${formatDollar(result.income.low)}–${formatDollar(result.income.high)}`} delay={0.06} />
                <MetricCard label="Savings" value={formatDollar(result.savings.median, 1)} subtitle={`${formatDollar(result.savings.low, 1)}–${formatDollar(result.savings.high, 1)}`} delay={0.12} />
                <MetricCard label="Health" value={result.healthScore.median} subtitle={`${result.healthScore.low}–${result.healthScore.high}`} delay={0.18} />
                <MetricCard label="Career Ready" value={`${result.careerReadiness.median}%`} subtitle={`${result.careerReadiness.low}–${result.careerReadiness.high}%`} delay={0.24} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <RiskBar label="Burnout Probability" value={result.riskScores.burnout} delay={0.3} />
                <RiskBar label="Financial Instability" value={result.riskScores.financialInstability} delay={0.35} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <SimulationCharts data={result.timeline} />
              </motion.div>

              {insights && <InsightsPanel insights={insights} />}

              <ResultsChat
                context={{
                  horizon,
                  result,
                  insights,
                  profile: profileData,
                  habits: habitData,
                }}
                title="Ask Trajectory AI about your results"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}