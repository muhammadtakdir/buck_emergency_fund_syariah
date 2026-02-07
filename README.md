# 🚨 BUCK Emergency Fund (Sharia-Compliant DeFi)
**Instant BUCK liquidity for Bottle holders, powered by a decentralized Waqf & Ujrah system on Sui.**

---

## 📖 Overview
**BUCK Emergency Fund** is a decentralized, Sharia-compliant lending protocol on the Sui blockchain. It provides instant **BUCK** (also known as USDB) liquidity to users who lock **SUI** as collateral. 

Designed with ethical finance in mind, the protocol replaces traditional interest (Riba) with a sustainable model of **Service Fees (Ujrah)** and a **System-Owned Endowment (Waqf)**. The system provides real-time transparency with live tracking of **Total SUI Locked (TVL)** and system-wide liquidity.

## 🌙 Sharia-Compliant Economic Model
The system operates on three ethical pillars:

1.  **Ujrah (Service Fee):** Instead of accruing interest, borrowers pay a one-time fixed service fee (e.g., 10%) for the use of the platform and infrastructure.
2.  **Waqf (Permanent Endowment):** 40% of all collected fees are converted into protocol-owned liquidity and locked forever. This "Waqf" fund ensures the system becomes self-sustaining and less dependent on external lenders over time.
3.  **Musharakah (Halal LP Rewards):** Liquidity Providers (LPs) act as partners. 40% of fees directly appreciate the value of their shares, representing trade profit rather than usury.

## 🛡️ Risk Management (Safety Floor)
To protect both lenders and the protocol, the system uses a **conservative safety floor**:
- **SUI Valuation:** Collateral is valued at a predicted low of **$0.70 BUCK** (even if the current price is higher).
- **Over-Collateralization:** A minimum **150%** collateral ratio is enforced based on this safe floor.
- **Bucket Integration:** Direct integration with Bucket Protocol **Bottles** (CDPs) ensures verified collateral health.
- **Independence:** The risk engine self-regulates to prevent mass liquidations and ensure the Waqf remains solvent.

## ⚙️ How It Works
1.  **Lock Collateral:** You deposit SUI into your private `UserVault`.
2.  **Conservative Valuation:** The system values your SUI at a **$0.70 price floor** (safety buffer) to determine your borrow limit.
3.  **Borrow BUCK:** You receive BUCK tokens instantly. A fixed **Ujrah (Service Fee)** is added to your total obligation upfront.
4.  **Flexible Repayment:** You have up to **24 months** to repay the fixed total. You can pay in small installments or all at once.
5.  **Claim Assets:** Once your obligation is zero, you claim your SUI collateral back.
6.  **Out of Cash?** If you cannot find BUCK to repay, you can settle your debt using a portion of your locked SUI collateral at the current market price.

### 📝 Real-World Example
*   **Current SUI Price:** $1.50
*   **Your Deposit:** 100 SUI ($150 market value)
*   **BEFS Valuation:** $0.70/SUI → $70 "Safe Value"
*   **Max Borrow (150% Ratio):** $70 / 1.5 = **~46.6 BUCK**
*   **You Borrow:** 40 BUCK
*   **Fixed Ujrah (10%):** +4 BUCK
*   **Total To Repay:** **44 BUCK**
*   **Outcome:** You receive 40 BUCK now. You pay back 44 BUCK over 2 years. You get your 100 SUI back. Even if SUI drops to $0.80, your Collateral (Rahn) remains safe!

## 🚀 Deployment Info (Sui Testnet)
The protocol is live on the Sui Testnet. (Yield-Integrated Version: Feb 2026)

- **Package ID:** `0x76c2f97fc661f508eb2bbaa6a3d87a2f7a7056f3fc7ae38b18251a36fb3e9b14`
- **Lending Pool (Shared):** `0x71c16bbb80ef782a55edba48bd569982daee79d636cb19fd072c9a719f97fbd3`
- **Buck Treasury (Mock Faucet):** `0x0cc970c1dd8a434209566642b38dcf3e7a7490949354d4a1aebeeb83af7d4a2c`

---

## 🛠️ Tech Stack
- **Smart Contracts:** Sui Move 2024 (Strict & Warning-free)
- **Frontend:** Next.js 15+, TypeScript, Tailwind CSS
- **Sui SDK:** `@mysten/sui`, `@mysten/dapp-kit`

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/buck-emergency-fund
   cd buck-emergency-fund
   ```

2. **Setup Frontend:**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

3. **Smart Contract Development:**
   ```bash
   cd contracts
   sui move build
   ```

### Interaction Flow
1. **Lenders:** Provide BUCK to the `LendingPool` to receive LP tokens and earn Musharakah rewards.
2. **Borrowers:** 
   - Create a `UserVault`.
   - Deposit `SUI` as collateral.
   - Borrow `BUCK` (Ujrah is added upfront).
   - Repay in installments or full to reclaim `SUI`.

---

## 📄 Documentation
- [Detailed Sharia Explainer](./docs/SISTEM_SYARIAH_KEBAHAGIAAN.txt)
- [Move 2024 Migration](./AI_DISCLOSURE.md)

## 📜 License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
