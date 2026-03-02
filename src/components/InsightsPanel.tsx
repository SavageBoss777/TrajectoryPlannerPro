import { motion } from 'framer-motion';
import { Flame, TrendingDown, TrendingUp, Info } from 'lucide-react';
import type { InsightsResult } from '@/lib/sensitivity';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InsightsPanelProps {
  insights: InsightsResult;
}

function StatementRow({ text, index }: { text: string; index: number }) {
  const isPositive = text.includes('−');

  return (
    <motion.div
      className="flex items-start gap-3 rounded-lg border border-border bg-card/60 px-4 py-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
    >
      {isPositive ? (
        <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--chart-positive))]" />
      ) : (
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--chart-negative))]" />
      )}
      <span className="text-sm text-foreground/90">{text}</span>
    </motion.div>
  );
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-semibold">What's driving your results?</h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[260px]">
              <p className="text-xs leading-relaxed">
                Based on sensitivity sweeps (single-variable perturbations) using 200-run Monte Carlo simulations per habit. 
                Each habit is increased/decreased by its step size while others remain fixed.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Burnout Drivers */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Burnout Risk Drivers
          </h3>
          <div className="space-y-2">
            {insights.burnoutStatements.map((s, i) => (
              <StatementRow key={i} text={s} index={i} />
            ))}
          </div>
        </div>

        {/* GPA Instability Drivers */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            GPA Stability Drivers
          </h3>
          <div className="space-y-2">
            {insights.gpaStatements.map((s, i) => (
              <StatementRow key={i} text={s} index={i + 3} />
            ))}
          </div>
        </div>
      </div>


    </motion.div>
  );
}
