'use client';

import { useState } from 'react';
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { CDPHealthCard } from '@/components/CDPHealthCard';
import { EmergencyForm } from '@/components/EmergencyForm';
import { LoanCard } from '@/components/LoanCard';
import { CreditScore } from '@/components/CreditScore';
import { MusharakahPool } from '@/components/MusharakahPool';
import { BUCK_COIN_TYPE, LENDING_POOL_ID, LP_COIN_TYPE } from '@/lib/sui-client';

export default function Dashboard() {
	const account = useCurrentAccount();
	const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');

	// Wallet Balances
	const { data: suiBalanceData } = useSuiClientQuery('getCoins', { owner: account?.address || '', coinType: '0x2::sui::SUI' }, { enabled: !!account });
	const { data: buckBalanceData } = useSuiClientQuery('getCoins', { owner: account?.address || '', coinType: BUCK_COIN_TYPE }, { enabled: !!account });
	const { data: lpBalanceData } = useSuiClientQuery('getCoins', { owner: account?.address || '', coinType: LP_COIN_TYPE }, { enabled: !!account });

	// Pool Data
	const { data: poolObject } = useSuiClientQuery('getObject', { id: LENDING_POOL_ID, options: { showContent: true } });

	const totalSui = Number(suiBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	const totalBuck = Number(buckBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	const totalLP = Number(lpBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	
	const maxBuckPotential = (totalSui * 0.70) / 1.5;

	// Stats from Pool Fields
	const poolFields = (poolObject?.data?.content as any)?.fields;
	const cashReserve = poolFields ? Number(poolFields.buck_reserve) / 1_000_000_000 : 0;
	const stakedInBucket = poolFields ? Number(poolFields.susdb_balance) / 1_000_000_000 : 0;
	const suiRewards = poolFields ? Number(poolFields.sui_reserve) / 1_000_000_000 : 0;
	const waqfAmount = poolFields ? Number(poolFields.waqf_reserve) / 1_000_000_000 : 0;
	const protocolTotalSuiLocked = poolFields ? Number(poolFields.total_sui_locked) / 1_000_000_000 : 0;

	return (
		<main className="min-h-screen p-4 md:p-8 bg-[#f8fafc]">
			<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
				<div className="flex items-center gap-4">
					<img src="/befs_logo.png" alt="Logo" className="w-12 h-12 rounded-xl border border-slate-200 shadow-sm" />
					<div>
						<div className="flex items-center gap-3 mb-1">
							<h1 className="text-3xl font-black text-slate-900 tracking-tight">BUCK</h1>
							<div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
								Independent Sharia
							</div>
						</div>
						<p className="text-slate-500 font-medium text-xs">Integrated with Bucket Protocol Saving Pool</p>
					</div>
				</div>
				<ConnectButton />
			</header>

			{!account ? (
				<div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-[2rem] border border-slate-200 shadow-sm">
					<h2 className="text-xl font-bold text-slate-900 mb-6">Connect to Begin</h2>
					<ConnectButton />
				</div>
			) : (
				<div className="space-y-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
						<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
							<p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Wallet SUI</p>
							<p className="text-2xl font-black text-slate-900">{totalSui.toFixed(3)}</p>
						</div>
						<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
							<p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Wallet BUCK</p>
							<p className="text-2xl font-black text-slate-900">{totalBuck.toFixed(2)}</p>
						</div>
						<div className="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-900/10 text-white">
							<p className="text-[10px] text-blue-200 font-black uppercase mb-1 tracking-widest">Your LP Shares</p>
							<p className="text-2xl font-black">{totalLP.toFixed(2)} <span className="text-xs font-bold text-blue-200">lpBUCK</span></p>
						</div>
						<div className="p-6 bg-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 text-white">
							<p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">System Status</p>
							<p className="text-2xl font-black text-emerald-400 tracking-tight">Active</p>
						</div>
					</div>

					<div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-full sm:w-fit">
						<button onClick={() => setActiveTab('borrow')} className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'borrow' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Borrower</button>
						<button onClick={() => setActiveTab('lend')} className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'lend' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-50'}`}>Lender (Partnership)</button>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-8 space-y-8">
							{activeTab === 'borrow' ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<EmergencyForm />
									<CreditScore />
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
									<MusharakahPool />
									<div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl flex flex-col justify-center">
										<h3 className="text-2xl font-bold mb-6">Pool Performance</h3>
										<div className="space-y-6">
											<div>
												<p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Staked in Bucket</p>
												<p className="text-3xl font-black">{stakedInBucket.toLocaleString()} <span className="text-sm">sUSDB</span></p>
											</div>
											<div>
												<p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Unclaimed SUI Rewards</p>
												<p className="text-3xl font-black text-emerald-300">{suiRewards.toFixed(4)} <span className="text-sm">SUI</span></p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						<aside className="lg:col-span-4 space-y-6">
							<h2 className="text-xl font-bold text-slate-900 tracking-tight">Live Global Stats</h2>
							<div className="space-y-4">
								<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
									<p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">System Waqf</p>
									<p className="text-2xl font-black text-slate-900">{waqfAmount.toFixed(2)} <span className="text-xs text-slate-300">LP Units</span></p>
								</div>
								<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
									<p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Total SUI Locked (TVL)</p>
									<p className="text-2xl font-black text-slate-900">{protocolTotalSuiLocked.toFixed(3)} SUI</p>
								</div>
								<div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
									<p className="text-[10px] text-emerald-600 font-bold uppercase mb-2 tracking-widest">Cash Reserve</p>
									<p className="text-2xl font-black text-emerald-900">{cashReserve.toFixed(2)} BUCK</p>
								</div>
							</div>
							<LoanCard />
						</aside>
					</div>
				</div>
			)}
		</main>
	);
}