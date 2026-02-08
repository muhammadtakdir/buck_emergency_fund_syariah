import { useQuery } from '@tanstack/react-query';

export function useSuiPrice() {
	return useQuery({
		queryKey: ['sui-price'],
		queryFn: async () => {
			const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd');
			const data = await res.json();
			return data.sui.usd as number;
		},
		refetchInterval: 60000, // Update every minute
		staleTime: 30000,
	});
}
