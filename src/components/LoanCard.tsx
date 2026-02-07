'use client';

import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_EMERGENCY_FUND, LENDING_POOL_ID } from '@/lib/sui-client';

export function LoanCard() {
	const account = useCurrentAccount();
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();

	const { data: objects, isLoading, refetch } = useSuiClientQuery('getOwnedObjects', {
		owner: account?.address || '',
		filter: { StructType: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::UserVault` },
		options: { showContent: true }
	}, { enabled: !!account });

	if (isLoading) return <div className="animate-pulse bg-slate-100 h-32 rounded-[2rem]" />;

	const vaults = objects?.data.map((obj: any) => {
		const fields = obj.data?.content?.fields;
		const now = Date.now();
		const deadline = Number(fields.deadline);
		const timeLeftMs = deadline - now;
		const daysLeft = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60 * 24)));
		const monthsLeft = Math.floor(daysLeft / 30);

		return {
			objectId: obj.data?.objectId,
			id: obj.data?.objectId.substring(0, 6),
			principal: Number(fields.principal_debt) / 1_000_000_000,
			ujrah: Number(fields.fee_debt) / 1_000_000_000,
			collateral: Number(fields.collateral_balance) / 1_000_000_000,
			deadline: fields.deadline === '0' ? 'Not set' : `${monthsLeft}m ${daysLeft % 30}d left`,
			isExpired: timeLeftMs < 0 && fields.deadline !== '0'
		};
	}) || [];

	const handleRepayWithSui = async (vaultId: string) => {
		const tx = new Transaction();
		
		// For demo, we pay with a small portion of SUI to clear debt
		// In a real app, calculate exact SUI needed based on current price
		const mockScore = tx.moveCall({ target: `${PACKAGE_ID}::credit_score::create_credit_score`, arguments: [] });

		tx.moveCall({
			target: `${PACKAGE_ID}::${MODULE_EMERGENCY_FUND}::repay_with_jaminan`,
			arguments: [
				tx.object(LENDING_POOL_ID),
				tx.object(vaultId),
				tx.pure.u64(0.1 * 1_000_000_000), // Repay using 0.1 SUI
				mockScore,
				tx.object('0x6'),
			],
		});

		tx.transferObjects([mockScore], tx.pure.address(account!.address));

		signAndExecute({ transaction: tx }, {
			onSuccess: () => { alert('Settled with SUI!'); refetch(); }
		});
	};

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
				<div key={vault.objectId} className="p-6 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden relative">
					{vault.isExpired && (
						<div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
					)}
					
					<div className="flex justify-between items-start mb-4">
						<div>
							<p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Vault #{vault.id}</p>
							<p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{(vault.principal + vault.ujrah).toFixed(2)} <span className="text-sm font-bold text-slate-300">BUCK</span></p>
						</div>
						<div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${vault.isExpired ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
							{vault.isExpired ? 'Expired' : 'Active'}
						</div>
					</div>

					<div className="space-y-2 text-[11px] mb-6">
						<div className="flex justify-between text-slate-500 font-medium">
							<span>Collateral (Rahn) Locked</span>
							<span className="font-bold text-slate-900">{vault.collateral.toFixed(2)} SUI</span>
						</div>
						<div className="flex justify-between text-slate-500 font-medium">
							<span>Time Remaining</span>
							<span className={`font-black ${vault.isExpired ? 'text-red-500' : 'text-slate-900'}`}>{vault.deadline}</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<button className="py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95">
							Pay BUCK
						</button>
						<button 
							onClick={() => handleRepayWithSui(vault.objectId)}
							className="py-3 bg-white text-slate-900 border-2 border-slate-100 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
						>
							Use SUI
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
