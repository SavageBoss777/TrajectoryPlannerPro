// Sensitivity Sweep Engine
// Runs single-variable perturbations to identify drivers of burnout risk and GPA instability

import type { ProfileInput, HabitInput } from './simulation';

// ── Types ──────────────────────────────────────────────────────────────

export interface SensitivityDriver {
  habit: string;
  prettyName: string;
  step: number;
  baseValue: number;
  burnoutEffectPerUnit: number;
  gpaStdEffectPerUnit: number;
  burnoutImpactAtStep: number;
  gpaStdImpactAtStep: number;
}

export interface InsightsResult {
  baseline: { burnoutRisk: number; gpaStd: number; gpaMedian: number };
  burnoutDrivers: SensitivityDriver[];
  gpaInstabilityDrivers: SensitivityDriver[];
  burnoutStatements: string[];
  gpaStatements: string[];
}

// ── Config ─────────────────────────────────────────────────────────────

const HABIT_CONFIG: Record<string, { step: number; min: number; max: number; pretty: string; key: keyof HabitInput }> = {
  sleep_avg:    { step: 1,    min: 4,  max: 10, pretty: 'Sleep (hrs/night)',       key: 'sleep_avg' },
  study_hours:  { step: 3,    min: 0,  max: 80, pretty: 'Study (hrs/week)',        key: 'study_hours' },
  workout_freq: { step: 1,    min: 0,  max: 7,  pretty: 'Workout (days/week)',     key: 'workout_freq' },
  skill_hours:  { step: 2,    min: 0,  max: 40, pretty: 'Skill-building (hrs/week)', key: 'skill_hours' },
  savings_rate: { step: 5,    min: 0,  max: 80, pretty: 'Savings rate (%)',        key: 'savings_rate' },
  spending:     { step: 200,  min: 0,  max: 10000, pretty: 'Monthly spending ($)', key: 'spending' },
};

// ── Quick simulation helpers ───────────────────────────────────────────

const QUICK_ITERATIONS = 200;
const SEED_BASE = 42;

// Seeded pseudo-random for deterministic results
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gaussianFromRng(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getMonths(horizon: string): number {
  switch (horizon) {
    case '6months': return 6;
    case '1year': return 12;
    case '2years': return 24;
    case '5years': return 60;
    default: return 12;
  }
}

interface QuickSimResult {
  gpaSamples: number[];
  burnoutSamples: number[];
}

function quickSimulate(profile: ProfileInput, habits: HabitInput, horizon: string, seed: number): QuickSimResult {
  const months = getMonths(horizon);
  const rng = seededRandom(seed);
  const gpaSamples: number[] = [];
  const burnoutSamples: number[] = [];

  for (let i = 0; i < QUICK_ITERATIONS; i++) {
    // GPA simulation
    let gpa = profile.baseline_gpa;
    for (let m = 0; m < months; m++) {
      const studyEffect = (habits.study_hours - 10) * 0.005;
      const sleepEffect = (habits.sleep_avg - 7) * 0.008;
      const noise = gaussianFromRng(rng) * 0.02;
      gpa = clamp(gpa + studyEffect + sleepEffect + noise, 0, 4.0);
    }
    gpaSamples.push(gpa);

    // Burnout per-iteration: probabilistic based on habits
    const totalWeeklyHours = habits.study_hours + habits.skill_hours;
    const sleepDeficit = Math.max(0, 7 - habits.sleep_avg);
    const baseBurnout = clamp(
      (totalWeeklyHours / 40) * 0.4 + sleepDeficit * 0.15 + (habits.workout_freq < 2 ? 0.15 : 0),
      0, 1
    );
    const noisyBurnout = clamp(baseBurnout + gaussianFromRng(rng) * 0.08, 0, 1);
    burnoutSamples.push(noisyBurnout);
  }

  return { gpaSamples, burnoutSamples };
}

function extractMetrics(sim: QuickSimResult) {
  const burnoutRisk = sim.burnoutSamples.reduce((a, b) => a + b, 0) / sim.burnoutSamples.length;
  const gpaMean = sim.gpaSamples.reduce((a, b) => a + b, 0) / sim.gpaSamples.length;
  const gpaVariance = sim.gpaSamples.reduce((a, b) => a + (b - gpaMean) ** 2, 0) / sim.gpaSamples.length;
  const gpaStd = Math.sqrt(gpaVariance);
  return { burnoutRisk, gpaStd, gpaMedian: gpaMean };
}

// ── Main: Sensitivity Sweep ────────────────────────────────────────────

export function runSensitivityAnalysis(
  profile: ProfileInput,
  habits: HabitInput,
  horizon: string
): InsightsResult {
  // Baseline
  const baseSim = quickSimulate(profile, habits, horizon, SEED_BASE);
  const base = extractMetrics(baseSim);

  const drivers: SensitivityDriver[] = [];

  Object.entries(HABIT_CONFIG).forEach(([, cfg]) => {
    const baseVal = habits[cfg.key] as number;

    // +step
    const plusHabits = { ...habits, [cfg.key]: clamp(baseVal + cfg.step, cfg.min, cfg.max) };
    const plusSim = quickSimulate(profile, plusHabits, horizon, SEED_BASE + 1);
    const plus = extractMetrics(plusSim);

    // -step
    const minusHabits = { ...habits, [cfg.key]: clamp(baseVal - cfg.step, cfg.min, cfg.max) };
    const minusSim = quickSimulate(profile, minusHabits, horizon, SEED_BASE + 2);
    const minus = extractMetrics(minusSim);

    const denom = (plusHabits[cfg.key] as number) - (minusHabits[cfg.key] as number);
    if (denom === 0) return;

    const dBurnout = (plus.burnoutRisk - minus.burnoutRisk) / denom;
    const dGpaStd = (plus.gpaStd - minus.gpaStd) / denom;

    drivers.push({
      habit: cfg.key,
      prettyName: cfg.pretty,
      step: cfg.step,
      baseValue: baseVal,
      burnoutEffectPerUnit: dBurnout,
      gpaStdEffectPerUnit: dGpaStd,
      burnoutImpactAtStep: dBurnout * cfg.step,
      gpaStdImpactAtStep: dGpaStd * cfg.step,
    });
  });

  const burnoutRanked = [...drivers].sort((a, b) => Math.abs(b.burnoutImpactAtStep) - Math.abs(a.burnoutImpactAtStep));
  const gpaRanked = [...drivers].sort((a, b) => Math.abs(b.gpaStdImpactAtStep) - Math.abs(a.gpaStdImpactAtStep));

  const burnoutTop = burnoutRanked.slice(0, 3);
  const gpaTop = gpaRanked.slice(0, 3);

  const burnoutStatements = burnoutTop.map((d) => {
    const delta = d.burnoutImpactAtStep;
    const sign = delta < 0 ? '−' : '+';
    const pp = Math.abs(delta * 100).toFixed(1);
    return `${d.prettyName} +${d.step} → ${sign}${pp}% burnout`;
  });

  const gpaStatements = gpaTop.map((d) => {
    const delta = d.gpaStdImpactAtStep;
    const sign = delta < 0 ? '−' : '+';
    return `${d.prettyName} +${d.step} → ${sign}${Math.abs(delta).toFixed(3)} GPA variance`;
  });

  return {
    baseline: base,
    burnoutDrivers: burnoutTop,
    gpaInstabilityDrivers: gpaTop,
    burnoutStatements,
    gpaStatements,
  };
}
