'use client';

import { useState } from 'react';
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { CDPHealthCard } from '@/components/CDPHealthCard';
import { EmergencyForm } from '@/components/EmergencyForm';
import { LoanCard } from '@/components/LoanCard';
import { CreditScore } from '@/components/CreditScore';
import { MusharakahPool } from '@/components/MusharakahPool';
import { BUCK_COIN_TYPE, LENDING_POOL_ID } from '@/lib/sui-client';

export default function Dashboard() {
	const account = useCurrentAccount();
	const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');

	// Fetch Wallet SUI Balance
	const { data: suiBalanceData } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: '0x2::sui::SUI'
	}, { enabled: !!account });

	// Fetch Wallet BUCK Balance
	const { data: buckBalanceData } = useSuiClientQuery('getCoins', {
		owner: account?.address || '',
		coinType: BUCK_COIN_TYPE
	}, { enabled: !!account });

	// Fetch Lending Pool Shared Object Data
	const { data: poolObject } = useSuiClientQuery('getObject', {
		id: LENDING_POOL_ID,
		options: { showContent: true }
	});

	const totalSui = Number(suiBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	const totalBuck = Number(buckBalanceData?.data.reduce((acc, coin) => acc + BigInt(coin.balance), 0n) || 0n) / 1_000_000_000;
	
	const maxBuckPotential = (totalSui * 0.70) / 1.5;

	// FIX: Correct available liquidity math (Reserve + Staked)
	const poolFields = (poolObject?.data?.content as any)?.fields;
	const availableLiquidity = poolFields 
		? (Number(poolFields.buck_reserve) + Number(poolFields.susdb_balance)) / 1_000_000_000 
		: 0;
	
	const waqfAmount = poolFields ? Number(poolFields.waqf_reserve) / 1_000_000_000 : 0;
	const protocolTotalSuiLocked = poolFields ? Number(poolFields.total_sui_locked) / 1_000_000_000 : 0;

	return (
		<main className="min-h-screen p-4 md:p-8 bg-[#f8fafc]">
			<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
				<div className="flex items-center gap-4">
					<img src="/befs_logo.png" alt="Logo" className="w-12 h-12 rounded-xl border border-slate-200" />
					<div>
						<div className="flex items-center gap-3 mb-1">
							<h1 className="text-3xl font-black text-slate-900 tracking-tight">BUCK</h1>
							<div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
								Independent Sharia (Ethical)
							</div>
						</div>
						<p className="text-slate-500 font-medium text-sm">Decentralized Riba-Free Liquidity Protocol</p>
					</div>
				</div>
				<ConnectButton />
			</header>

			{!account ? (
				<div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-500">
					<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
						<svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">Access Locked</h2>
					<p className="text-slate-500 mb-6 text-center max-w-xs">Connect your Sui wallet to view your balances and Sharia borrowing capacity.</p>
					<ConnectButton />
				</div>
			) : (
				<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
					{/* Live Dynamic Insight Bar */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
							<p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Available SUI</p>
							<p className="text-2xl font-black text-slate-900">{totalSui.toFixed(3)} <span className="text-sm font-bold text-slate-200">SUI</span></p>
						</div>
						<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
							<p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Available BUCK</p>
							<p className="text-2xl font-black text-slate-900">{totalBuck.toFixed(2)} <span className="text-sm font-bold text-slate-200">BUCK</span></p>
						</div>
						<div className="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-900/10 text-white group">
							<p className="text-[10px] text-blue-200 font-black uppercase mb-1 tracking-widest text-opacity-80 group-hover:text-white transition-colors">Max Borrow Potential</p>
							<p className="text-2xl font-black">{maxBuckPotential.toFixed(2)} <span className="text-sm font-bold text-blue-200">BUCK</span></p>
						</div>
						<div className="p-6 bg-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 text-white">
							<p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Protocol Capacity</p>
							<p className="text-2xl font-black text-emerald-400 tracking-tight">{availableLiquidity.toLocaleString()} <span className="text-sm font-bold text-slate-500">BUCK</span></p>
						</div>
					</div>

					{/* Role Switcher */}
					<div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-full sm:w-fit backdrop-blur-sm">
						<button 
							onClick={() => setActiveTab('borrow')}
							className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'borrow' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
						>
							Borrower
						</button>
						<button 
							onClick={() => setActiveTab('lend')}
							className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'lend' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' : 'text-slate-500 hover:text-slate-700'}`}
						>
							Lender (Partnership)
						</button>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-8 space-y-8">
							{activeTab === 'borrow' ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<EmergencyForm />
									<div className="space-y-8">
										<CreditScore />
										<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
											<h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider">Independence Note</h4>
											<p className="text-xs text-slate-500 leading-relaxed italic">
												The protocol is autonomous. Developers hold only a <strong>MaintenanceCap</strong> to withdraw the designated 20% service fee. Your SUI collateral is protected by immutable smart contract logic.
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
									<MusharakahPool />
									<div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl flex flex-col justify-center">
										<h3 className="text-2xl font-bold mb-4">Partner Sharing</h3>
										<ul className="space-y-4 text-emerald-50 text-sm">
											<li className="flex items-start gap-3">
												<div className="mt-1 bg-white/20 p-1 rounded-full"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
												<p>Earn 40% of all platform service fees (Ujrah) proportionally.</p>
											</li>
											<li className="flex items-start gap-3">
												<div className="mt-1 bg-white/20 p-1 rounded-full"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
												<p>System Waqf ensures long-term sustainability without external dependency.</p>
											</li>
										</ul>
									</div>
								</div>
							)}
						</div>

						<aside className="lg:col-span-4 space-y-6">
							<h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Records</h2>
							<LoanCard />
							
							{/* Stats Sidebar */}
							<div className="space-y-4">
								<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group">
									<p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Total System Waqf (Endowment)</p>
									<div className="flex items-end gap-2">
										<span className="text-3xl font-black text-slate-900 transition-colors group-hover:text-emerald-600">{waqfAmount.toFixed(2)}</span>
										<span className="text-xs font-bold text-slate-300 mb-1">LP BUCK Units</span>
									</div>
									<p className="text-[10px] text-emerald-500 mt-2 font-bold italic">Community endowment, protocol managed.</p>
								</div>

								<div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group">
									<p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">Total SUI Locked (Collateral)</p>
									<div className="flex items-end gap-2">
										<span className="text-3xl font-black text-slate-900 transition-colors group-hover:text-blue-600">{protocolTotalSuiLocked.toFixed(3)}</span>
										<span className="text-xs font-bold text-slate-300 mb-1">SUI</span>
									</div>
									<p className="text-[10px] text-blue-500 mt-2 font-bold italic">Safe community-backed collateral.</p>
								</div>
							</div>
						</aside>
					</div>
				</div>
			)}
		</main>
	);
}
