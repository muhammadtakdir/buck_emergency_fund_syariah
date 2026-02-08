'use client';

import { useEffect } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { PACKAGE_ID, MODULE_CREDIT_SCORE, MODULE_EMERGENCY_FUND } from '@/lib/sui-client';
import { useSuiPrice } from '@/lib/useSuiPrice';

interface Props {
    refreshTrigger?: number;
}

export function CreditScore({ refreshTrigger }: Props) {
	const account = useCurrentAccount();
	const { data: suiPrice } = useSuiPrice();

	// Fetch Credit Score
	const { data: scoreObjects, isLoading: scoreLoading, refetch: refetchScore } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::credit_score::CreditScore` },
		options: { showContent: true }
	}, { enabled: !!account });

	// Fetch Vaults for Health
	const { data: vaultObjects, isLoading: vaultsLoading, refetch: refetchVaults } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::UserVault` },
		options: { showContent: true }
	}, { enabled: !!account });

    useEffect(() => {
        if (account) {
            refetchScore();
            refetchVaults();
        }
    }, [refreshTrigger, account, refetchScore, refetchVaults]);

	if (scoreLoading || vaultsLoading) return <div className="animate-pulse bg-slate-800/40 h-96 rounded-3xl" />;

	// Score Logic
	const scoreData = scoreObjects?.data[0]?.data?.content as any;
	const scoreFields = scoreData?.fields;
	const score = scoreFields ? Number(scoreFields.score) : 500;
	const tier = scoreFields ? Number(scoreFields.tier) : 3;
	const tierName = tier >= 5 ? 'Muttaqin' : tier >= 4 ? 'Shalih' : 'Fair';

	// Health Logic
	const getBal = (f: any) => {
		if (!f) return 0;
		if (typeof f === 'string' || typeof f === 'number') return Number(f);
		if (f.fields && f.fields.value) return Number(f.fields.value);
		if (f.value) return Number(f.value);
		return 0;
	};

	const aggregated = vaultObjects?.data.reduce((acc, obj) => {
		const f = (obj.data?.content as any)?.fields;
		if (!f) return acc;
		acc.collateral += getBal(f.collateral_balance);
		acc.debt += Number(f.principal_debt) + Number(f.fee_debt);
		return acc;
	}, { collateral: 0, debt: 0 }) || { collateral: 0, debt: 0 };

	const effectivePrice = suiPrice || 1.5; 
	const collateralValue = (aggregated.collateral / 1_000_000_000) * effectivePrice;
	const debtValue = aggregated.debt / 1_000_000_000;
	const healthFactor = debtValue > 0 ? (collateralValue / debtValue) : 0;

	const getStatusColor = () => {
		if (healthFactor >= 1.5) return 'text-emerald-400';
		if (healthFactor > 0) return 'text-red-400';
		return 'text-slate-600';
	};

	return (
		<div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 flex flex-col group overflow-hidden hover:shadow-lg transition-all">
			{/* Top Section: Credit Score */}
            <div className="p-6 border-b border-slate-700/30 flex flex-col items-center">
			    <h3 className="text-sm font-bold text-slate-400 mb-6 self-start px-1 uppercase tracking-widest leading-none">Credit Profile</h3>
			
                <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-900/50" />
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
                            className="text-blue-500 transition-all duration-1000 group-hover:text-blue-400"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-white tracking-tighter">{score}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Points</span>
                    </div>
                </div>

                <div className="mt-6 text-center space-y-1">
                    <p className="text-lg font-bold text-blue-400 uppercase tracking-widest">{tierName} Tier</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level {tier} / 5 • Fee -{tier}%</p>
                </div>
            </div>

			{/* Bottom Section: Health Analytics */}
            <div className="p-6 bg-slate-900/20">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Position Health</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${getStatusColor()}`}>
                        {healthFactor > 0 ? healthFactor.toFixed(2) + " HF" : "No Position"}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 px-1">
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">Collateral</p>
                        <p className="text-sm font-bold text-slate-200">${collateralValue.toFixed(2)}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">Debt</p>
                        <p className="text-sm font-bold text-slate-200">{debtValue.toFixed(2)} USDB</p>
                    </div>
                </div>

                <div className="space-y-2 px-1">
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${healthFactor >= 1.5 ? 'bg-emerald-500' : healthFactor > 0 ? 'bg-red-500' : 'bg-slate-800'}`} 
                            style={{ width: `${Math.min(100, healthFactor > 0 ? (healthFactor / 3) * 100 : 0)}%` }} 
                        />
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium text-center uppercase tracking-tighter">
                        {healthFactor > 0 ? `Settlement Risk: ${((1.5 / healthFactor) * 100).toFixed(0)}%` : "Risk Monitoring Offline"}
                    </p>
                </div>
            </div>
		</div>
	);
}