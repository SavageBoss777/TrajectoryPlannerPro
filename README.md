# 🚀 Trajectory

> Habits → Probabilistic Outcomes → Risk Analysis → AI Interpretation

Trajectory is an AI-powered life simulation and interpretation platform that connects **daily habits** to **long-term academic, financial, health, and career outcomes**.

It answers one core question:

> **“If I continue living like this, where do I end up — and what should I change?”**

---

# 🧠 Why Trajectory?

Students and ambitious professionals often:

- Overestimate GPA stability  
- Underestimate burnout risk  
- Lack feedback loops between habits and long-term outcomes  
- Don’t know which variable actually matters most  

Most apps:
- ✅ Track habits  
- ✅ Show dashboards  
- ❌ Run probabilistic projections  
- ❌ Identify outcome drivers quantitatively  
- ❌ Provide grounded AI interpretation  

**Trajectory replaces guesswork with simulation-backed clarity.**

---

# 🎯 Target Users

### Primary
- College students  
- Ambitious self-improvement users  
- Early-career professionals  

### Secondary
- Career switchers  
- Pre-med / pre-law students  
- High-pressure academic tracks  

---

# 🏗 System Architecture

## Frontend
- Vite  
- React  
- TypeScript  
- Tailwind CSS  
- Framer Motion  
- Supabase  

## Backend
- Node.js  
- Express  
- TypeScript  
- OpenAI Responses API  
- dotenv (environment management)  

---

# 🔁 Data Flow

```
User Input
   ↓
Monte Carlo Simulation Engine
   ↓
Risk Scoring
   ↓
Sensitivity Analysis Engine
   ↓
AI Interpretation Layer
   ↓
User Explanation
```

---

# 🧮 Monte Carlo Simulation Engine

## Objective
Generate probabilistic projections of life outcomes.

## Method
- 1,000 stochastic simulation runs
- Random perturbations across modeled distributions
- Median / Low / High outcome ranges computed

## Outputs
- GPA distribution
- Income distribution
- Savings projection
- Health score projection
- Career readiness %
- Burnout probability
- Financial instability probability

---

# ⚠️ Risk Scoring System

Derived from:
- Distribution volatility
- Habit weightings
- Modeled stress load

## Outputs
- Burnout Risk %
- Financial Instability Risk %

---

# 🔍 Sensitivity Analysis Engine (“Risk Explainer”)

Trajectory doesn’t just simulate — it explains.

## Method
- Perturb one habit variable at a time
- Re-run seeded 200-run Monte Carlo simulations
- Use central-difference approximation
- Measure delta in burnout + GPA instability

## Outputs
- Top 3 burnout drivers
- Top 3 GPA instability drivers
- Sensitivity percentage impact
- Ranked driver explanations

This converts raw probability into interpretability.

---

# 🤖 AI Interpretation Layer

## Architecture
```
Frontend → Proxy → Express Backend → OpenAI API
```

## Security
- API keys never exposed to frontend
- Structured JSON context passed to AI
- Grounded responses (simulation + sensitivity data)

## Example Queries
- “Why is my burnout risk high?”
- “What’s my biggest leverage point?”
- “Explain my results simply.”
- “What habit should I change first?”

The AI is contextual — not generic.

---

# 🧾 Functional Requirements

- User must complete profile + habit input before simulation.
- Simulation returns statistical distributions.
- Sensitivity analysis runs post-simulation.
- AI receives structured simulation JSON.
- API keys never exposed client-side.
- UI remains responsive during simulation (non-blocking).

---

# 🔐 Non-Functional Requirements

- Secure environment variable handling
- Clean branch management
- Clear separation of concerns
- Responsive UI
- Minimal hallucination risk via contextual grounding

---

# 🚀 MVP Features

- Profile Input  
- Habit Input  
- Monte Carlo Simulation  
- Risk Scoring  
- Sensitivity Ranking  
- Context-aware AI Assistant  
- Secure backend integration  

---

# 📊 Success Metrics

- Users understand top drivers of risk
- Users identify at least one actionable habit change
- AI explanations align with simulation outputs
- Simulation runtime < 2 seconds
- Zero frontend key exposure

---

# 🛣 Future Roadmap

- Scenario comparison modeling  
- Side-by-side multi-simulation comparisons  
- PDF report generation  
- Habit optimization engine  
- Longitudinal tracking  
- Reinforcement-based recommendation engine  

---


# 🧠 Design Philosophy

Trajectory is not a habit tracker.

It is a **probabilistic life modeling engine** with interpretability built in.

It treats:
- Burnout as stochastic
- GPA as unstable
- Income as distributional
- Risk as quantifiable
- Habits as controllable variables

---

# 📌 Final Thought

Most people live reactively.

Trajectory lets you live **with foresight.**

> Run the simulation.  
> See your trajectory.  
> Change it before it happens.
