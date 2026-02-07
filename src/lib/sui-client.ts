import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// Final Deployment Constants (Updated with total_sui_locked stat)
export const PACKAGE_ID = '0xdf6fb812b9da547b5fb6eca5ccd564c8a57ba813beb786d480158390c55aae6f';
export const LENDING_POOL_ID = '0x29a6e48a78fd96fff39773bf3d3e0b31941ac67ccc79cb41bb550e4f173b14ef';
export const BUCK_TREASURY_ID = '0xc51c9614d5fdea10f6086b991eacf2874f9da79ed838f7560fa1c61cf9c6de65';
export const MAINTENANCE_CAP_ID = '0xaf82037e80cd9d266d3dda8cc11af06ba42f4d07a059cc591e5d0add20d5c625';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::bucket_mock::BUCKET_MOCK`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::emergency_fund::EMERGENCY_FUND`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';
