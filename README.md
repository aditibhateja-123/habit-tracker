# Ritu — Habit Tracker

A habit-first women's health tracker for periods, PCOD, PCOS, endometriosis, and menopause.

## Run locally

```bash
npm install
npm run dev
```

## Notes

- `src/RituApp.jsx` is the full app prototype (onboarding, cycle/habit dashboard, calendar logging, habits, insights, learn content).
- Data currently persists to `localStorage` via a small shim in `src/main.jsx`. Swap this for real auth + cloud sync when wiring up a backend.
- Not a medical device — habit tracking and pattern recognition only.
