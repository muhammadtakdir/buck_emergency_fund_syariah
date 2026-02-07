module buck_emergency_fund::oracle_mock {
    /// Mock Oracle to get SUI price in BUCK
    /// In a real app, this would fetch from Pyth or Switchboard
    
    public fun get_sui_price_buck(): u64 {
        // Return mock price: 1 SUI = 1.5 BUCK (scaled by 10^9 if needed, but keeping simple u64 for logic)
        // Let's assume 1 SUI (1_000_000_000) = 1.5 BUCK
        // Only returning the ratio multiplier for simplicity in this demo
        // 1500 = 1.5x
        1500
    }

    public fun convert_sui_to_buck(sui_amount: u64): u64 {
        // sui_amount * 1.5
        (sui_amount * 1500) / 1000
    }
}
