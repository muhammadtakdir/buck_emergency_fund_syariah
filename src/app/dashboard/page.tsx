'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { EmergencyForm } from '@/components/EmergencyForm';
import { LoanCard } from '@/components/LoanCard';
import { CreditScore } from '@/components/CreditScore';
import { MusharakahPool } from '@/components/MusharakahPool';
import { BUCK_COIN_TYPE, LENDING_POOL_ID, LP_COIN_TYPE } from '@/lib/sui-client';

export default function Dashboard() {
	const account = useCurrentAccount();
	const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshData = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

	// Wallet Balances
	const { data: suiBalanceData, refetch: refetchSui } = useSuiClientQuery('getCoins', { owner: account?.address || '', coinType: '0x2::sui::SUI' }, { enabled: !!account });
	const { data: buckBalanceData, refetch: refetchBuck } = useSuiClientQuery('getCoins', { owner: account?.address || '', coinType: BUCK_COIN_TYPE }, { enabled: !!account });
	const { data: lpBalanceData, refetch: refetchLp } = useSuiClientQuery('getCoins', { owner: account?.address || '', coinType: LP_COIN_TYPE }, { enabled: !!account });

	// Pool Data
	const { data: poolObject, refetch: refetchPool } = useSuiClientQuery('getObject', { id: LENDING_POOL_ID, options: { showContent: true } });

    // Refresh effect
    useEffect(() => {
        if (account) {
            refetchSui();
            refetchBuck();
            refetchLp();
            refetchPool();
        }
    }, [refreshTrigger, account, refetchSui, refetchBuck, refetchLp, refetchPool]);

    // Background polling
    useEffect(() => {
        const interval = setInterval(() => refetchPool(), 10000);
        return () => clearInterval(interval);
    }, [refetchPool]);

	const totalSui = Number(suiBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	const totalBuck = Number(buckBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	const totalLP = Number(lpBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	
	const poolFields = (poolObject?.data?.content as any)?.fields;
	
	const getBal = (f: any) => {
		if (!f) return 0;
		if (typeof f === 'string' || typeof f === 'number') return Number(f);
		if (f.fields && f.fields.value) return Number(f.fields.value);
		if (f.value) return Number(f.value);
		return 0;
	};

	const cashReserve = poolFields ? getBal(poolFields.usdb_reserve) / 1_000_000_000 : 0;
	const stakedInBucket = poolFields ? getBal(poolFields.susdb_reserve) / 1_000_000_000 : 0;
	const suiRewards = poolFields ? getBal(poolFields.sui_reserve) / 1_000_000_000 : 0;
	const waqfAmount = poolFields ? getBal(poolFields.waqf_reserve) / 1_000_000_000 : 0;
	const maintenanceAmount = poolFields ? getBal(poolFields.maintenance_balance) / 1_000_000_000 : 0;
	const protocolTotalSuiLocked = poolFields ? getBal(poolFields.total_sui_locked) / 1_000_000_000 : 0;

    const totalLiquidity = cashReserve + stakedInBucket;

	return (
		<main className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

			<header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 px-6 py-4 mb-8">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<div className="flex items-center gap-3">
						<img src="/befs_logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
						<div>
							<h1 className="text-xl font-black text-white tracking-tighter">BEFS</h1>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Buck Emergency Fund Sharia</p>
						</div>
					</div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
                            <button onClick={() => setActiveTab('borrow')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'borrow' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-200'}`}>Borrower</button>
                            <button onClick={() => setActiveTab('lend')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'lend' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-slate-200'}`}>Lender</button>
                        </div>
				        <ConnectButton />
                    </div>
				</div>
			</header>

			{!account ? (
				<div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh] bg-slate-800/30 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
					<div className="text-6xl mb-8 opacity-50">🔐</div>
					<h2 className="text-3xl font-bold text-white mb-4">Connect Wallet</h2>
					<p className="text-slate-400 mb-8 text-center max-w-sm">Access the Sharia-compliant stable liquidity protocol on Sui.</p>
					<ConnectButton />
				</div>
			) : (
				<div className="max-w-7xl mx-auto px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
					{/* Roadmap Banner */}
					<div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="flex items-center gap-3">
							<span className="flex h-3 w-3 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
							</span>
							<p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
								Stage 1: Sui Testnet
							</p>
						</div>
						<p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight text-center md:text-left">
							Roadmap: <span className="text-white">Mainnet Launch</span> will feature full <span className="text-blue-400">Bucket Protocol</span> integration for Dual Rewards.
						</p>
						<a href="https://twitter.com/educhainmag" target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest">
							Follow Updates
						</a>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800/60">
							<p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Wallet SUI</p>
							<p className="text-xl font-black text-white">{totalSui.toFixed(4)}</p>
						</div>
						<div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800/60">
							<p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Wallet USDB</p>
							<p className="text-xl font-black text-white">{totalBuck.toFixed(4)}</p>
						</div>
						<div className="p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-sm transition-all hover:bg-blue-600/20">
							<p className="text-[10px] text-blue-400 font-bold uppercase mb-1 tracking-widest">Your LP Shares</p>
							<p className="text-xl font-black text-blue-400">{totalLP.toFixed(4)} <span className="text-xs opacity-60">lp</span></p>
						</div>
						<div className="p-5 bg-emerald-600/10 rounded-2xl border border-emerald-500/20 shadow-sm transition-all hover:bg-emerald-600/20">
							<p className="text-[10px] text-emerald-400 font-bold uppercase mb-1 tracking-widest">System Status</p>
							<p className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Active</p>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						<div className="lg:col-span-8 space-y-8">
							{activeTab === 'borrow' ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<EmergencyForm onTransactionSuccess={refreshData} />
                                    <div className="space-y-8">
									    <CreditScore refreshTrigger={refreshTrigger} />
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">My Active Positions</h3>
                                            <LoanCard refreshTrigger={refreshTrigger} onTransactionSuccess={refreshData} />
                                        </div>
                                    </div>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<MusharakahPool onTransactionSuccess={refreshData} />
									<div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col justify-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
										<h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Pool Performance</h3>
										<div className="space-y-8">
											<div>
												<p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 leading-none">Staked in Bucket</p>
												<p className="text-3xl font-black text-white">{stakedInBucket.toFixed(4)} <span className="text-sm font-bold text-slate-500 uppercase">sUSDB</span></p>
											</div>
											<div>
												<p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 leading-none">Unclaimed SUI Rewards</p>
												<p className="text-3xl font-black text-emerald-400 tracking-tighter">{suiRewards.toFixed(4)} <span className="text-sm font-bold text-slate-500 uppercase">SUI</span></p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						<aside className="lg:col-span-4 space-y-8">
							<div className="space-y-4">
                                <h2 className="text-sm font-black text-slate-400 tracking-[0.3em] uppercase px-2">Global Overview</h2>
								<div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 shadow-sm relative group">
									<p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">System Waqf Reserve</p>
									<p className="text-2xl font-black text-white">{waqfAmount.toFixed(4)} <span className="text-xs text-slate-500 font-bold">LP</span></p>
                                    <div className="absolute hidden group-hover:block top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg text-[9px] text-slate-400 z-50 shadow-2xl">
                                        Funded from 40% of collected Ujrah (Service Fees).
                                    </div>
								</div>
								<div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 shadow-sm">
									<p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Total SUI Locked</p>
									<p className="text-2xl font-black text-white">{protocolTotalSuiLocked.toFixed(4)} <span className="text-xs text-slate-500 font-bold uppercase">SUI</span></p>
								</div>
								<div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 shadow-sm">
									<p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">USDB Reserve</p>
									<p className="text-2xl font-black text-white">{cashReserve.toFixed(4)} <span className="text-xs text-slate-500 font-bold uppercase">USDB</span></p>
								</div>
								<div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 shadow-sm">
									<p className="text-[10px] text-emerald-400 font-bold uppercase mb-2 tracking-widest">Protocol Liquidity</p>
									<p className="text-2xl font-black text-emerald-400">{totalLiquidity.toFixed(4)} <span className="text-xs text-emerald-600 font-bold uppercase">USDB</span></p>
								</div>
                                <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 shadow-sm">
									<p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Operation Fund</p>
									<p className="text-2xl font-black text-white">{maintenanceAmount.toFixed(4)} <span className="text-xs text-slate-500 font-bold uppercase">USDB</span></p>
								</div>
							</div>
						</aside>
					</div>
				</div>
			)}
			
			<footer className="mt-20 py-12 text-center border-t border-slate-800/50">
				<p className="text-xs font-bold text-slate-600 uppercase tracking-[0.8em]">BUCK Emergency Fund Sharia</p>
			</footer>
		</main>
	);
}
