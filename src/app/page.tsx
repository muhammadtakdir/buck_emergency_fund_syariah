import Link from 'next/link';

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 overflow-hidden relative">
			{/* Decorative Elements */}
			<div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

			<div className="max-w-4xl text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
				<div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
					🌙 Sharia-Compliant DeFi on Sui
				</div>
				<h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
					BUCK <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Emergency Fund</span>
				</h1>
				<p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
					Instant BUCK liquidity for your CDP using the ethical <strong>Waqf & Ujrah</strong> system. 
					Growth, sustainability, and happiness for borrowers and lenders.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
					<Link 
						href="/dashboard" 
						className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95"
					>
						Open Dashboard
					</Link>
					<a 
						href="https://github.com/your-username/buck-emergency-fund" 
						target="_blank"
						className="px-10 py-4 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
					>
						Read Documentation
					</a>
				</div>
			</div>
			
			<div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
				<div className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
					<div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 className="text-2xl font-bold mb-3 text-white">Ujrah (Service Fee)</h3>
					<p className="text-slate-400 text-sm leading-relaxed">
						Fair service fees for platform usage. No riba (interest), just transparent upfront costs for the community's growth.
					</p>
				</div>
				<div className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
					<div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
					</div>
					<h3 className="text-2xl font-bold mb-3 text-white">Waqf (Endowment)</h3>
					<p className="text-slate-400 text-sm leading-relaxed">
						A portion of every fee builds a permanent system-owned endowment. The protocol grows more independent every day.
					</p>
				</div>
				<div className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
					<div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<h3 className="text-2xl font-bold mb-3 text-white">Musharakah (Partnership)</h3>
					<p className="text-slate-400 text-sm leading-relaxed">
						Lenders act as partners, sharing in the pool's growth. Real economic rewards generated through community utility.
					</p>
				</div>
			</div>
		</main>
	);
}
