# Quick Expense Tracker

A simple, lightweight personal expense tracker to record daily spending, organize expenses by category, and monitor monthly totals — all from your browser.

## Features

- **Quick Expense Entry** — Add expenses with a simple entry format, such as `Milk : 40`.
- **Transaction History** — View individual expenses with dates and amounts.
- **Monthly Summary** — Track total spending for the selected month.
- **Category Breakdown** — Automatically group expenses by category.
- **Search Transactions** — Find specific expenses quickly.
- **Edit & Delete** — Update or remove individual transactions.
- **Charts & Insights** — Visualize spending patterns.
- **CSV Export** — Export your transaction records.
- **Local Storage** — Save expenses directly in your browser without requiring a backend or database.
- **Responsive Dashboard** — Use the app on desktop or mobile browsers.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Browser localStorage

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/quick-expense-tracker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd quick-expense-tracker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in your terminal.

### Production Build

To create a production-ready build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Data Storage

Quick Expense Tracker uses browser `localStorage` to persist transactions.

- Expenses remain available after refreshing or restarting the website in the same browser.
- No backend, account, or database is required.
- Data is stored separately for each browser and device.
- Clearing browser site data may permanently remove saved expenses.
- CSV export is available to help maintain a backup.

**Important:** Expenses entered on your phone will not automatically sync with your computer. Cross-device synchronization would require a shared backend or cloud database.

## Deployment

The project can be deployed to GitHub Pages using GitHub Actions.

After configuring the Vite `base` path and enabling GitHub Actions deployment in your repository settings, the website can be accessed through your GitHub Pages URL.

## Future Improvements

- Optional cloud synchronization
- Password-protected user accounts
- Expense budgets and spending limits
- Recurring expenses
- Data backup and restore

## License

This project is available for personal use and learning. Add a license file if you want to specify formal reuse and distribution permissions.
