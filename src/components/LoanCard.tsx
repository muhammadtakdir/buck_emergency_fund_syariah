'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, BUCK_COIN_TYPE, BUCK_TREASURY_ID } from '@/lib/sui-client';
import { useSuiPrice } from '@/lib/useSuiPrice';

interface Props {
    refreshTrigger?: number;
    onTransactionSuccess?: () => void;
}

export function LoanCard({ refreshTrigger, onTransactionSuccess }: Props) {
	const account = useCurrentAccount();
	const suiClient = useSuiClient();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const { data: suiPrice } = useSuiPrice();
    const [repayAmount, setRepayAmount] = useState<Record<string, string>>({});
    const [agreedToSui, setAgreedToSui] = useState<Record<string, boolean>>({});

	const { data: objects, isLoading, refetch } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::UserVault` },
		options: { showContent: true }
	}, { enabled: !!account });

	const { data: scoreObjects } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::credit_score::CreditScore` },
		options: { showContent: true }
	}, { enabled: !!account });

    useEffect(() => {
        if (account) refetch();
    }, [refreshTrigger, account, refetch]);

	if (isLoading) return <div className="animate-pulse bg-slate-800/40 h-48 rounded-3xl" />;

	const getBal = (f: any) => {
		if (!f) return 0;
		if (typeof f === 'string' || typeof f === 'number') return Number(f);
		if (f.fields && f.fields.value) return Number(f.fields.value);
		if (f.value) return Number(f.value);
		return 0;
	};

	const vaults = objects?.data.map((obj: any) => {
		const fields = obj.data?.content?.fields;
		if (!fields) return null;
		
        const principal = Number(fields.principal_debt);
        const fee = Number(fields.fee_debt);
        const isPaidOff = principal === 0 && fee === 0;

		return {
			objectId: obj.data?.objectId,
			id: obj.data?.objectId.substring(0, 6),
			principal: principal / 1_000_000_000,
			ujrah: fee / 1_000_000_000,
			collateral: getBal(fields.collateral_balance) / 1_000_000_000,
			deadline: fields.deadline === '0' ? 'Contract Active' : 'Active',
			isPaidOff
		};
	}).filter(v => v !== null) || [];

	const scoreObjectId = scoreObjects?.data[0]?.data?.objectId;

	const handleRepayBUCK = async (vault: any) => {
		if (!account) return;
        const inputAmount = repayAmount[vault.objectId] || (vault.principal + vault.ujrah).toString();
        if (Number(inputAmount) <= 0) return alert("Enter valid amount");

		const tx = new Transaction();
		let scoreObj = scoreObjectId ? tx.object(scoreObjectId) : tx.moveCall({ target: `${PACKAGE_ID}::credit_score::create_credit_score`, arguments: [] });

		const coins = await suiClient.getCoins({ owner: account.address, coinType: BUCK_COIN_TYPE });
		if (coins.data.length === 0) return alert("No USDB found to repay!");

		const rawAmount = BigInt(Math.floor(Number(inputAmount) * 1_000_000_000));
		const coinIds = coins.data.map(c => c.coinObjectId);
		if (coinIds.length > 1) tx.mergeCoins(tx.object(coinIds[0]), coinIds.slice(1).map(id => tx.object(id)));
		const [buckToRepay] = tx.splitCoins(tx.object(coinIds[0]), [tx.pure.u64(rawAmount)]);

		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::repay`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(vault.objectId), buckToRepay, scoreObj],
		});

		if (!scoreObjectId) tx.transferObjects([scoreObj], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
                setTimeout(() => {
                    refetch(); 
                    if (onTransactionSuccess) onTransactionSuccess();
                }, 1500);
                alert('Success: Repayment Processed!'); 
                setRepayAmount(prev => ({ ...prev, [vault.objectId]: '' }));
            },
			onError: (err) => alert(`Error: ${err.message}`)
		});
	};

	const handleRepayWithSui = async (vault: any) => {
		if (!account || !agreedToSui[vault.objectId]) return;
		const tx = new Transaction();
		let scoreObj = scoreObjectId ? tx.object(scoreObjectId) : tx.moveCall({ target: `${PACKAGE_ID}::credit_score::create_credit_score`, arguments: [] });

		const effectivePrice = suiPrice || 1.5;
		const totalDebt = vault.principal + vault.ujrah;
		const suiNeeded = (totalDebt / effectivePrice) * 1.01;

		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::repay_with_jaminan`,
			arguments: [
				tx.object(LENDING_POOL_ID),
				tx.object(vault.objectId),
				tx.pure.u64(BigInt(Math.floor(suiNeeded * 1_000_000_000))),
				scoreObj,
				tx.pure.u64(BigInt(Math.floor(effectivePrice * 1_000_000_000))),
				tx.object(BUCK_TREASURY_ID),
			],
		});

		if (!scoreObjectId) tx.transferObjects([scoreObj], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
                setTimeout(() => {
                    refetch(); 
                    if (onTransactionSuccess) onTransactionSuccess();
                }, 1500);
                alert('Success: Position Settled with SUI!'); 
                setAgreedToSui(prev => ({ ...prev, [vault.objectId]: false }));
            },
			onError: (err) => alert(`Error: ${err.message}`)
		});
	};

	const handleClaim = async (vaultId: string) => {
		if (!account) return;
		const tx = new Transaction();
		const [suiResult] = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::claim_jaminan`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(vaultId)],
		});
		tx.transferObjects([suiResult], tx.pure.address(account.address));
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
                setTimeout(() => {
                    refetch(); 
                    if (onTransactionSuccess) onTransactionSuccess();
                }, 1500);
                alert('Success: Collateral Claimed!'); 
            },
			onError: (err) => alert(`Error: ${err.message}`)
		});
	};

	if (vaults.length === 0) {
		return (
			<div className="p-8 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50 text-center shadow-inner">
				<p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">No active positions</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{vaults.map(vault => (
				<div key={vault.objectId} className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-all group relative">
					<div className="flex justify-between items-start mb-4 px-1">
						<div>
							<p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-1">ID: {vault.id}</p>
							<p className={`text-xl font-black ${vault.isPaidOff ? 'text-emerald-400' : 'text-white'}`}>
								{(vault.principal + vault.ujrah).toFixed(2)} <span className="text-xs opacity-40">USDB</span>
							</p>
						</div>
						<div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm ${vault.isPaidOff ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
							{vault.isPaidOff ? 'Paid Off' : 'Active'}
						</div>
					</div>

					<div className="space-y-2 mb-6 px-1">
						<div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
							<span className="text-slate-500">Locked Rahn</span>
							<span className={vault.isPaidOff ? 'text-emerald-400' : 'text-slate-300'}>{vault.collateral.toFixed(3)} SUI</span>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-3">
						{vault.isPaidOff ? (
							<button onClick={() => handleClaim(vault.objectId)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20">Claim Collateral</button>
						) : (
							<div className="space-y-3">
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={repayAmount[vault.objectId] || ''} 
                                        onChange={(e) => setRepayAmount(prev => ({ ...prev, [vault.objectId]: e.target.value }))}
                                        placeholder="Enter USDB amount"
                                        disabled={!!agreedToSui[vault.objectId]}
                                        className={`w-full p-3 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-xl outline-none font-bold text-sm transition-all ${agreedToSui[vault.objectId] ? 'opacity-30 cursor-not-allowed' : 'text-white focus:border-blue-500/50'}`} 
                                    />
                                    <span className="absolute right-3 top-3 font-bold text-slate-600 text-[10px] uppercase">USDB</span>
                                </div>

                                <label className="flex items-center gap-2 px-1 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={!!agreedToSui[vault.objectId]} 
                                        onChange={(e) => setAgreedToSui(prev => ({ ...prev, [vault.objectId]: e.target.checked }))}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 checked:bg-blue-600 transition-all"
                                    />
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-slate-400 transition-colors">Settle full debt using SUI collateral</span>
                                </label>

								<div className="flex gap-2">
									<button 
                                        onClick={() => handleRepayBUCK(vault)} 
                                        disabled={!!agreedToSui[vault.objectId]}
                                        className={`flex-1 py-3 font-bold rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-widest ${agreedToSui[vault.objectId] ? 'bg-slate-800 text-slate-600 opacity-50' : 'bg-slate-200 hover:bg-white text-slate-900'}`}
                                    >
                                        Pay USDB
                                    </button>
									<button 
                                        onClick={() => handleRepayWithSui(vault)} 
                                        disabled={!agreedToSui[vault.objectId]}
                                        className={`flex-1 py-3 font-bold rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-widest border ${agreedToSui[vault.objectId] ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 border-blue-500' : 'bg-slate-700 text-slate-500 border-slate-600 opacity-50 cursor-not-allowed'}`}
                                    >
                                        Repay SUI
                                    </button>
								</div>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}