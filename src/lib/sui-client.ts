import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// LATEST AUDITED TESTNET DEPLOYMENT (Clean Build - Feb 2026)
export const PACKAGE_ID = '0xd9464c5b315f6ba047b06d9a8d664033538677847ea1bb501ad55c901f0609fa';
export const LENDING_POOL_ID = '0xf1160e8e388c6d3afa8e4a2dcfdcffc3c3ed9ba939b227a42c1e9811c0e0a082';
export const BUCK_TREASURY_ID = '0x84b6cfa2bbd94dc4600ef1b2dea99c04cbc5455064e5985f70c5b13cc45974e2';
export const MAINTENANCE_CAP_ID = '0x34421cd9ff28268b9c6ff24caa313de8d55797d07c737478448c3631d7c4cb40';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::bucket_mock::BUCKET_MOCK`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::emergency_fund::EMERGENCY_FUND`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';
