'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, BUCK_TREASURY_ID, BUCK_COIN_TYPE, SAVING_POOL_ID } from '@/lib/sui-client';

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
			onSuccess: () => { alert('100 Test BUCK minted!'); refetchBuck(); }
		});
	};

	const handleDeposit = async () => {
		if (!account || !amount) return;
		const tx = new Transaction();
		
		// For demo, we split from existing BUCK (or you can use your balance)
		// Usually we'd find a BUCK coin in wallet. Here we'll just mint fresh for simplicity of demo
		const [buckCoin] = tx.moveCall({
			target: `${PACKAGE_ID}::bucket_mock::mint_mock`,
			arguments: [tx.object(BUCK_TREASURY_ID), tx.pure.u64(Number(amount) * 1_000_000_000)],
		});

		const lpToken = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::provide_liquidity`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(SAVING_POOL_ID), buckCoin],
		});

		tx.transferObjects([lpToken], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: (result) => alert(`Liquidity provided! Partner Digest: ${result.digest}`)
		});
	};

	return (
		<div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
			<div className="flex justify-between items-start mb-6">
				<div>
					<h3 className="text-lg font-black text-slate-900 tracking-tight">Musharakah Pool</h3>
					<p className="text-sm text-slate-500 font-medium tracking-tight">Yield Layering Partnership</p>
				</div>
				<button 
					onClick={handleFaucet}
					className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-900/5"
				>
					Request Faucet
				</button>
			</div>

			<div className="space-y-6 flex-grow">
				<div>
					<label className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
						Provide BUCK
						<span className="text-blue-600">Wallet: {totalBuck.toFixed(2)}</span>
					</label>
					<div className="relative">
						<input 
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full p-4 pr-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
						/>
						<span className="absolute right-4 top-4 font-black text-slate-300">BUCK</span>
					</div>
				</div>

				<div className="p-5 bg-emerald-50/50 rounded-3xl text-[12px] text-emerald-900 leading-relaxed border border-emerald-100">
					<p className="font-bold flex items-center mb-2">
						<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						Integrated Yield
					</p>
					<p className="opacity-80">
						Your BUCK is automatically staked in <strong>Bucket Protocol Saving Pool</strong>. You earn a share of platform fees plus SUI rewards from Bucket.
					</p>
				</div>
			</div>

			<button 
				onClick={handleDeposit}
				disabled={!amount || !account}
				className="w-full mt-6 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
			>
				Start Partnership
			</button>
		</div>
	);
}
