'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, BUCK_TREASURY_ID, BUCK_COIN_TYPE } from '@/lib/sui-client';

export function MusharakahPool() {
	const [amount, setAmount] = useState<string>('');
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const account = useCurrentAccount();

	// Fetch Live BUCK Balance
	const { data: buckBalanceData, refetch: refetchBuck } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: BUCK_COIN_TYPE
	}, { enabled: !!account });

	const totalBuck = Number(buckBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;

	// FAUCET FUNCTION: Request free BUCK for testing
	const handleFaucet = async () => {
		if (!account) return;
		const tx = new Transaction();
		const [buckCoin] = tx.moveCall({
			target: `${PACKAGE_ID}::bucket_mock::mint_mock`,
			arguments: [
				tx.object(BUCK_TREASURY_ID),
				tx.pure.u64(100 * 1_000_000_000), // Request 100 BUCK
			],
		});
		tx.transferObjects([buckCoin], tx.pure.address(account.address));
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { alert('100 Test BUCK minted to your wallet!'); refetchBuck(); }
		});
	};

	const handleDeposit = async () => {
		if (!account || !amount) return;
		const tx = new Transaction();
		
		// Note: In real app, we use existing coins. 
		// For demo, we auto-mint if user enters more than they have
		const [buckCoin] = tx.moveCall({
			target: `${PACKAGE_ID}::bucket_mock::mint_mock`,
			arguments: [
				tx.object(BUCK_TREASURY_ID),
				tx.pure.u64(Number(amount) * 1_000_000_000),
			],
		});

		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::provide_liquidity`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object('0xTODO_SAVING_POOL'), buckCoin], // Mock saving pool needs ID
		});

		signAndExecute({ transaction: tx }, {
			onSuccess: (result) => alert(`Liquidity provided! Digest: ${result.digest}`)
		});
	};

	return (
		<div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
			<div className="flex justify-between items-start mb-6">
				<div>
					<h3 className="text-lg font-black text-slate-900 tracking-tight">Musharakah Pool</h3>
					<p className="text-sm text-slate-500 font-medium">Earn Halal Profit Sharing</p>
				</div>
				<button 
					onClick={handleFaucet}
					className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
				>
					Get 100 BUCK Faucet
				</button>
			</div>

			<div className="space-y-6 flex-grow">
				<div>
					<label className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
						Deposit Amount
						<span className="text-[10px] font-black text-slate-400">Balance: {totalBuck.toFixed(2)} BUCK</span>
					</label>
					<div className="relative">
						<input 
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full p-4 pr-16 border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
						/>
						<span className="absolute right-4 top-4 font-black text-slate-300">BUCK</span>
					</div>
				</div>

				<div className="p-5 bg-emerald-50/50 rounded-3xl text-[12px] text-emerald-900 leading-relaxed border border-emerald-100">
					<p className="font-bold flex items-center mb-2">
						<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						Partnership Benefits
					</p>
					<p className="opacity-80">
						Your BUCK is automatically staked in Bucket Protocol. You earn <strong>40% of BEFS fees</strong> + <strong>Bucket SUI Rewards</strong>.
					</p>
				</div>
			</div>

			<button 
				onClick={handleDeposit}
				disabled={!amount || !account}
				className="w-full mt-6 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
			>
				Provide Partnership Liquidity
			</button>
		</div>
	);
}