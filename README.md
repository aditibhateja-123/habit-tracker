# Ritu — Habit Tracker

A habit-first women's health tracker for periods, PCOD, PCOS, endometriosis, and menopause.

## Run locally

```bash
npm install
npm run dev
```

## Notes

- `src/App.jsx` is the full app prototype: cycle/habit dashboard, calendar, symptom logging with self-care suggestions, habits, insights, and a rule-based "Ritu Assistant" chat widget for general guidance.
- Data currently persists to `localStorage` via a small shim in `src/main.jsx`. Swap this for real auth + cloud sync when wiring up a backend.
- The chat assistant answers from a curated knowledge base, not a live LLM — it flags urgent-sounding symptoms and defers medication/diagnosis questions to a real doctor. Wiring up a real LLM later means adding a backend proxy so the API key never ships to the client.
- Not a medical device — habit tracking, pattern recognition, and general wellness guidance only.
