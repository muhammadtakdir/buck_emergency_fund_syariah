'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, BUCK_TREASURY_ID } from '@/lib/sui-client';

export function MusharakahPool() {
	const [amount, setAmount] = useState<string>('');
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const account = useCurrentAccount();

	const handleDeposit = async () => {
		if (!account || !amount) return;

		const tx = new Transaction();

		// For testing: Mint BUCK from our mock treasury first so user has funds
		const [buckCoin] = tx.moveCall({
			target: `${PACKAGE_ID}::bucket_mock::mint_mock`,
			arguments: [
				tx.object(BUCK_TREASURY_ID),
				tx.pure.u64(Number(amount) * 1_000_000_000),
			],
		});

		// Provide Liquidity to Pool
		const lpToken = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::provide_liquidity`,
			arguments: [
				tx.object(LENDING_POOL_ID),
				buckCoin,
			],
		});

		// Transfer LP token to user
		tx.transferObjects([lpToken], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: (result) => {
				alert(`Success! You are now a Musharakah Partner. Digest: ${result.digest}`);
			},
			onError: (err) => {
				alert(`Error: ${err.message}`);
			}
		});
	};

	return (
		<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
			<div className="flex justify-between items-start mb-6">
				<div>
					<h3 className="text-lg font-bold text-slate-900">Musharakah Pool</h3>
					<p className="text-sm text-slate-500 font-medium">Be a partner, share the growth</p>
				</div>
				<div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
					Halal Profit
				</div>
			</div>

			<div className="space-y-6 flex-grow">
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-1">
						Amount to Provide
					</label>
					<div className="relative">
						<input 
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full p-4 pr-16 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
						/>
						<span className="absolute right-4 top-4 font-black text-slate-300">BUCK</span>
					</div>
					<p className="text-[10px] text-slate-400 mt-2 italic font-medium">
						* For testing, BUCK will be automatically minted to your wallet.
					</p>
				</div>

				<div className="p-5 bg-emerald-50 rounded-2xl text-[12px] text-emerald-900 leading-relaxed border border-emerald-100">
					<p className="font-bold flex items-center mb-2">
						<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Sharia Profit Sharing
					</p>
					<p className="opacity-80">
						Lenders earn <strong>40% of all service fees</strong> collected. Your capital remains yours, growing ethically with every community transaction.
					</p>
				</div>
			</div>

			<button 
				onClick={handleDeposit}
				disabled={!amount || !account}
				className="w-full mt-6 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
			>
				{account ? 'Partner & Provide Liquidity' : 'Connect Wallet First'}
			</button>
		</div>
	);
}