import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// Deployment Constants
export const PACKAGE_ID = '0xdb96eb578167df475639a4392d8db1e46afe114bc38ad0cf8f9c653c457ec929';
export const LENDING_POOL_ID = '0x4e7f127994d3435c54849a5d10ba19cfda12dd348b2d01daced8721d51ebefd5';
export const BUCK_TREASURY_ID = '0x5a48236911525857cb6c393fb53013b4869ab988e7edeca4064e70423d123431';
export const MAINTENANCE_CAP_ID = '0x0f8b358da9bf62d19ebe21fc788e8cd4411bf4212f48414f5cfea0686018fdda';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::bucket_mock::BUCKET_MOCK`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::emergency_fund::EMERGENCY_FUND`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';