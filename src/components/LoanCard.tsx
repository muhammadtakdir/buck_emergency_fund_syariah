'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND } from '@/lib/sui-client';

export function LoanCard() {
	const account = useCurrentAccount();

	const { data: objects, isLoading } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::UserVault` },
		options: { showContent: true }
	}, { enabled: !!account });

	if (isLoading) return <div className="animate-pulse bg-slate-100 h-32 rounded-[2rem]" />;

	const vaults = objects?.data.map((obj: any) => {
		const fields = obj.data?.content?.fields;
		return {
			id: obj.data?.objectId.substring(0, 6),
			principal: Number(fields.principal_debt) / 1_000_000_000,
			ujrah: Number(fields.fee_debt) / 1_000_000_000,
			status: 'Active',
		};
	}) || [];

	if (vaults.length === 0) {
		return (
			<div className="p-8 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
				<p className="text-slate-400 text-sm font-bold tracking-tight">No active vault positions</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{vaults.map(vault => (
				<div key={vault.id} className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
					<div className="flex justify-between items-start mb-4">
						<div>
							<p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Vault #{vault.id}</p>
							<p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{vault.principal.toFixed(2)} <span className="text-sm font-bold text-slate-300">BUCK</span></p>
						</div>
						<div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
							Active
						</div>
					</div>

					<div className="space-y-3 text-[12px] mb-6">
						<div className="flex justify-between text-slate-500 font-medium">
							<span>Ujrah (Service Fee)</span>
							<span className="font-bold text-slate-900">+{vault.ujrah.toFixed(2)} BUCK</span>
						</div>
						<div className="pt-2 border-t border-slate-50 flex justify-between">
							<span className="font-bold text-slate-900">Total Obligation</span>
							<span className="font-black text-blue-600">{(vault.principal + vault.ujrah).toFixed(2)} BUCK</span>
						</div>
					</div>

					<button className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
						Repay in Installments
					</button>
				</div>
			))}
		</div>
	);
}