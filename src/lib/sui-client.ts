import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

export const SUI_NETWORK = 'testnet';
export const SUI_RPC_URL = getJsonRpcFullnodeUrl(SUI_NETWORK);

export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: SUI_NETWORK });

// LATEST TESTNET DEPLOYMENT (Clean Build - Feb 2026)
export const PACKAGE_ID = '0x85eb663a77fe6345feb8a6f47e1bdfbf8b71e7f1568de833b822f0123b411452';
export const LENDING_POOL_ID = '0x74d9af186f3f5cfd4196cffec960cd192ac739a4efa485cee47b44f8335b2915';
export const SAVING_POOL_ID = '0x0c7dde1126800370b2f5b4133d49c9294af3158fee336efb56a0a1776c057dd0';
export const BUCK_TREASURY_ID = '0x85a58a00674deef66ed1a8f05dbb96c6eafa96624217350eec5d228fa1e89533';
export const MAINTENANCE_CAP_ID = '0xf7bba96e0595d60c7604d9e2a81cf7d8811393d6aa72960fd922813a5a4c9628';

// Coin Types
export const BUCK_COIN_TYPE = `${PACKAGE_ID}::bucket_mock::BUCKET_MOCK`;
export const LP_COIN_TYPE = `${PACKAGE_ID}::emergency_fund::EMERGENCY_FUND`;

// Module Names
export const MODULE_EMERGENCY_FUND = 'emergency_fund';
export const MODULE_BUCKET_MOCK = 'bucket_mock';
export const MODULE_CREDIT_SCORE = 'credit_score';