'use client';

import { useState, useEffect } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, SAVING_POOL_ID } from '@/lib/sui-client';
import { useSuiPrice } from '@/lib/useSuiPrice';

interface Props {
    onTransactionSuccess?: () => void;
}

export function EmergencyForm({ onTransactionSuccess }: Props) {
	const account = useCurrentAccount();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const { data: suiPrice } = useSuiPrice();
	
	const [suiAmount, setSuiAmount] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const [duration, setDuration] = useState<number>(6);
	const [isAutoFilled, setIsAutoFilled] = useState(false);
	const [agreed, setAgreed] = useState(false);

	const { data: balanceData, refetch: refetchSui } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: '0x2::sui::SUI'
	}, { enabled: !!account });

	const { data: poolObject, refetch: refetchPool } = useSuiClientQuery('getObject', { id: LENDING_POOL_ID, options: { showContent: true } });

	const totalSuiRaw = balanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n;
	const totalSui = Number(totalSuiRaw) / 1_000_000_000;

	const poolFields = (poolObject?.data?.content as any)?.fields;
	
	const getBal = (f: any) => {
		if (!f) return 0;
		if (typeof f === 'string' || typeof f === 'number') return Number(f);
		if (f.fields && f.fields.value) return Number(f.fields.value);
		if (f.value) return Number(f.value);
		return 0;
	};

	const availableLiquidity = poolFields ? (getBal(poolFields.usdb_reserve) + getBal(poolFields.susdb_reserve)) / 1_000_000_000 : 0;

	const suiPriceValue = suiPrice || 1.5; 
	const minCollateralRatio = 1.5;
	const serviceFeeMultiplier = 1.1; 
	const maxBorrowable = suiAmount ? (Number(suiAmount) * suiPriceValue) / (minCollateralRatio * serviceFeeMultiplier) : 0;
	const isExceeded = Number(amount) > maxBorrowable;
	
	const feeAmount = amount ? Number(amount) * 0.10 : 0;
	const totalObligation = amount ? Number(amount) + feeAmount : 0;

	useEffect(() => {
		if (suiAmount && !isAutoFilled && suiPriceValue > 0) {
			const calculatedMax = Math.min(maxBorrowable, availableLiquidity);
			setAmount(calculatedMax.toFixed(2));
		}
	}, [suiAmount, maxBorrowable, availableLiquidity, isAutoFilled, suiPriceValue]);

	const handleSuiChange = (val: string) => {
		setSuiAmount(val);
		setIsAutoFilled(false);
	};

	const handleBorrow = async () => {
		if (!account || !amount || !suiAmount || !agreed || isExceeded) return;

        if (Number(amount) > 0.1) {
            alert(`⚠️ Testnet Demo Limit\n\nTo prevent arithmetic overflow in this demo version (u64 logic), please borrow amounts <= 0.1 USDB.\n\nThis limit will be removed in the Mainnet version which uses full u128 precision for infinite scalability.`);
            return;
        }

		const tx = new Transaction();
		const vault = tx.moveCall({ target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::create_vault`, arguments: [] });

		const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(Math.floor(Number(suiAmount) * 1_000_000_000)))]);
		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::deposit_collateral`,
			arguments: [tx.object(LENDING_POOL_ID), vault, suiCoin],
		});

		const [borrowedUsdb] = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::borrow`,
			arguments: [
				tx.object(LENDING_POOL_ID),
				vault,
				tx.object(SAVING_POOL_ID),
				tx.pure.u64(BigInt(Math.floor(Number(amount) * 1_000_000_000))),
				tx.pure.u64(BigInt(Math.floor(suiPriceValue * 1_000_000_000))),
				tx.pure.u64(BigInt(duration)),
			],
		});

		tx.transferObjects([borrowedUsdb, vault], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
                setTimeout(() => { 
                    refetchSui(); 
                    refetchPool(); 
                    if (onTransactionSuccess) onTransactionSuccess(); 
                }, 1500);
                alert(`Borrow Success! USDB sent to wallet.`); 
                setSuiAmount('');
                setAmount('');
            },
			onError: (err) => alert(`Borrow Error: ${err.message}`)
		});
	};

	return (
		<div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-sm h-full flex flex-col transition-all">
			<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 tracking-tight uppercase">
				<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
				Request USDB
			</h3>
			
			<div className="space-y-6 flex-grow">
                <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest leading-none mb-1">USDB Capacity</p>
                        <p className="text-sm font-black text-emerald-400">{availableLiquidity.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                        <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest leading-none mb-1">SUI Price</p>
                        <p className="text-sm font-black text-blue-400">${suiPriceValue.toFixed(2)}</p>
                    </div>
                </div>

				<div className="space-y-4">
					<div>
						<label className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest px-1">
							SUI Collateral
							<span className="text-blue-400">Wallet: {totalSui.toFixed(2)}</span>
						</label>
						<div className="relative">
							<input type="number" value={suiAmount} onChange={(e) => handleSuiChange(e.target.value)} placeholder="0.00" className="w-full p-4 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-blue-500/50 outline-none font-bold text-white transition-all" />
							<span className="absolute right-4 top-4 font-bold text-slate-600 text-sm">SUI</span>
						</div>
					</div>

					<div>
						<div className="flex justify-between px-1 mb-2">
							<label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Borrow</label>
							<span className={`text-[10px] font-bold uppercase ${isExceeded ? 'text-red-400' : 'text-slate-600'}`}>Max: {maxBorrowable.toFixed(2)}</span>
						</div>
						<div className="relative">
							<input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setIsAutoFilled(true); }} placeholder="Max 0.1 USDB" className={`w-full p-4 pr-16 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-blue-500/50 outline-none font-bold transition-all ${isExceeded ? 'text-red-400' : 'text-blue-400'}`} />
							<span className="absolute right-4 top-4 font-bold text-slate-600 text-sm uppercase">USDB</span>
						</div>
					</div>

					<div>
						<label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-widest px-1">Term: {duration} Months</label>
						<input type="range" min="1" max="24" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
					</div>
				</div>

				<div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-700/50 shadow-inner">
					<div className="space-y-3">
						<div className="flex justify-between items-end">
							<span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Debt + Fee</span>
							<span className="font-black text-xl text-white leading-none">{totalObligation.toFixed(2)} <span className="text-xs opacity-40 uppercase">USDB</span></span>
						</div>
						<div className="h-px bg-slate-800 w-full" />
						<div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
							<span>Ujrah (10%)</span>
							<span className="text-slate-400">{feeAmount.toFixed(2)} USDB</span>
						</div>
					</div>
				</div>

				<label className="flex items-start gap-3 cursor-pointer group px-1">
					<div className="relative mt-0.5">
						<input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded-lg border-2 border-slate-700 appearance-none checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer shadow-sm" />
						{agreed && <svg className="absolute inset-0 w-5 h-5 text-white p-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
					</div>
					<span className="text-[10px] text-slate-500 font-medium leading-tight group-hover:text-slate-400 transition-colors uppercase tracking-tight">I agree to the fixed Sharia contract terms.</span>
				</label>
			</div>

			<button 
				onClick={handleBorrow} 
				disabled={!amount || isExceeded || !account || !agreed || availableLiquidity < Number(amount)} 
				className={`w-full mt-6 py-4 font-bold rounded-2xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest ${!isExceeded && agreed && availableLiquidity >= Number(amount) ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
			>
				{availableLiquidity < Number(amount) ? 'Insufficient Liquidity' : isExceeded ? 'Limit Exceeded' : 'Confirm & Borrow'}
			</button>
		</div>
	);
}
