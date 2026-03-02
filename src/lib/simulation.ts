// Monte Carlo Simulation Engine for Trajectory

export interface ProfileInput {
  age: number;
  education_level: string;
  major: string;
  baseline_gpa: number;
  income: number;
  health_score: number;
}

export interface HabitInput {
  study_hours: number;
  workout_freq: number;
  skill_hours: number;
  sleep_avg: number;
  spending: number;
  savings_rate: number;
}

export interface DomainProjection {
  median: number;
  low: number;
  high: number;
}

export interface RiskScores {
  burnout: number;
  financialInstability: number;
}

export interface SimulationResult {
  gpa: DomainProjection;
  income: DomainProjection;
  savings: DomainProjection;
  healthScore: DomainProjection;
  careerReadiness: DomainProjection;
  riskScores: RiskScores;
  timeHorizon: string;
  timeline: TimelinePoint[];
}

export interface TimelinePoint {
  month: number;
  gpaMedian: number;
  gpaLow: number;
  gpaHigh: number;
  incomeMedian: number;
  incomeLow: number;
  incomeHigh: number;
  savingsMedian: number;
  healthMedian: number;
}

const ITERATIONS = 1000;

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
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

function simulateGPA(base: number, studyHours: number, sleepAvg: number, months: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    let gpa = base;
    for (let m = 0; m < months; m++) {
      const studyEffect = (studyHours - 10) * 0.005;
      const sleepEffect = (sleepAvg - 7) * 0.008;
      const noise = gaussianRandom() * 0.02;
      gpa = clamp(gpa + studyEffect + sleepEffect + noise, 0, 4.0);
    }
    results.push(gpa);
  }
  return results.sort((a, b) => a - b);
}

function simulateIncome(base: number, skillHours: number, studyHours: number, education: string, months: number): number[] {
  const results: number[] = [];
  const eduMultiplier = education === 'graduate' ? 1.3 : education === 'undergraduate' ? 1.0 : 0.8;
  for (let i = 0; i < ITERATIONS; i++) {
    let income = base || 45000;
    for (let m = 0; m < months; m++) {
      const growthRate = 0.003 * eduMultiplier;
      const skillEffect = skillHours * 0.001;
      const studyEffect = studyHours * 0.0005;
      const noise = gaussianRandom() * 0.01;
      income *= (1 + growthRate + skillEffect + studyEffect + noise);
    }
    results.push(Math.round(income));
  }
  return results.sort((a, b) => a - b);
}

function simulateSavings(income: number, spending: number, savingsRate: number, months: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    let savings = 0;
    let currentIncome = income || 45000;
    for (let m = 0; m < months; m++) {
      const monthlySavings = (currentIncome / 12) * (savingsRate / 100) - spending;
      const noise = gaussianRandom() * (monthlySavings * 0.1);
      savings += monthlySavings + noise;
      currentIncome *= (1 + 0.002 + gaussianRandom() * 0.005);
    }
    results.push(Math.round(Math.max(savings, -50000)));
  }
  return results.sort((a, b) => a - b);
}

function simulateHealth(base: number, workoutFreq: number, sleepAvg: number, months: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    let health = base;
    for (let m = 0; m < months; m++) {
      const workoutEffect = (workoutFreq - 3) * 0.3;
      const sleepEffect = (sleepAvg - 7) * 0.4;
      const noise = gaussianRandom() * 0.5;
      health = clamp(health + workoutEffect + sleepEffect + noise, 0, 100);
    }
    results.push(Math.round(health * 10) / 10);
  }
  return results.sort((a, b) => a - b);
}

function computeCareerReadiness(gpa: number, skillHours: number, education: string): number[] {
  const results: number[] = [];
  const eduBase = education === 'graduate' ? 60 : education === 'undergraduate' ? 45 : 30;
  for (let i = 0; i < ITERATIONS; i++) {
    const score = eduBase + (gpa / 4) * 20 + skillHours * 1.5 + gaussianRandom() * 5;
    results.push(clamp(Math.round(score), 0, 100));
  }
  return results.sort((a, b) => a - b);
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.floor(sorted.length * p);
  return sorted[clamp(idx, 0, sorted.length - 1)];
}

function toProjection(sorted: number[], decimals = 2): DomainProjection {
  return {
    low: Number(percentile(sorted, 0.1).toFixed(decimals)),
    median: Number(percentile(sorted, 0.5).toFixed(decimals)),
    high: Number(percentile(sorted, 0.9).toFixed(decimals)),
  };
}

export function runSimulation(profile: ProfileInput, habits: HabitInput, timeHorizon: string): SimulationResult {
  const months = getMonths(timeHorizon);

  const gpaResults = simulateGPA(profile.baseline_gpa, habits.study_hours, habits.sleep_avg, months);
  const incomeResults = simulateIncome(profile.income, habits.skill_hours, habits.study_hours, profile.education_level, months);
  const savingsResults = simulateSavings(profile.income, habits.spending, habits.savings_rate, months);
  const healthResults = simulateHealth(profile.health_score, habits.workout_freq, habits.sleep_avg, months);
  const careerResults = computeCareerReadiness(profile.baseline_gpa, habits.skill_hours, profile.education_level);

  // Burnout risk
  const totalWeeklyHours = habits.study_hours + habits.skill_hours;
  const sleepDeficit = Math.max(0, 7 - habits.sleep_avg);
  const burnoutRisk = clamp((totalWeeklyHours / 40) * 0.4 + sleepDeficit * 0.15 + (habits.workout_freq < 2 ? 0.15 : 0), 0, 1);
  const burnout = Number(burnoutRisk.toFixed(2));

  // Financial instability risk
  const finRisk = clamp(
    (habits.spending / Math.max((profile.income || 45000) / 12, 1)) * 0.5 +
    (1 - habits.savings_rate / 30) * 0.3 +
    gaussianRandom() * 0.05,
    0, 1
  );
  const financialInstability = Number(clamp(finRisk, 0, 1).toFixed(2));

  // Generate timeline
  const timeline: TimelinePoint[] = [];
  for (let m = 0; m <= months; m += Math.max(1, Math.floor(months / 12))) {
    const mGpa = simulateGPA(profile.baseline_gpa, habits.study_hours, habits.sleep_avg, m);
    const mIncome = simulateIncome(profile.income, habits.skill_hours, habits.study_hours, profile.education_level, m);
    const mSavings = simulateSavings(profile.income, habits.spending, habits.savings_rate, m);
    const mHealth = simulateHealth(profile.health_score, habits.workout_freq, habits.sleep_avg, m);

    timeline.push({
      month: m,
      gpaMedian: Number(percentile(mGpa, 0.5).toFixed(2)),
      gpaLow: Number(percentile(mGpa, 0.1).toFixed(2)),
      gpaHigh: Number(percentile(mGpa, 0.9).toFixed(2)),
      incomeMedian: Math.round(percentile(mIncome, 0.5)),
      incomeLow: Math.round(percentile(mIncome, 0.1)),
      incomeHigh: Math.round(percentile(mIncome, 0.9)),
      savingsMedian: Math.round(percentile(mSavings, 0.5)),
      healthMedian: Number(percentile(mHealth, 0.5).toFixed(1)),
    });
  }

  return {
    gpa: toProjection(gpaResults),
    income: toProjection(incomeResults, 0),
    savings: toProjection(savingsResults, 0),
    healthScore: toProjection(healthResults, 1),
    careerReadiness: toProjection(careerResults, 0),
    riskScores: { burnout, financialInstability },
    timeHorizon,
    timeline,
  };
}
