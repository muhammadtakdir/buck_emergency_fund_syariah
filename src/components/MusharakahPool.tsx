'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID, BUCK_TREASURY_ID, BUCK_COIN_TYPE, SAVING_POOL_ID, LP_COIN_TYPE } from '@/lib/sui-client';

interface Props {
    onTransactionSuccess?: () => void;
}

export function MusharakahPool({ onTransactionSuccess }: Props) {
	const [amount, setAmount] = useState<string>('');
	const [withdrawAmount, setWithdrawAmount] = useState<string>('');
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const account = useCurrentAccount();
	const suiClient = useSuiClient();

	// Fetch Live USDB Balance
	const { data: buckBalanceData, refetch: refetchBuck } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: BUCK_COIN_TYPE
	}, { enabled: !!account });

	// Fetch Live LP Shares
	const { data: lpBalanceData, refetch: refetchLP } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: LP_COIN_TYPE
	}, { enabled: !!account });

	const totalBuckRaw = buckBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n;
	const totalLpRaw = lpBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n;

    const totalBuckNum = Number(totalBuckRaw) / 1_000_000_000;
    const totalLpNum = Number(totalLpRaw) / 1_000_000_000;

    const displayBuck = totalBuckNum > 0 && totalBuckNum < 0.01 ? totalBuckNum.toFixed(6) : totalBuckNum.toFixed(2);
    const displayLp = totalLpNum > 0 && totalLpNum < 0.01 ? totalLpNum.toFixed(6) : totalLpNum.toFixed(2);

	// FAUCET: Request free USDB
	const handleFaucet = async () => {
		if (!account) return;
		const tx = new Transaction();
		const [usdbCoin] = tx.moveCall({
			target: `${PACKAGE_ID}::usdb::mint`,
			arguments: [tx.object(BUCK_TREASURY_ID), tx.pure.u64(BigInt(1 * 1_000_000_000))],
		});
		tx.transferObjects([usdbCoin], tx.pure.address(account.address));
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
                setTimeout(() => { refetchBuck(); if (onTransactionSuccess) onTransactionSuccess(); }, 1500); 
                alert('Success: 1 Test USDB obtained!'); 
            },
			onError: (err) => alert('Faucet Error: ' + err.message)
		});
	};

	const handleDeposit = async () => {
		if (!account) return;
		
		const coins = await suiClient.getCoins({ owner: account.address, coinType: BUCK_COIN_TYPE });
		if (coins.data.length === 0) return alert("You don't have any USDB. Please use the Faucet first!");

		const tx = new Transaction();
		const coinIds = coins.data.map(c => c.coinObjectId);
		if (coinIds.length > 1) tx.mergeCoins(tx.object(coinIds[0]), coinIds.slice(1).map(id => tx.object(id)));
		
        const depositAmountRaw = amount 
            ? BigInt(Math.floor(Number(amount) * 1_000_000_000)) 
            : totalBuckRaw;

        if (depositAmountRaw <= 0n) return alert("Enter valid amount");

		const [usdbToSpend] = tx.splitCoins(tx.object(coinIds[0]), [tx.pure.u64(depositAmountRaw)]);

		const [lpToken] = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::provide_liquidity`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(SAVING_POOL_ID), usdbToSpend],
		});

		tx.transferObjects([lpToken], tx.pure.address(account.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
				setTimeout(() => { 
                    refetchBuck(); 
                    refetchLP(); 
                    if (onTransactionSuccess) onTransactionSuccess();
                }, 1500); 
				alert('Success: USDB deposited!'); 
                setAmount('');
			},
			onError: (err: Error) => alert('Deposit Failed: ' + err.message)
		});
	};

	const handleWithdraw = async () => {
		if (!account) return;
		
		const lpCoins = await suiClient.getCoins({ owner: account.address, coinType: LP_COIN_TYPE });
		if (lpCoins.data.length === 0) return alert("No LP shares found!");

		const tx = new Transaction();
		const coinIds = lpCoins.data.map(c => c.coinObjectId);
		if (coinIds.length > 1) tx.mergeCoins(tx.object(coinIds[0]), coinIds.slice(1).map(id => tx.object(id)));
		
        const burnAmountRaw = withdrawAmount 
            ? BigInt(Math.floor(Number(withdrawAmount) * 1_000_000_000)) 
            : totalLpRaw;

        if (burnAmountRaw <= 0n) return alert("Enter valid amount");

		const [lpToBurn] = tx.splitCoins(tx.object(coinIds[0]), [tx.pure.u64(burnAmountRaw)]);

		const [usdbResult, suiResult] = tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::remove_liquidity`,
			arguments: [tx.object(LENDING_POOL_ID), tx.object(SAVING_POOL_ID), lpToBurn],
		});

		tx.transferObjects([usdbResult, suiResult], tx.pure.address(account.address));
		
		signAndExecute({ transaction: tx }, {
			onSuccess: () => { 
                setTimeout(() => { 
                    refetchBuck(); 
                    refetchLP(); 
                    if (onTransactionSuccess) onTransactionSuccess();
                }, 1500); 
                alert('Success: Withdrawn!'); 
                setWithdrawAmount('');
            },
			onError: (err: Error) => alert('Withdraw Failed: ' + err.message)
		});
	};

	return (
		<div className="space-y-6 h-full">
			<div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-sm flex flex-col transition-all h-[calc(50%-12px)]">
				<div className="flex justify-between items-start mb-6">
					<div>
						<h3 className="text-lg font-bold text-white tracking-tight uppercase">Stable Musharakah</h3>
						<p className="text-xs text-slate-500 font-medium mt-1">Provide USDB to earn yield</p>
					</div>
					<button onClick={handleFaucet} className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Faucet</button>
				</div>

				<div className="space-y-4 flex-grow justify-center flex flex-col">
                    <div>
                        <div className="flex justify-between mb-2 px-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                            <span className="text-[10px] font-bold text-emerald-500/60">Balance: {displayBuck} USDB</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                placeholder="Enter amount (Empty for ALL)" 
                                className="w-full p-4 pr-16 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-emerald-500/50 outline-none font-bold text-white text-lg transition-all" 
                            />
                            <span className="absolute right-4 top-4 font-bold text-slate-600 text-sm">USDB</span>
                        </div>
                    </div>
					<button onClick={handleDeposit} disabled={!account} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-30 text-xs uppercase tracking-widest mt-4">Confirm Supply</button>
				</div>
			</div>

			<div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-sm flex flex-col transition-all h-[calc(50%-12px)]">
				<div className="mb-6">
					<h3 className="text-lg font-bold text-white tracking-tight uppercase">Claim & Unstake</h3>
					<p className="text-xs text-slate-500 font-medium mt-1">Receive principal + rewards</p>
				</div>

				<div className="space-y-4 flex-grow justify-center flex flex-col">
                    <div>
                        <div className="flex justify-between mb-2 px-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Burn LP</label>
                            <span className="text-[10px] font-bold text-blue-500/60">Available: {displayLp} lpUSDB</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={withdrawAmount} 
                                onChange={(e) => setWithdrawAmount(e.target.value)} 
                                placeholder="Enter amount (Empty for ALL)" 
                                className="w-full p-4 pr-20 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-blue-500/50 outline-none font-bold text-white text-lg transition-all" 
                            />
                            <span className="absolute right-4 top-4 font-bold text-slate-600 text-sm uppercase">lpUSDB</span>
                        </div>
                    </div>
					<button onClick={handleWithdraw} disabled={!account} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-30 text-xs uppercase tracking-widest mt-4">Withdraw All</button>
				</div>
			</div>
		</div>
	);
}
