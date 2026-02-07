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
	const [agreed, setAgreed] = useState(false);

	// Fetch Wallet Balance (SUI)
	const { data: balanceData } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: '0x2::sui::SUI'
	}, { enabled: !!account });

	// Fetch Pool Liquidity
	const { data: poolObject } = useSuiClientQuery('getObject', {
		id: LENDING_POOL_ID,
		options: { showContent: true }
	});

	const totalSuiRaw = balanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n;
	const totalSui = Number(totalSuiRaw) / 1_000_000_000;

	const poolFields = (poolObject?.data?.content as any)?.fields;
	const availableLiquidity = poolFields ? Number(poolFields.buck_balance) / 1_000_000_000 : 0;

	// Math Logic: Price Floor 0.70, MCR 150% (1.5)
	const maxBorrowableFromCollateral = (totalSui * 0.70) / 1.5;
	// Final Max is restricted by either collateral OR protocol liquidity
	const absoluteMaxBorrowable = Math.min(maxBorrowableFromCollateral, availableLiquidity);

	// Auto-fill logic
	useEffect(() => {
		if (totalSui > 0 && !isAutoFilled && availableLiquidity > 0) {
			const safeSui = totalSui * 0.9; 
			const calculatedBuck = (safeSui * 0.70) / 1.5;
			const finalBuck = Math.min(calculatedBuck, availableLiquidity);
			
			setSuiAmount(safeSui.toFixed(3));
			setAmount(finalBuck.toFixed(2));
			setIsAutoFilled(true);
		}
	}, [totalSui, isAutoFilled, availableLiquidity]);

	const currentMaxForInput = Math.min((Number(suiAmount) * 0.70) / 1.5, availableLiquidity);
	const feeAmount = amount ? Number(amount) * 0.10 : 0;
	const totalObligation = amount ? Number(amount) + feeAmount : 0;

	const handleBorrow = async () => {
		if (!account || !amount || !suiAmount || !agreed) return;

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
		<div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 h-full flex flex-col">
			<h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
				<span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
				Request BUCK Liquidity
			</h3>
			
			<div className="space-y-5 flex-grow">
				{/* Protocol Liquidity Info */}
				<div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
					<div>
						<p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available Pool Liquidity</p>
						<p className="text-lg font-black text-emerald-900">{availableLiquidity.toLocaleString()} BUCK</p>
					</div>
					<div className="bg-white/50 p-2 rounded-xl">
						<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
					</div>
				</div>

				{/* Inputs */}
				<div className="space-y-4">
					<div>
						<label className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
							SUI Collateral
							<span className="text-blue-600">Wallet: {totalSui.toFixed(3)}</span>
						</label>
						<div className="relative">
							<input 
								type="number"
								value={suiAmount}
								onChange={(e) => { setSuiAmount(e.target.value); setIsAutoFilled(true); }}
								className="w-full p-4 pr-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
							/>
							<span className="absolute right-4 top-4 font-black text-slate-300">SUI</span>
						</div>
					</div>

					<div>
						<label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">
							Receive BUCK
						</label>
						<div className="relative">
							<input 
								type="number"
								value={amount}
								max={currentMaxForInput}
								onChange={(e) => { setAmount(e.target.value); setIsAutoFilled(true); }}
								className="w-full p-4 pr-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600 text-lg"
							/>
							<span className="absolute right-4 top-5 font-black text-slate-300">BUCK</span>
						</div>
						<div className="mt-2 flex justify-between items-center px-1">
							<span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
								Safe Limit (Collateral): <span className="text-slate-600">{(Number(suiAmount) * 0.70 / 1.5).toFixed(2)}</span>
							</span>
							<span className="text-[10px] text-emerald-600 font-black">POOL OK</span>
						</div>
					</div>
				</div>

				{/* Contract Agreement Summary */}
				<div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/20">
					<h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Sharia Contract Summary</h4>
					<div className="space-y-3">
						<div className="flex justify-between text-sm">
							<span className="text-slate-400">Principal Received</span>
							<span className="font-bold">{amount || '0.00'} BUCK</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-slate-400">Fixed Ujrah (Service Fee)</span>
							<span className="font-bold text-emerald-400">+{feeAmount.toFixed(2)} BUCK</span>
						</div>
						<div className="pt-3 border-t border-white/10 flex justify-between items-end">
							<span className="text-xs font-bold text-blue-300">Total Fixed Obligation</span>
							<span className="text-xl font-black text-white">{totalObligation.toFixed(2)} BUCK</span>
						</div>
					</div>
					
					<div className="mt-5 p-3 bg-white/5 rounded-xl text-[10px] leading-relaxed text-slate-300 italic border border-white/5">
						"I agree to return a total of <strong>{totalObligation.toFixed(2)} BUCK</strong>. I understand this amount is fixed and can be paid in installments. My SUI collateral will be released only upon full repayment."
					</div>
				</div>

				{/* Consent Checkbox */}
				<label className="flex items-start gap-3 cursor-pointer group">
					<div className="relative flex items-center mt-1">
						<input 
							type="checkbox"
							checked={agreed}
							onChange={(e) => setAgreed(e.target.checked)}
							className="w-5 h-5 rounded-lg border-2 border-slate-200 appearance-none checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
						/>
						{agreed && (
							<svg className="w-3 h-3 text-white absolute left-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
							</svg>
						)}
					</div>
					<span className="text-[11px] text-slate-500 font-medium leading-tight group-hover:text-slate-700 transition-colors">
						I solemnly agree to the terms of this Sharia-compliant liquidity contract and commit to fulfilling the obligation.
					</span>
				</label>
			</div>

			<button 
				onClick={handleBorrow}
				disabled={!amount || Number(amount) > currentMaxForInput || !account || !agreed || availableLiquidity <= 0}
				className={`w-full mt-6 py-4 font-black rounded-2xl transition-all shadow-xl active:scale-95 ${agreed && availableLiquidity > 0 ? 'bg-blue-600 text-white shadow-blue-900/20 hover:bg-blue-700' : 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'}`}
			>
				{availableLiquidity <= 0 ? 'Pool Out of Liquidity' : account ? 'Accept Agreement & Borrow' : 'Connect Wallet'}
			</button>
		</div>
	);
}
