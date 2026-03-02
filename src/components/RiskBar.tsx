import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RiskBarProps {
  label: string;
  value: number; // 0–1
  className?: string;
  delay?: number;
}

export default function RiskBar({ label, value, className, delay = 0 }: RiskBarProps) {
  const percent = Math.round(value * 100);
  const color = percent > 60 ? 'bg-chart-negative' : percent > 30 ? 'bg-chart-warning' : 'bg-chart-positive';

  return (
    <motion.div
      className={cn("space-y-1.5", className)}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <motion.span
          className="text-sm font-mono text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
        >
          {percent}%
        </motion.span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </motion.div>
  );
}
