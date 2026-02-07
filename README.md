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

## 🚀 Deployment Info (Sui Testnet)
The protocol is live on the Sui Testnet. (Latest Tracking Version: Feb 2026)

- **Package ID:** `0xdf6fb812b9da547b5fb6eca5ccd564c8a57ba813beb786d480158390c55aae6f`
- **Lending Pool (Shared):** `0x29a6e48a78fd96fff39773bf3d3e0b31941ac67ccc79cb41bb550e4f173b14ef`
- **Buck Treasury (Mock Faucet):** `0xc51c9614d5fdea10f6086b991eacf2874f9da79ed838f7560fa1c61cf9c6de65`

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
