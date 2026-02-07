'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, BUCK_TREASURY_ID, BUCK_COIN_TYPE, SAVING_POOL_ID, LP_COIN_TYPE } from '@/lib/sui-client';

export function MusharakahPool() {
	const [amount, setAmount] = useState<string>('');
	const [withdrawAmount, setWithdrawAmount] = useState<string>('');
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const account = useCurrentAccount();
	const suiClient = useSuiClient();

	// Fetch Live BUCK Balance
	const { data: buckBalanceData, refetch: refetchBuck } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: BUCK_COIN_TYPE
	}, { enabled: !!account });

	// Fetch Live LP Shares
	const { data: lpBalanceData, refetch: refetchLP } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: LP_COIN_TYPE
	}, { enabled: !!account });

	const totalBuck = Number(buckBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	const totalLP = Number(lpBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;

	// FAUCET: Request free BUCK
	const handleFaucet = async () => {
		if (!account) return;
		const tx = new Transaction();
		const [buckCoin] = tx.moveCall({
			target: `${PACKAGE_ID}::bucket_mock::mint_mock`,
			arguments: [tx.object(BUCK_TREASURY_ID), tx.pure.u64(100 * 1_000_000_000)],
		});
		tx.transferObjects([buckCoin], tx.pure.address(account.address));
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { setTimeout(() => refetchBuck(), 1000); alert('100 Test BUCK minted!'); }
		});
	};

	const handleDeposit = async () => {
		if (!account || !amount) return;
		const coins = await suiClient.getCoins({ owner: account.address, coinType: BUCK_COIN_TYPE });
		if (coins.data.length === 0) return alert("Faucet first!");

		const tx = new Transaction();
		const coinIds = coins.data.map(c => c.coinObjectId);
		if (coinIds.length > 1) tx.mergeCoins(tx.object(coinIds[0]), coinIds.slice(1).map(id => tx.object(id)));
		const [buckToSpend] = tx.splitCoins(tx.object(coinIds[0]), [tx.pure.u64(Number(amount) * 1_000_000_000)]);

		const lpToken = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::provide_liquidity`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(SAVING_POOL_ID), buckToSpend],
		});

		tx.transferObjects([lpToken], tx.pure.address(account.address));
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { setTimeout(() => { refetchBuck(); refetchLP(); }, 1500); alert('Partnership established!'); }
		});
	};

	const handleWithdraw = async () => {
		if (!account || !withdrawAmount) return;
		const lpCoins = await suiClient.getCoins({ owner: account.address, coinType: LP_COIN_TYPE });
		if (lpCoins.data.length === 0) return alert("No LP shares found!");

		const tx = new Transaction();
		const coinIds = lpCoins.data.map(c => c.coinObjectId);
		if (coinIds.length > 1) tx.mergeCoins(tx.object(coinIds[0]), coinIds.slice(1).map(id => tx.object(id)));
		const [lpToBurn] = tx.splitCoins(tx.object(coinIds[0]), [tx.pure.u64(Number(withdrawAmount) * 1_000_000_000)]);

		// Returns (BUCK, SUI)
		const [buckResult, suiResult] = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::remove_liquidity`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(SAVING_POOL_ID), lpToBurn],
		});

		tx.transferObjects([buckResult, suiResult], tx.pure.address(account.address));
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { setTimeout(() => { refetchBuck(); refetchLP(); }, 1500); alert('Funds & Rewards withdrawn!'); }
		});
	};

	return (
		<div className="space-y-6">
			<div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
				<div className="flex justify-between items-start mb-6">
					<div>
						<h3 className="text-lg font-black text-slate-900 tracking-tight">Musharakah Pool</h3>
						<p className="text-xs text-slate-500 font-medium">Add BUCK to earn yield</p>
					</div>
					<button onClick={handleFaucet} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Request Faucet</button>
				</div>

				<div className="space-y-4">
					<div className="relative">
						<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full p-4 pr-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
						<span className="absolute right-4 top-4 font-black text-slate-300">BUCK</span>
					</div>
					<button onClick={handleDeposit} disabled={!amount || !account} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95 disabled:opacity-30 tracking-tight">Provide Liquidity</button>
				</div>
			</div>

			<div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
				<div>
					<h3 className="text-lg font-black text-slate-900 tracking-tight">Withdraw & Claim</h3>
					<p className="text-xs text-slate-500 font-medium mb-6">Burn LP shares to receive BUCK + SUI Rewards</p>
				</div>

				<div className="space-y-4">
					<div className="relative">
						<input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="w-full p-4 pr-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
						<span className="absolute right-4 top-4 font-black text-slate-300">lpBUCK</span>
					</div>
					<button onClick={handleWithdraw} disabled={!withdrawAmount || !account || Number(withdrawAmount) > totalLP} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 tracking-tight">Withdraw All Assets</button>
				</div>
			</div>
		</div>
	);
}
