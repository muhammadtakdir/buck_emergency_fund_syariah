module buck_emergency_fund::price_feed_mock {
    /// Mock Oracle for current price and future prediction
    
    /// Get current SUI price in USD/BUCK (scaled by 1e9)
    /// Example: 1.50 USD = 1_500_000_000
    public fun get_sui_price(): u64 {
        1_500_000_000 // $1.50
    }

    /// Get predicted 'safe' low price for risk management
    /// Updated to 0.70 USD as per new risk assessment
    public fun get_predicted_low_price(): u64 {
        700_000_000 // $0.70
    }
}