module buck_emergency_fund::credit_score {
    use sui::clock::{Self, Clock};
    use sui::event;

    /// Credit Score Tracking
    public struct CreditScore has key, store {
        id: UID,
        user: address,
        score: u64,              // 0-1000
        tier: u8,                // 1-5 (5 = best)
        on_time_repayments: u64,
        late_repayments: u64,
        liquidations: u64,
        total_volume: u64,
        last_updated: u64,
    }

    /// Event for credit score updates
    public struct ScoreUpdated has copy, drop {
        user: address,
        new_score: u64,
        new_tier: u8,
        event_type: u8,
    }

    // --- Core Functions ---

    /// Create a new credit score record
    public fun create_credit_score(ctx: &mut TxContext): CreditScore {
        CreditScore {
            id: object::new(ctx),
            user: tx_context::sender(ctx),
            score: 500, // Start at Fair
            tier: 3,
            on_time_repayments: 0,
            late_repayments: 0,
            liquidations: 0,
            total_volume: 0,
            last_updated: 0,
        }
    }

    /// Update credit score after loan event
    public(package) fun update_credit_score(
        score: &mut CreditScore,
        event_type: u8, // 0=on_time, 1=late, 2=liquidated
        loan_amount: u64,
        clock: &Clock
    ) {
        if (event_type == 0) {
            score.score = if (score.score + 10 > 1000) { 1000 } else { score.score + 10 };
            score.on_time_repayments = score.on_time_repayments + 1;
        } else if (event_type == 1) {
            score.score = if (score.score < 20) { 0 } else { score.score - 20 };
            score.late_repayments = score.late_repayments + 1;
        } else if (event_type == 2) {
            score.score = if (score.score < 100) { 0 } else { score.score - 100 };
            score.liquidations = score.liquidations + 1;
        };

        score.total_volume = score.total_volume + loan_amount;
        score.tier = calculate_tier(score.score);
        score.last_updated = clock::timestamp_ms(clock);

        event::emit(ScoreUpdated {
            user: score.user,
            new_score: score.score,
            new_tier: score.tier,
            event_type,
        });
    }

    /// Calculate tier from score
    public fun calculate_tier(score: u64): u8 {
        if (score >= 900) { 5 }
        else if (score >= 750) { 4 }
        else if (score >= 500) { 3 }
        else if (score >= 300) { 2 }
        else { 1 }
    }

    /// Get fee discount in basis points
    public fun get_fee_discount(tier: u8): u64 {
        if (tier == 5) { 500 } // 5%
        else if (tier == 4) { 300 } // 3%
        else if (tier == 3) { 200 } // 2%
        else if (tier == 2) { 100 } // 1%
        else { 0 }
    }

    public fun get_score(score: &CreditScore): u64 {
        score.score
    }

    public fun get_tier(score: &CreditScore): u8 {
        score.tier
    }

    public fun get_user(score: &CreditScore): address {
        score.user
    }
}