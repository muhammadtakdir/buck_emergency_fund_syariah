import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// FINAL VERSION (Includes Yield Layering, 24-Month Term, and SUI Settlement)
export const PACKAGE_ID = '0x76c2f97fc661f508eb2bbaa6a3d87a2f7a7056f3fc7ae38b18251a36fb3e9b14';
export const LENDING_POOL_ID = '0x71c16bbb80ef782a55edba48bd569982daee79d636cb19fd072c9a719f97fbd3';
export const BUCK_TREASURY_ID = '0x0cc970c1dd8a434209566642b38dcf3e7a7490949354d4a1aebeeb83af7d4a2c';
export const MAINTENANCE_CAP_ID = '0x857260b5b5097d45510ade20228d0fab55aa8be1698b20801a3d4f2f13c24f9a';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::bucket_mock::BUCKET_MOCK`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::emergency_fund::EMERGENCY_FUND`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';
