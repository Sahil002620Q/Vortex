# ElectroRecover Marketplace

A premium marketplace for buying, selling, and auctioning electronics.

## Quick Start

1. **Install Dependencies**: Run `dobido/setup.bat` (Run as Administrator if needed).
   - This sets up Python (FastAPI) and Node.js (React) dependencies.
2. **Launch App**: Run `dobido/run_app.bat`.
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173

## Features

- **Direct Purchase**: Buy items instantly at fixed prices.
- **Auctions**: Real-time bidding with live updates (WebSockets).
- **User Roles**: Buyer, Seller (requires approval), Admin.
- **Dashboard**: Track your bids, orders, and listings.

## Tech Stack

- **Backend**: Python (FastAPI), SQLite, WebSockets.
- **Frontend**: React (Vite), TailwindCSS, Axios.
