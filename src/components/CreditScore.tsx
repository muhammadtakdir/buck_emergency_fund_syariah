'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { PACKAGE_ID, MODULE_CREDIT_SCORE } from '@/lib/sui-client';

export function CreditScore() {
	const account = useCurrentAccount();

	const { data: objects, isLoading } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::${MODULE_CREDIT_SCORE}::CreditScore` },
		options: { showContent: true }
	}, { enabled: !!account });

	if (isLoading) return <div className="animate-pulse bg-slate-100 h-48 rounded-3xl" />;

	const scoreData = objects?.data[0]?.data?.content as any;
	const fields = scoreData?.fields;

	const score = fields ? Number(fields.score) : 500;
	const tier = fields ? Number(fields.tier) : 3;
	const tierName = tier >= 5 ? 'Muttaqin' : tier >= 4 ? 'Shalih' : 'Fair';

	return (
		<div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
			<h3 className="text-lg font-bold text-slate-900 mb-6 self-start">Ethical Credit Score</h3>
			
			<div className="relative flex items-center justify-center">
				<svg className="w-32 h-32 transform -rotate-90">
					<circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50" />
					<circle
						cx="64"
						cy="64"
						r="58"
						stroke="currentColor"
						strokeWidth="6"
						fill="transparent"
						strokeDasharray={364}
						strokeDashoffset={364 - (364 * score) / 1000}
						strokeLinecap="round"
						className="text-blue-600 transition-all duration-1000"
					/>
				</svg>
				<div className="absolute flex flex-col items-center">
					<span className="text-3xl font-black text-slate-900">{score}</span>
					<span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
				</div>
			</div>

			<div className="mt-6 text-center">
				<p className="text-xl font-black text-blue-600">{tierName} Tier</p>
				<p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status: Level {tier} / 5</p>
			</div>

			<div className="mt-6 w-full p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
				<p className="text-emerald-700 font-bold text-xs">
					Ujrah Discount: <span className="font-black">-{tier}%</span>
				</p>
			</div>
		</div>
	);
}
