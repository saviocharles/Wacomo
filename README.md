# WhatsApp Commodity Sourcing & Assignment System

A mobile-first web application to capture, parse, and assign commodity requirements from WhatsApp messages.

## Features
- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: SQLite (via Prisma)
- **WhatsApp Simulation**: Built-in tool to test message parsing without live API credentials.

## Prerequisites
- Node.js (v18 or higher)
- npm

## How to Run

### 1. Start the Backend Server
This handles the database, authentication, and parsing logic.
```bash
node server/index.js
```
The server runs on `http://localhost:3000`.

### 2. Start the Frontend Application
Open a **new terminal** window and run:
```bash
npm run dev
```
The frontend runs on `http://localhost:5173`.

## Usage
1. Open your browser to [http://localhost:5173](http://localhost:5173).
2. **Register** a new account (e.g., Name: Admin, Role: ADMIN).
3. Use the **WhatsApp Simulator** on the Dashboard to send test messages:
   - Example: `Need 50 tons Wheat in Mumbai at 2500`
4. The system will parse and display the commodity in the list below.

## Project Structure
- `src/`: React Frontend code
- `server/`: Express Backend code
- `prisma/`: Database Schema
