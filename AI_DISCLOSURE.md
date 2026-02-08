# AI Tool Disclosure & Project Blueprint

This project was developed with assistance from AI tools in compliance with hackathon requirements.

## Tools Used

### 1. Gemini CLI (Google)
- **Role**: Technical Lead & Full-stack Architect.
- **Contributions**:
  - **Move Smart Contracts**: Implemented the core logic for the Sharia-compliant lending pool, including `LendingPool`, `UserVault`, and the `CreditScore` modules using Move 2024 edition.
  - **Economic Security**: Designed the "Al-Baqiyah" (Fair Settlement) logic where only the necessary collateral is taken during settlement, returning the remainder to the borrower.
  - **Frontend Development**: Built the dashboard using Next.js 16 and Tailwind CSS, integrating real-time SUI/USD price feeds and implementing automatic data synchronization (Auto-Refresh) without manual page reloads.
  - **Security Auditing**: Identified and fixed critical vulnerabilities related to price manipulation and unauthorized vault access.

## Core Product Logic (Current Implementation)
- **Sharia Model**: Replaces interest with a fixed 10% Service Fee (**Ujrah**).
- **Sustainability**: 40% of fees are automatically reinvested into a protocol-owned **Waqf** fund.
- **Oracle Integration**: Real-time SUI price fetching for dynamic borrow limits.
- **Flexibility**: Supports partial USDB repayments and full settlement using locked SUI collateral.

## Human Contributions
- Product vision and Sharia framework conceptualization.
- UX design decisions and visual theme selection (Normal Dark Mode).
- Strategic oversight of the Waqf and Liquidity layering.
- Final testing on Sui Testnet.

## Verification
All code was generated iteratively, reviewed for security best practices, and successfully built/deployed on the Sui Testnet environment.