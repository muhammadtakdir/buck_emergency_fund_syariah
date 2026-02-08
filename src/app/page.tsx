import Link from 'next/link';

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 overflow-hidden relative">
			{/* Decorative Elements */}
			<div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

			<div className="max-w-4xl text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
				<div className="flex justify-center mb-4">
					<img src="/befs_logo.png" alt="BEFS Logo" className="w-24 h-24 rounded-2xl shadow-2xl shadow-emerald-500/20 border border-white/10" />
				</div>
				<div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
					🌙 Independent Sharia DeFi on Sui
				</div>
				<h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
					BUCK <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Emergency Fund</span>
				</h1>
				<p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
					Instant BUCK liquidity for Bottle holders using the ethical <strong>Waqf & Ujrah</strong> system. 
					Zero interest, zero stress, and up to 2 years repayment.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
					<Link 
						href="/dashboard" 
						className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95"
					>
						Launch App
					</Link>
					<a 
						href="#features" 
						className="px-10 py-4 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
					>
						Learn Why Choose Us
					</a>
				</div>
			</div>
			
			{/* Feature Cards */}
			<div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
				<div className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
					<div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					</div>
					<h3 className="text-2xl font-bold mb-3 text-white">Fixed Ujrah (Service Fee)</h3>
					<p className="text-slate-400 text-sm leading-relaxed">
						Stop worrying about accumulating interest. Agree on a fixed service fee upfront. No hidden costs, no riba, no matter when you repay.
					</p>
				</div>
				<div className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
					<div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
					</div>
					<h3 className="text-2xl font-bold mb-3 text-white">Up to 24 Months Term</h3>
					<p className="text-slate-400 text-sm leading-relaxed">
						Flexibility for your needs. Choose a repayment term from 1 to 24 months. We value your long-term financial stability.
					</p>
				</div>
				<div className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
					<div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04 Pelajari 0 00-1.815 9.037 11.952 11.955 0 00-8.185 5.974 11.952 11.952 0 008.185 5.974 11.955 11.955 0 018.618 3.04 11.955 11.955 0 018.618-3.04 11.952 11.952 0 008.185-5.974 11.955 11.955 0 00-8.185-5.974z" /></svg>
					</div>
					<h3 className="text-2xl font-bold mb-3 text-white">Collateral Pay (Rahn)</h3>
					<p className="text-slate-400 text-sm leading-relaxed">
						Out of cash? Settle your debt using your SUI collateral at current market prices. We ensure you get your remaining SUI back fairly.
					</p>
				</div>
			</div>

			{/* Why Us Detail Section */}
			<div className="mt-32 max-w-4xl w-full space-y-16 pb-32 relative z-10">
				<div className="text-center">
					<h2 className="text-4xl font-black mb-4">Why users love BEFS?</h2>
					<p className="text-slate-500">The most ethical way to unlock liquidity on Sui.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
					<div className="space-y-4">
						<h4 className="text-xl font-bold text-blue-400">1. Keep your Upside</h4>
						<p className="text-slate-400 text-sm">Don't sell your SUI at a low price just because you need cash. Lock it, get BUCK, and get your SUI back when the market rallies. You own the growth.</p>
					</div>
					<div className="space-y-4">
						<h4 className="text-xl font-bold text-emerald-400">2. $0.70 Price Floor</h4>
						<p className="text-slate-400 text-sm">We value your Collateral (Rahn) at a conservative $0.70 floor. This gives you a massive safety buffer against market crashes, making your vault ultra-secure.</p>
					</div>
					<div className="space-y-4">
						<h4 className="text-xl font-bold text-purple-400">3. Waqf Sustainability</h4>
						<p className="text-slate-400 text-sm">40% of fees build a permanent system-owned endowment. You're not just borrowing; you're helping build a self-funding Islamic finance future.</p>
					</div>
					<div className="space-y-4">
						<h4 className="text-xl font-bold text-orange-400">4. Fair Settle Policy</h4>
						<p className="text-slate-400 text-sm">If your term expires, we don't just "take" your Collateral (Rahn). We automatically use only what's needed to pay the debt and return the Remainder (Baqiyah) to you.</p>
					</div>
				</div>
			</div>

			<footer className="mt-32 py-16 text-center border-t border-slate-800/50 w-full max-w-6xl relative z-10">
				<p className="text-xs font-bold text-slate-600 uppercase tracking-[0.8em] mb-6">BUCK Emergency Fund Sharia</p>
				<div className="flex justify-center gap-6">
					<a href="https://twitter.com/educhainmag" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.904 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
						@educhainmag
					</a>
				</div>
			</footer>
		</main>
	);
}