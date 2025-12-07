# Portfolio Dashboard

A modern, real-time investment portfolio tracking dashboard built with Next.js. Monitor your stock holdings, bonds, and cash allocations with live price updates and interactive visualizations.

## 🎯 Features

- **Real-Time Price Updates**: Fetch current stock prices from Alpha Vantage API
- **Portfolio Allocation Chart**: Visual pie chart showing asset distribution by category
- **Holdings Table**: Detailed breakdown of all holdings with current prices and values
- **Category Breakdown**: View portfolio value by category (Stocks, Bonds, Cash)
- **Total Portfolio Value**: Displays current total portfolio worth
- **Config-Based**: Simple JSON configuration file to manage your portfolio
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type-Safe**: Built with TypeScript for better developer experience

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Alpha Vantage API key (free tier available at [alpha-vantage.co](https://www.alphavantage.co/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tiant167/portfolio-dashboard.git
   cd portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

4. **Configure your portfolio**
   
   Edit `portfolio.json` to add your holdings:
   ```json
   {
     "holdings": [
       {
         "symbol": "GOOGL",
         "shares": 5,
         "category": "Stocks"
       }
     ],
     "cash": 10000,
     "categories": {
       "Stocks": "#FF6384",
       "Bonds": "#36A2EB",
       "Cash": "#FFCE56"
     }
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
portfolio-dashboard/
├── app/
│   ├── components/
│   │   ├── HoldingsTable.tsx      # Detailed holdings table
│   │   ├── PortfolioPieChart.tsx  # Asset allocation chart
│   │   ├── TotalValue.tsx         # Total portfolio value display
│   │   └── TrendGraph.tsx         # Historical trend visualization
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Main dashboard page
├── pages/
│   └── api/
│       └── portfolio.ts           # API endpoint for portfolio data
├── portfolio.json                 # Portfolio configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## ⚙️ Configuration

### Portfolio Configuration (`portfolio.json`)

The `portfolio.json` file stores your current investment holdings:

```json
{
  "holdings": [
    {
      "symbol": "GOOGL",      // Stock ticker symbol
      "shares": 5,            // Number of shares owned
      "category": "Stocks"    // Asset category
    }
  ],
  "cash": 8000,               // Cash balance
  "categories": {
    "Stocks": "#FF6384",      // Category name and chart color
    "Bonds": "#36A2EB",
    "Cash": "#FFCE56"
  }
}
```

## 🔌 API

### GET `/api/portfolio`

Returns current portfolio data with real-time prices.

**Response:**
```json
{
  "totalCurrentValue": 50000,
  "categorizedValues": {
    "Stocks": 35000,
    "Bonds": 10000,
    "Cash": 5000
  },
  "holdings": [
    {
      "symbol": "GOOGL",
      "shares": 5,
      "category": "Stocks",
      "currentPrice": 170.50,
      "value": 852.50
    }
  ],
  "categoriesConfig": { /* category colors */ }
}
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📦 Dependencies

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Alpha Vantage API** - Real-time stock prices

## 🔐 API Key Security

Never commit your `.env.local` file. Add it to `.gitignore`:

```
.env.local
```

For production deployments on Vercel, set environment variables in your project settings.

## 📊 Data Sources

Stock prices are fetched from the [Alpha Vantage API](https://www.alphavantage.co/). The free tier includes:
- Real-time stock quotes
- Limited request rate (5 per minute)

For production use with higher volume, consider upgrading to a paid plan.

## 🌐 Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set `ALPHA_VANTAGE_API_KEY` in Vercel's environment variables
4. Deploy

```bash
vercel
```

### Deploy on Other Platforms

This is a standard Next.js app and can be deployed to any platform supporting Node.js (AWS, Heroku, Railway, etc.).

## 📝 Usage Examples

### Adding a New Holding

1. Edit `portfolio.json`
2. Add a new entry to the `holdings` array:
   ```json
   {
     "symbol": "MSFT",
     "shares": 10,
     "category": "Stocks"
   }
   ```
3. Save and refresh your browser - prices update automatically

### Updating Cash Balance

Edit the `cash` field in `portfolio.json`:
```json
"cash": 15000
```

### Adding New Categories

1. Add to `holdings`: use the category name
2. Define color in `categories`:
   ```json
   "categories": {
     "Stocks": "#FF6384",
     "Bonds": "#36A2EB",
     "Cash": "#FFCE56",
     "Crypto": "#4BC0C0"
   }
   ```

## 🗂️ Vercel Edge Config (SDK-based, required)

This project now reads the `portfolio` JSON exclusively from Vercel Edge Config using the official SDK (`@vercel/edge-config`). The app no longer falls back to a local `portfolio.json` — deployments and environments must provide a `portfolio` key in Edge Config.

Why SDK: the SDK provides a simple, typed client and better integration with Vercel's runtime. The repository includes a small helper at `lib/edge-config.ts` that normalizes the SDK return value and exposes `getPortfolioFromEdge()`.

Quick setup:

1. In the Vercel dashboard go to **Edge Configs** → **Create** and add a key named `portfolio` whose value is your JSON (stringified). Example value:

```json
{
  "holdings": [
    { "symbol": "GOOGL", "shares": 5, "category": "Stocks" }
  ],
  "cash": 8000,
  "categories": { "Stocks": "#FF6384", "Bonds": "#36A2EB", "Cash": "#FFCE56" }
}
```

2. Install and configure the SDK (already added to `package.json`): `@vercel/edge-config`.
3. Create a read-only token in the Edge Config settings and add it to your Vercel project env as:

```
EDGE_CONFIG_URL=https://edge-config.vercel.com
EDGE_CONFIG_TOKEN=<your_read_only_token>
```

4. Deploy — the API endpoint `/api/portfolio` will read the `portfolio` key via the SDK helper. If the key is missing, the API responds with 500 and a clear message indicating the missing `portfolio` key so the issue can be fixed in Vercel.

Helper & code notes:

- Helper path: `lib/edge-config.ts` — it exports `getPortfolioFromEdge()` which returns the parsed JSON or `null` on failure.
- The API uses this helper (see `pages/api/portfolio.ts`).
- Do not expose the `EDGE_CONFIG_TOKEN` client-side; store it in Vercel environment variables only.

Notes and limitations:
- Edge Config is optimized for small-to-medium JSON values. If your holdings list grows large, consider using a small DB (e.g., Supabase, Fauna, Postgres) and cache reads with a CDN.
- Edge Config is not a secrets store — never put API keys or private credentials in Edge Config.
- The SDK and Edge Config are intended for read-heavy, low-latency scenarios with infrequent writes.

## 🐛 Troubleshooting

### "ALPHA_VANTAGE_API_KEY is not set"
Ensure your `.env.local` file exists with the correct API key.

### Stock prices showing $0
- Verify your API key is valid
- Check Alpha Vantage rate limits (5 requests/minute free tier)
- Wait a moment and refresh the page

### Holdings not updating
Clear your browser cache or restart the dev server with `npm run dev`.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📧 Support

For questions or issues, please open an issue on the [GitHub repository](https://github.com/tiant167/portfolio-dashboard/issues).

---

**Built with ❤️ using Next.js and React**
