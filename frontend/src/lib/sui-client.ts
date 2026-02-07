import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

// Use SuiJsonRpcClient as per the version installed in this project
export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// Deployment Constants
export const PACKAGE_ID = '0xccb8cf3645157e4572ee8e2e5451a0431ca767ff3f18a539d11ffcc0f681b8f3';
export const LENDING_POOL_ID = '0x05d96f87f9996cbe3f04be0443035961666ec7608b7997c563b6452bb68d0066';
export const BUCK_TREASURY_ID = '0xd68c1075a820e3162a337910568507b43e58a4d717d36198faceb69a565a6e6b';
export const MAINTENANCE_CAP_ID = '0xfff4fe227cae29de911147e0587cd785fa5e4067660ad712e936fae9b4a22849';

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';