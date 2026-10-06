# DealerPulse

DealerPulse is a performance dashboard built for automotive dealership leadership—specifically group executives and branch managers—to track sales velocity, identify conversion bottlenecks, and recover stalled revenue across branches.

Live Demo: https://dealerpulse-gsshemanth.vercel.app

---

## What It Does

- Executive Vital Signs: Tracks high-level business health in real time, including delivered revenue, units sold, overall conversion rate, and average turnaround cycle from inquiry to delivery.
- Action Center: Automatically identifies and flags active leads that have had no touchpoints for more than 7 days, allowing managers to intervene before high-value deals are lost.
- AI Strategic Copilot: Generates dynamic narrative summaries and recommended leadership actions based on currently filtered branch data.
- Pipeline Conversion Summary: Details progression and drop-off percentages across each milestone in the customer journey (New, Contacted, Test Drive, Negotiation, Order Placed, Delivered).
- Product Mix & Channel Distribution: Visualizes vehicle model demand via a donut chart and evaluates marketing source efficiency through win-rate comparisons.
- Rep Leaderboards: Evaluates sales officers and branch managers by pipeline load, closed volume, and attributed revenue.
- Multi-dimensional Filtering: Allows instant slicing by branch, assigned sales representative, and calendar month.

---

## Tech Stack & Architecture

- Framework: Next.js (App Router) with React
- Language: TypeScript
- Styling: Tailwind CSS (designed around a two-color accent system: Electric Slate Blue for primary actions and Signal Amber for idle deal alerts)
- Charts: Recharts
- Icons: Lucide React
- Deployment: Vercel

### Data Processing Strategy

The dashboard operates on an in-memory JSON dataset of approximately 500 inquiries across 5 branches and 30 sales representatives. 

Rather than setting up an external database and round-trip REST API for a dataset of this size, all filtering, stage retention calculations, and metric aggregations are computed directly in the browser using React's `useMemo`. This eliminates network latency and cold starts, delivering sub-millisecond updates when changing filter dropdowns.

For an enterprise deployment handling tens of thousands of records, this layer would transition to an analytical SQL database (like PostgreSQL or ClickHouse) queried via Next.js Server Components and cached at the edge.

---

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   git clone https://github.com/GSSHEMANTH/dealerpulse.git
   cd dealerpulse

2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

4. Open http://localhost:3000 in your browser.

---

## Project Structure

- `app/` - Next.js App Router root layout and dashboard page
- `components/` - Dashboard modular components (Action Center, AI Copilot, Logo, Product Mix Donut, Marketing Channel Bar)
- `data/` - Static structured JSON dataset (`dealership_data.json`)
- `lib/` - TypeScript interface definitions (`types.ts`) and pure analytical aggregation functions (`analytics.ts`)
- `DECISIONS.md` - Technical choices, product tradeoffs, and dataset pattern observations
