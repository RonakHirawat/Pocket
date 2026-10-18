# Pocket — Personal Expense Tracker

A small React + Vite + Tailwind CSS expense tracker. It uses localStorage only—no backend, login, or database.

## Run it locally

1. Install Node.js (LTS) if it is not already installed.
2. Unzip the project and open this folder in Terminal or IntelliJ.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local URL Vite prints (usually `http://localhost:5173`).

## Quick entry

Enter expenses in any of these formats and press Enter:

- `milk : 40`
- `coffee : 120`
- `uber : 180`

Every input creates a separate transaction. Existing category names are grouped automatically in category totals; new names appear as new categories.

## Included

- Monthly and daily spending totals
- Monthly daily-spend chart
- Category donut chart and totals
- Daily / monthly / all-time transaction history
- Search, edit, and delete transactions
- CSV export
- Browser localStorage persistence

## Important

Data stays in this browser on this device. Clearing browser site data can erase it, so use **Export** periodically to keep a CSV backup. This starter has no cloud sync.
