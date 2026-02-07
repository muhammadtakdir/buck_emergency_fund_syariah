import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// CORRECT DEPLOYMENT IDS (Matched with Last Successful Publish)
export const PACKAGE_ID = '0xd73c1e7d96e8a887f45f1765e2c1a65ae7fcba594b707084b2a60d7d281f2282';
export const LENDING_POOL_ID = '0xe1f0ff0e05c9846bb82f2e4034f6dbb69520316938ce7972e77da94d1aeab333';
export const BUCK_TREASURY_ID = '0x9be89704a521764e9d30f21b1fa8382fbd6a5fe8dee62c879378a7f8b50a0bfc';
export const MAINTENANCE_CAP_ID = '0xc0ef29f3461fb9acd26e0ce6413408d9e015935bc0c399b89660458403b32e98';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::bucket_mock::BUCKET_MOCK`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::emergency_fund::EMERGENCY_FUND`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';