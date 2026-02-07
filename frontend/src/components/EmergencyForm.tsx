'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID } from '@/lib/sui-client';

export function EmergencyForm() {
	const [suiAmount, setSuiAmount] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const account = useCurrentAccount();

	// Risk Logic: Collateral Price = 0.70 BUCK. Min Ratio = 150% (1.5).
	const maxBorrowable = suiAmount ? (Number(suiAmount) * 0.70) / 1.5 : 0;
	const feeAmount = amount ? Number(amount) * 0.10 : 0;
	const totalObligation = amount ? Number(amount) + feeAmount : 0;

	const handleBorrow = async () => {
		if (!account || !amount || !suiAmount) return;

		const tx = new Transaction();
		
		// 1. Create a vault for the user (Simplified: in a real app, check if exists)
		const vault = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::create_vault`,
			arguments: [],
		});

		// 2. Deposit SUI Collateral
		const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(suiAmount) * 1_000_000_000)]);
		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::deposit_collateral`,
			arguments: [vault, suiCoin],
		});

		// 3. Request Borrow
		// Note: Requires a CreditScore and CDP object. 
		// For this demo/testing, we use placeholders or mock creation
		const mockCdp = tx.moveCall({
			target: `${PACKAGE_ID}::bucket_mock::create_mock_cdp`,
			arguments: [tx.pure.u64(1000), tx.pure.u64(0)],
		});
		const mockScore = tx.moveCall({
			target: `${PACKAGE_ID}::credit_score::create_credit_score`,
			arguments: [],
		});

		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::borrow`,
			arguments: [
				tx.object(LENDING_POOL_ID),
				vault,
				mockCdp,
				tx.pure.u64(Number(amount) * 1_000_000_000),
				mockScore,
				tx.object('0x6'), // Clock
			],
		});

		// Transfer vault to user
		tx.transferObjects([vault, mockScore], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: (result) => {
				alert(`Success! Transaction Digest: ${result.digest}`);
			},
			onError: (err) => {
				alert(`Error: ${err.message}`);
			}
		});
	};

	return (
		<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
			<h3 className="text-lg font-bold text-slate-900 mb-4">Request Emergency BUCK</h3>
			
			<div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-[12px] text-orange-800">
				<p className="font-bold mb-1 flex items-center">
					🌙 Sharia Risk Policy
				</p>
				<p className="opacity-90">
					Collateral is valued at $0.70 (Predicted Low). A 10% upfront Ujrah (Service Fee) is added to your obligation.
				</p>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-1">
						SUI Collateral Deposit
					</label>
					<div className="relative">
						<input 
							type="number"
							value={suiAmount}
							onChange={(e) => setSuiAmount(e.target.value)}
							placeholder="0.00"
							className="w-full p-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
						<span className="absolute right-4 top-3 font-bold text-slate-400">SUI</span>
					</div>
					<p className="text-[10px] text-slate-400 mt-1 font-medium italic">
						Safe Borrow Limit: {maxBorrowable.toFixed(2)} BUCK
					</p>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-1">
						Borrow Amount
					</label>
					<div className="relative">
						<input 
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full p-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
						<span className="absolute right-4 top-3 font-bold text-slate-400">BUCK</span>
					</div>
				</div>

				<div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
					<div className="flex justify-between">
						<span className="text-slate-500">Principal</span>
						<span className="font-bold text-slate-900">{amount || '0.00'} BUCK</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-500">Ujrah (10%)</span>
						<span className="font-bold text-slate-900">+{feeAmount.toFixed(2)} BUCK</span>
					</div>
					<div className="pt-2 border-t border-slate-200 flex justify-between">
						<span className="font-bold text-slate-900 text-sm">Total Repayment</span>
						<span className="font-black text-blue-600 text-sm">{totalObligation.toFixed(2)} BUCK</span>
					</div>
				</div>

				<button 
					onClick={handleBorrow}
					disabled={!amount || Number(amount) > maxBorrowable || !account}
					className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/10 active:scale-95"
				>
					{account ? 'Accept Terms & Borrow' : 'Connect Wallet First'}
				</button>
			</div>
		</div>
	);
}