# 🚨 BUCK Emergency Fund (Sharia-Compliant DeFi)
**Instant BUCK liquidity for CDP holders, powered by a decentralized Waqf & Ujrah system on Sui.**

---

## 📖 Overview
**BUCK Emergency Fund** is a decentralized, Sharia-compliant lending protocol on the Sui blockchain. It provides instant **BUCK** liquidity to users who lock **SUI** as collateral. 

Designed with ethical finance in mind, the protocol replaces traditional interest (Riba) with a sustainable model of **Service Fees (Ujrah)** and a **System-Owned Endowment (Waqf)**. This ensures the protocol grows more independent over time, eventually aiming to fund its own community-driven lending pool.

## 🌙 Sharia-Compliant Economic Model
The system operates on three ethical pillars:

1.  **Ujrah (Service Fee):** Instead of accruing interest, borrowers pay a one-time fixed service fee (e.g., 10%) for the use of the platform and infrastructure.
2.  **Waqf (Permanent Endowment):** 40% of all collected fees are converted into protocol-owned liquidity and locked forever. This "Waqf" fund ensures the system becomes self-sustaining and less dependent on external lenders over time.
3.  **Musharakah (Halal LP Rewards):** Liquidity Providers (LPs) act as partners. 40% of fees directly appreciate the value of their shares, representing trade profit rather than usury.

## 🛡️ Risk Management (Safety Floor)
To protect both lenders and the protocol, the system uses a **conservative safety floor**:
- **SUI Valuation:** Collateral is valued at a predicted low of **$0.70 BUCK** (even if the current price is higher).
- **Over-Collateralization:** A minimum **150%** collateral ratio is enforced based on this safe floor.
- **Independence:** The risk engine self-regulates to prevent mass liquidations and ensure the Waqf remains solvent.

## 🚀 Deployment Info (Sui Testnet)
The protocol is live on the Sui Testnet. You can interact with the contracts using the following IDs:

- **Package ID:** `0xccb8cf3645157e4572ee8e2e5451a0431ca767ff3f18a539d11ffcc0f681b8f3`
- **Lending Pool (Shared):** `0x05d96f87f9996cbe3f04be0443035961666ec7608b7997c563b6452bb68d0066`
- **Buck Treasury (Mock Faucet):** `0xd68c1075a820e3162a337910568507b43e58a4d717d36198faceb69a565a6e6b`

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
   cd frontend
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
   - Borrow `BUCK` (Fee is added upfront).
   - Repay in installments or full to reclaim `SUI`.

---

## 📄 Documentation
- [Detailed Sharia Explainer](./docs/SISTEM_SYARIAH_KEBAHAGIAAN.txt)
- [Move 2024 Migration](./AI_DISCLOSURE.md)

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.