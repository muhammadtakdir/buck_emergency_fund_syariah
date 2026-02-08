import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// LATEST TESTNET DEPLOYMENT (Clean Build - Feb 2026)
export const PACKAGE_ID = '0x08985c3215a91d765c2b850c2c3662d7af1ee7d8b7987d5ae8c31d04225e7794';
export const LENDING_POOL_ID = '0x4becc4f9ecd8493de4ca6ad58b0e9819e14cbb00e9d97355a21c45c78ef13411';
export const SAVING_POOL_ID = '0xb0f92ca8dde706eb6d3fccc40bea2c3fd61322189804bcc61863bc78f3ffcea4';
export const BUCK_TREASURY_ID = '0x6c81384a4a649de6708144eca87362cd911e365ffe0312d1ca68683fd8d6a8b8';
export const MAINTENANCE_CAP_ID = '0xa6235bc17864bd1afe93977d15b958d20897493e83a789a7b368a825846c4373';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::usdb::USDB`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::lp_usdb::LP_USDB`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'usdb';
export const MODULE_CREDIT_SCORE = 'credit_score';