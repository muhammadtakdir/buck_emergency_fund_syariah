# 🚨 BUCK Emergency Fund Sharia (BEFS)
**Ethical BUCK liquidity powered by a decentralized Waqf & Ujrah system on Sui.**

---

## 📖 Overview
**BUCK Emergency Fund Sharia (BEFS)** is a decentralized, ethical lending protocol on the Sui blockchain. It provides instant **USDB** (stablecoin) liquidity to users who lock **SUI** as collateral (**Rahn**).

Unlike traditional protocols, BEFS is built on **Islamic Finance principles**, replacing interest (Riba) with a fixed **Service Fee (Ujrah)** and a permanent **System-Owned Endowment (Waqf)**. 

### 💎 The Yield Layer
BEFS doesn't just hold assets; it optimizes them:
1.  **Halal Yield:** Idle USDB in the pool is automatically staked in the **Bucket Protocol Saving Pool**, earning SUI rewards for partners.
2.  **Sustainability:** 40% of all service fees are converted into LP shares and locked in the **Waqf Reserve**, ensuring the protocol grows stronger and more liquid over time without depending solely on new deposits.

---

## 🌙 Sharia-Compliant Features

### 1. Fixed Ujrah (Service Fee)
Borrowers agree to a fixed 10% service fee upfront. There is no accumulating interest. Whether you repay in 1 month or 24 months, your cost remains the same.

### 2. Fair Settlement (Al-Baqiyah)
If a borrower cannot repay with cash, they can settle using their locked SUI. The contract **only takes the amount of SUI necessary** to cover the debt at current market prices. The remaining SUI (**Baqiyah**) is kept safe in the vault for the borrower to claim.

### 3. System Waqf
40% of fees are dedicated to the Waqf fund. This fund acts as a permanent liquidity layer owned by the protocol itself, creating a self-sustaining financial ecosystem for the community.

---

## 🚀 Deployment Info (Sui Testnet)
Latest Build: Feb 2026

- **Package ID:** `0x08985c3215a91d765c2b850c2c3662d7af1ee7d8b7987d5ae8c31d04225e7794`
- **Lending Pool (Shared):** `0x4becc4f9ecd8493de4ca6ad58b0e9819e14cbb00e9d97355a21c45c78ef13411`
- **Saving Pool (Mock):** `0xb0f92ca8dde706eb6d3fccc40bea2c3fd61322189804bcc61863bc78f3ffcea4`
- **Buck Treasury (Faucet):** `0x6c81384a4a649de6708144eca87362cd911e365ffe0312d1ca68683fd8d6a8b8`

---

## 🎮 How to Demo

### Step 1: Get Test Assets
1.  Go to the **Lender Tab**.
2.  Click **"Request Faucet"** to receive 1 USDB for testing.

### Step 2: Provide Liquidity (Lender)
1.  Enter an amount (e.g., `0.5 USDB`).
2.  Click **"Confirm Supply"**.
3.  You will receive **lpUSDB** shares. Notice that the **System Status** becomes active.

### Step 3: Request Liquidity (Borrower)
1.  Switch to the **Borrower Tab**.
2.  Enter SUI amount (e.g., `0.1 SUI`).
3.  The system will **auto-calculate** the maximum USDB you can borrow based on the real-time SUI/USD price.
4.  Click **"Confirm & Borrow"**. USDB is sent to your wallet.

### Step 4: Manage Positions & Repay
1.  Look at **"My Active Positions"** on the right sidebar.
2.  **Partial Repayment:** Type a small amount of USDB in the box and click **"Pay USDB"**.
3.  **SUI Settlement:** Check the box *"Settle full debt using SUI collateral"* and click **"Repay SUI"**.
4.  **Claim Sisa:** Once the status is **"Paid Off"**, click **"Claim Collateral"** to get your remaining SUI back.

### Step 5: Watch the Waqf Grow
1.  After any repayment, look at the **"System Waqf Reserve"** in the Global Stats.
2.  You will see it increase, showing how every user helps build the community endowment.

---

## 💻 Getting Started

### Prerequisites
- **Node.js** (v22 or higher)
- **npm** or **yarn**
- **Sui Wallet** (installed in your browser)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/buck-emergency-fund.git
   cd buck-emergency-fund
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

### Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack
- **Smart Contracts:** Sui Move
- **Frontend Framework:** Next.js (v16.1.6)
- **UI Library:** React (v19.2.3)
- **Styling:** Tailwind CSS (v4.0)
- **Sui SDK:** @mysten/sui (v2.3.1)
- **Sui Wallet Integration:** @mysten/dapp-kit (v1.0.1)
- **Data Fetching:** @tanstack/react-query (v5.90)
- **Price Feed:** CoinGecko Simple Price API

## 📜 License
This project is licensed under the Apache License 2.0.