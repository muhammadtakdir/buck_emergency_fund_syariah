'use client';

export function CDPHealthCard() {
	// In a real app, fetch data from Bucket Protocol here
	const mockData = {
		totalCollateral: 1250.50,
		totalDebt: 450.00,
		healthFactor: 2.78,
	};

	return (
		<div className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 group">
			<div className="flex justify-between items-start mb-8">
				<div>
					<h3 className="text-xl font-black text-slate-900 tracking-tight">External CDP Analytics</h3>
					<p className="text-slate-500 text-sm font-medium">Bucket Protocol Data Connection</p>
				</div>
				<div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
					<span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
					Connected
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="space-y-1">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collateral Value</p>
					<p className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">${mockData.totalCollateral.toLocaleString()}</p>
				</div>
				<div className="space-y-1">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bucket Debt (USDB)</p>
					<p className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{mockData.totalDebt.toLocaleString()} <span className="text-sm font-bold text-slate-300">USDB</span></p>
				</div>
				<div className="space-y-1">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CDP Health Factor</p>
					<p className="text-3xl font-black text-emerald-500">{mockData.healthFactor}</p>
				</div>
			</div>

			<div className="mt-8 pt-8 border-t border-slate-50">
				<div className="flex justify-between items-center mb-2">
					<span className="text-xs font-bold text-slate-400 uppercase">Liquidation Threshold</span>
					<span className="text-xs font-black text-slate-900">1.50</span>
				</div>
				<div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-0.5 border border-slate-100">
					<div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-full rounded-full w-[85%]" />
				</div>
			</div>
		</div>
	);
}