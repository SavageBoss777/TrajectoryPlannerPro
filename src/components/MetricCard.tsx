import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  delay?: number;
}

export default function MetricCard({ label, value, subtitle, trend, className, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-shadow hover:border-primary/30 hover:glow-sm",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <motion.p
        className="mt-2 text-2xl font-bold tracking-tight"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: delay + 0.2 }}
      >
        {value}
        {trend && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.4, type: 'spring', stiffness: 300 }}
            className={cn("ml-2 inline-block text-sm font-medium", trend === 'up' ? 'text-chart-positive' : trend === 'down' ? 'text-chart-negative' : 'text-muted-foreground')}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </motion.span>
        )}
      </motion.p>
      {subtitle && (
        <motion.p
          className="mt-1 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
