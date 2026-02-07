'use client';

export function LoanCard() {
	// Mock active loans (Sharia updated)
	const loans = [
		{
			id: '1',
			principal: 100,
			ujrah: 10,
			repaid: 22,
			deadline: 'Feb 21, 2026',
			status: 'Active',
		}
	];

	if (loans.length === 0) {
		return <p className="text-slate-500 italic text-center py-8">No active vault positions</p>;
	}

	return (
		<div className="space-y-4">
			{loans.map(loan => (
				<div key={loan.id} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
					<div className="flex justify-between items-start mb-4">
						<div>
							<p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Vault ID: #{loan.id}</p>
							<p className="text-2xl font-black text-slate-900">{loan.principal} <span className="text-sm font-bold text-slate-400">BUCK</span></p>
						</div>
						<span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">
							{loan.status}
						</span>
					</div>

					<div className="space-y-3 text-sm mb-6">
						<div className="flex justify-between text-slate-500">
							<span>Ujrah (Service Fee)</span>
							<span className="font-bold text-slate-900">+{loan.ujrah} BUCK</span>
						</div>
						<div className="flex justify-between text-slate-500">
							<span>Total Repaid</span>
							<span className="font-bold text-emerald-600">-{loan.repaid} BUCK</span>
						</div>
						<div className="pt-2 border-t border-slate-50 flex justify-between">
							<span className="font-bold text-slate-900">Remaining Debt</span>
							<span className="font-black text-blue-600">{loan.principal + loan.ujrah - loan.repaid} BUCK</span>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="w-full bg-slate-50 h-1.5 rounded-full mb-6 overflow-hidden">
						<div 
							className="bg-blue-600 h-full transition-all duration-1000" 
							style={{ width: `${(loan.repaid / (loan.principal + loan.ujrah)) * 100}%` }}
						/>
					</div>

					<button className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
						Make Partial Payment
					</button>
				</div>
			))}
		</div>
	);
}