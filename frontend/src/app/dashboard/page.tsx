'use client';

import { useState } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { CDPHealthCard } from '@/components/CDPHealthCard';
import { EmergencyForm } from '@/components/EmergencyForm';
import { LoanCard } from '@/components/LoanCard';
import { CreditScore } from '@/components/CreditScore';
import { MusharakahPool } from '@/components/MusharakahPool';

export default function Dashboard() {
	const account = useCurrentAccount();
	const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');

	return (
		<main className="min-h-screen p-4 md:p-8 bg-[#f8fafc]">
			<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">BUCK</h1>
						<span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">Emergency Fund</span>
					</div>
					<p className="text-slate-500 font-medium">Decentralized Sharia-Compliant Liquidity</p>
				</div>
				<div className="flex items-center gap-4 w-full sm:w-auto">
					<ConnectButton />
				</div>
			</header>

			{!account ? (
				<div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border border-slate-200 shadow-sm transition-all animate-in fade-in zoom-in duration-500">
					<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
						<svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">Wallet Disconnected</h2>
					<p className="text-slate-500 mb-6 text-center max-w-xs">Connect your Sui wallet to manage your vault or provide liquidity.</p>
					<ConnectButton />
				</div>
			) : (
				<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
							Lender (Musharakah)
						</button>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-8 space-y-8">
							{activeTab === 'borrow' ? (
								<>
									<CDPHealthCard />
									<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
										<EmergencyForm />
										<CreditScore />
									</div>
								</>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
									<MusharakahPool />
									<div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl flex flex-col justify-center">
										<h3 className="text-2xl font-bold mb-4">Why be a Partner?</h3>
										<ul className="space-y-4 text-emerald-50">
											<li className="flex items-start gap-3">
												<div className="mt-1 bg-white/20 p-1 rounded-full">
													<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
												</div>
												<p>Earn 40% of all platform service fees distributed proportionally.</p>
											</li>
											<li className="flex items-start gap-3">
												<div className="mt-1 bg-white/20 p-1 rounded-full">
													<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
												</div>
												<p>Support the community by providing interest-free liquidity.</p>
											</li>
											<li className="flex items-start gap-3">
												<div className="mt-1 bg-white/20 p-1 rounded-full">
													<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
												</div>
												<p>Participate in the growth of the system-owned Waqf fund.</p>
											</li>
										</ul>
									</div>
								</div>
							)}
						</div>

						<aside className="lg:col-span-4 space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold text-slate-900">Active Records</h2>
								<span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Update Live</span>
							</div>
							<LoanCard />
							
							{/* Mini Waqf Stat */}
							<div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
								<p className="text-xs text-slate-400 font-bold uppercase mb-2">Total System Waqf</p>
								<div className="flex items-end gap-2">
									<span className="text-3xl font-black text-slate-900">42,500</span>
									<span className="text-sm font-bold text-slate-400 mb-1">BUCK</span>
								</div>
								<div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
									<div className="bg-emerald-500 h-full w-[65%]" />
								</div>
								<p className="text-[10px] text-slate-400 mt-2 italic">Growing by 40% of every transaction fee.</p>
							</div>
						</aside>
					</div>
				</div>
			)}
		</main>
	);
}