'use client';

import { useState, useEffect } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID } from '@/lib/sui-client';

export function EmergencyForm() {
	const account = useCurrentAccount();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	
	const [suiAmount, setSuiAmount] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const [isAutoFilled, setIsAutoFilled] = useState(false);

	// Fetch Wallet Balance (SUI)
	const { data: balanceData } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: '0x2::sui::SUI'
	}, { enabled: !!account });

	const totalSuiRaw = balanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n;
	const totalSui = Number(totalSuiRaw) / 1_000_000_000;

	// Math Logic: Price Floor 0.70, MCR 150% (1.5)
	// Max Borrow = (SUI * 0.70) / 1.5
	const maxBorrowable = (totalSui * 0.70) / 1.5;

	// Auto-fill logic
	useEffect(() => {
		if (totalSui > 0 && !isAutoFilled) {
			const safeSui = totalSui * 0.9; // Leave 10% for gas
			setSuiAmount(safeSui.toFixed(3));
			setAmount(((safeSui * 0.70) / 1.5).toFixed(2));
			setIsAutoFilled(true);
		}
	}, [totalSui, isAutoFilled]);

	const currentMaxForInput = (Number(suiAmount) * 0.70) / 1.5;
	const feeAmount = amount ? Number(amount) * 0.10 : 0;
	const totalObligation = amount ? Number(amount) + feeAmount : 0;

	const handleBorrow = async () => {
		if (!account || !amount || !suiAmount) return;

		const tx = new Transaction();
		const vault = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::create_vault`,
			arguments: [],
		});

		const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(Math.floor(Number(suiAmount) * 1_000_000_000))]);
		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::deposit_collateral`,
			arguments: [vault, suiCoin],
		});

		const mockCdp = tx.moveCall({ target: `${PACKAGE_ID}::bucket_mock::create_mock_cdp`, arguments: [tx.pure.u64(1000), tx.pure.u64(0)] });
		const mockScore = tx.moveCall({ target: `${PACKAGE_ID}::credit_score::create_credit_score`, arguments: [] });

		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::borrow`,
			arguments: [
				tx.object(LENDING_POOL_ID),
				vault,
				mockCdp,
				tx.pure.u64(Math.floor(Number(amount) * 1_000_000_000)),
				mockScore,
				tx.object('0x6'),
			],
		});

		tx.transferObjects([vault, mockScore], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: (result) => alert(`Success! Digest: ${result.digest}`),
			onError: (err) => alert(`Error: ${err.message}`)
		});
	};

	return (
		<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
			<h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
				<span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
				Request BUCK Liquidity
			</h3>
			
			<div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
				<div className="flex justify-between items-center mb-1 text-xs">
					<span className="text-blue-600 font-bold">Wallet SUI Balance</span>
					<span className="text-blue-900 font-black">{totalSui.toFixed(4)} SUI</span>
				</div>
				<div className="flex justify-between items-center text-[10px]">
					<span className="text-slate-400">System Capacity (Price Floor)</span>
					<span className="text-slate-500 font-bold">$0.70 / SUI</span>
				</div>
			</div>

			<div className="space-y-4 flex-grow">
				<div>
					<label className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
						SUI to Deposit
						<button 
							onClick={() => { setSuiAmount((totalSui * 0.95).toFixed(3)); setIsAutoFilled(true); }}
							className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
						>
							Use Max
						</button>
					</label>
					<div className="relative">
						<input 
							type="number"
							value={suiAmount}
							onChange={(e) => { setSuiAmount(e.target.value); setIsAutoFilled(true); }}
							className="w-full p-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
						/>
						<span className="absolute right-4 top-3 font-bold text-slate-400">SUI</span>
					</div>
				</div>

				<div>
					<label className="text-sm font-semibold text-slate-700 mb-1 block">
						BUCK to Borrow
					</label>
					<div className="relative">
						<input 
							type="number"
							value={amount}
							max={currentMaxForInput}
							onChange={(e) => { setAmount(e.target.value); setIsAutoFilled(true); }}
							className="w-full p-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
						/>
						<span className="absolute right-4 top-3 font-bold text-slate-400">BUCK</span>
					</div>
					<div className="mt-2 flex justify-between items-center">
						<span className="text-[10px] text-slate-400 font-bold uppercase">Safe Limit</span>
						<span className="text-[10px] text-emerald-600 font-black">{currentMaxForInput.toFixed(2)} BUCK</span>
					</div>
				</div>

				<div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-[11px] border border-slate-100">
					<div className="flex justify-between">
						<span className="text-slate-500">Ujrah (Service Fee)</span>
						<span className="font-bold text-slate-900">+{feeAmount.toFixed(2)} BUCK</span>
					</div>
					<div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
						<span className="font-bold text-slate-900">Total Obligation</span>
						<span className="font-black text-blue-600">{totalObligation.toFixed(2)} BUCK</span>
					</div>
				</div>
			</div>

			<button 
				onClick={handleBorrow}
				disabled={!amount || Number(amount) > currentMaxForInput || !account}
				className="w-full mt-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/10 active:scale-95"
			>
				{account ? 'Initiate Sharia Vault' : 'Connect Wallet'}
			</button>
		</div>
	);
}
