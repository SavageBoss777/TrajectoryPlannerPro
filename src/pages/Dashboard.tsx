import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/MetricCard';
import { Play, GitCompare, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDollar } from '@/lib/format';
import PageTransition, { StaggerContainer, staggerItem } from '@/components/PageTransition';
import type { SimulationResult } from '@/lib/simulation';

interface SimRow {
  id: string;
  time_horizon: string;
  result_json: SimulationResult;
  created_at: string;
  label: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<SimRow[]>([]);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle().then(({ data }) => setHasProfile(!!data));
    supabase.from('simulations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => setSimulations((data as unknown as SimRow[]) || []));
  }, [user]);

  const latest = simulations[0]?.result_json;

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your trajectory at a glance.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/simulate">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90">
                  <Play className="mr-2 h-4 w-4" /> Run Simulation
                </Button>
              </motion.div>
            </Link>
            <Link to="/compare">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline"><GitCompare className="mr-2 h-4 w-4" /> Compare Paths</Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        <AnimatePresence>
          {!hasProfile && (
            <motion.div
              className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Complete your profile to get started</p>
                  <p className="text-sm text-muted-foreground">Set up your baseline data and habits to power simulations.</p>
                </div>
                <Link to="/profile" className="ml-auto">
                  <Button size="sm" variant="outline">Set Up Profile</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {latest && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Latest Simulation</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Projected GPA" value={latest.gpa.median.toFixed(2)} trend="up" delay={0.05} />
              <MetricCard label="Projected Income" value={formatDollar(latest.income.median)} trend="up" delay={0.1} />
              <MetricCard label="Projected Savings" value={formatDollar(latest.savings.median, 1)} trend={latest.savings.median > 0 ? 'up' : 'down'} delay={0.15} />
              <MetricCard label="Burnout Risk" value={`${Math.round(latest.riskScores.burnout * 100)}%`} trend={latest.riskScores.burnout > 0.4 ? 'down' : 'up'} delay={0.2} />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Simulation History</h2>
          {simulations.length === 0 ? (
            <motion.div
              className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              No simulations yet. <Link to="/simulate" className="text-primary underline">Run your first one</Link>.
            </motion.div>
          ) : (
            <StaggerContainer className="space-y-2" staggerDelay={0.05}>
              {simulations.map((sim) => (
                <motion.div
                  key={sim.id}
                  variants={staggerItem}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3 transition-shadow hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{sim.time_horizon.replace('months', ' Months').replace('year', ' Year').replace('years', ' Years')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sim.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-mono">GPA {sim.result_json.gpa.median.toFixed(2)}</span>
                    <span className="font-mono">{formatDollar(sim.result_json.income.median)}</span>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
