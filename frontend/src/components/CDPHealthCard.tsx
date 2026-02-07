'use client';

export function CDPHealthCard() {
	// In a real app, fetch data from Bucket Protocol here
	const mockData = {
		collateral: 100,
		debt: 140,
		ratio: 200,
	};

	const getRatioColor = (ratio: number) => {
		if (ratio > 200) return 'text-green-600 bg-green-50';
		if (ratio > 150) return 'text-yellow-600 bg-yellow-50';
		return 'text-red-600 bg-red-50';
	};

	return (
		<div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
			<h3 className="text-lg font-semibold text-slate-900 mb-4">CDP Health Overview</h3>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<p className="text-sm text-slate-500">Collateral</p>
					<p className="text-2xl font-bold text-slate-900">{mockData.collateral} SUI</p>
				</div>
				<div>
					<p className="text-sm text-slate-500">Debt</p>
					<p className="text-2xl font-bold text-slate-900">{mockData.debt} USDB</p>
				</div>
			</div>
			<div className="mt-6">
				<div className="flex justify-between items-center mb-2">
					<p className="text-sm font-medium text-slate-700">Collateral Ratio</p>
					<span className={`px-2 py-1 rounded text-xs font-bold ${getRatioColor(mockData.ratio)}`}>
						{mockData.ratio}%
					</span>
				</div>
				<div className="w-full bg-slate-100 rounded-full h-2">
					<div 
						className="bg-green-500 h-2 rounded-full" 
						style={{ width: `${Math.min(mockData.ratio / 3, 100)}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
