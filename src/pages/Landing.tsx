import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeroChart from '@/components/HeroChart';
import { ArrowRight, Zap, BarChart3, Shield, GitCompare } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition, { StaggerContainer, staggerItem } from '@/components/PageTransition';

const features = [
  { icon: Zap, title: 'Monte Carlo Engine', desc: '1,000+ simulation iterations to model your probabilistic future across income, GPA, health, and savings.' },
  { icon: BarChart3, title: 'Multi-Domain Projections', desc: 'Track trajectories across 7 life domains with confidence bands and risk scores.' },
  { icon: GitCompare, title: 'Path Comparison', desc: 'Clone your profile, tweak habits, and see exactly how different choices change outcomes.' },
  { icon: Shield, title: 'Risk Intelligence', desc: 'Burnout probability and financial instability scores based on your actual behavior patterns.' },
];

export default function Landing() {
  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container relative mx-auto px-4 pb-20 pt-24 md:pt-32">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Zap className="h-3 w-3" /> Probabilistic Life Simulation
              </motion.div>
              <motion.h1
                className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                See where your habits{' '}
                <span className="text-gradient">actually lead</span>
              </motion.h1>
              <motion.p
                className="mb-10 text-lg leading-relaxed text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Trajectory connects your daily routines to long-term probabilistic outcomes.
                Run Monte Carlo simulations across your career, finances, health, and academics.
              </motion.p>
              <motion.div
                className="flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <Link to="/auth?mode=register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Button size="lg" className="bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90">
                      Start Simulating <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline">Sign In</Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Demo chart */}
            <motion.div
              className="mx-auto mt-16 max-w-2xl rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Demo — Income Projection</p>
              <HeroChart />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card/30 py-24">
          <div className="container mx-auto px-4">
            <motion.h2
              className="mb-4 text-center text-2xl font-bold"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              Engineered for depth
            </motion.h2>
            <motion.p
              className="mb-16 text-center text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Not another goal tracker. A real simulation platform.
            </motion.p>
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={staggerItem}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:border-primary/30 hover:glow-sm"
                >
                  <motion.div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <f.icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto flex items-center justify-between px-4 text-xs text-muted-foreground">
            <span>© 2026 Trajectory</span>
            <span>Probabilistic Outcome Simulation</span>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
