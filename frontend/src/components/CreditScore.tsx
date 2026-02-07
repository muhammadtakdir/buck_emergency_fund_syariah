'use client';

export function CreditScore() {
	const mockData = {
		score: 780,
		tier: 4,
		tierName: 'Muttaqin', // Sharia-themed tier name example
		discount: 3,
	};

	return (
		<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
			<h3 className="text-lg font-bold text-slate-900 mb-6">Ethical Credit Score</h3>
			<div className="flex-grow flex flex-col items-center justify-center">
				<div className="relative flex items-center justify-center">
					{/* Progress Circle Visual */}
					<svg className="w-40 h-40 transform -rotate-90">
						<circle
							cx="80"
							cy="80"
							r="70"
							stroke="currentColor"
							strokeWidth="8"
							fill="transparent"
							className="text-slate-100"
						/>
						<circle
							cx="80"
							cy="80"
							r="70"
							stroke="currentColor"
							strokeWidth="8"
							fill="transparent"
							strokeDasharray={440}
							strokeDashoffset={440 - (440 * mockData.score) / 1000}
							strokeLinecap="round"
							className="text-blue-600 transition-all duration-1000"
						/>
					</svg>
					<div className="absolute flex flex-col items-center">
						<span className="text-4xl font-black text-slate-900 leading-none">{mockData.score}</span>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Points</span>
					</div>
				</div>

				<div className="mt-8 text-center">
					<p className="text-2xl font-black text-blue-600 mb-1">{mockData.tierName} Tier</p>
					<p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Status: Tier {mockData.tier} / 5</p>
				</div>
			</div>

			<div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center animate-pulse">
				<p className="text-emerald-700 font-bold text-sm">
					Current Ujrah Discount: <span className="text-xl font-black">-{mockData.discount}%</span>
				</p>
			</div>
		</div>
	);
}