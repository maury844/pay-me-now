# Money Moves Mortgage Simulator

Interactive mortgage extra-payment simulator built with React, TypeScript, and Vite.  
Use it to compare baseline vs accelerated payoff scenarios and understand how extra monthly payments affect total interest.

## Features

- Side-by-side mortgage simulation: baseline payment vs extra-payment strategy.
- Fixed-rate and mixed-rate support (fixed period + variable base APR + TRE).
- Adjustable term in years or months.
- Payoff optimization: calculates required monthly extra to hit a target payoff month.
- Amortization table and comparison charts for balance and cumulative interest.
- USD and BOB support with a fetched BOB blue buy reference rate and manual override.

## Stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS
- Recharts
- Vitest

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Type-check and produce production build in `dist/`.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint.
- `npm run test`: Run unit tests (Vitest).

## Calculation Notes

- Uses standard amortization payment formula per stage.
- Recalculates scheduled payment when moving from fixed stage to variable stage.
- Applies extra payment directly to principal after scheduled payment.
- Rounds monetary outputs to cents for display and table consistency.

## SEO and Metadata

This project includes production-oriented discoverability assets:

- HTML metadata for description, robots, Open Graph, and Twitter cards.
- Structured data (`WebApplication`) in `index.html`.
- Branded favicon, icon, and social preview assets in `public/`.
- `site.webmanifest` and `robots.txt` under `public/`.

If you deploy under a custom domain, update URLs/meta fields as needed for your host.

## Data Source

For BOB exchange defaults, the app attempts to fetch a blue buy rate from:

- `https://api.dolarbluebolivia.click/fetch/generate`

If unavailable, it falls back to a local default rate.

## Disclaimer

This simulator is educational and planning-oriented. It is not financial advice.  
Always verify final loan terms and payment impacts with your lender.
