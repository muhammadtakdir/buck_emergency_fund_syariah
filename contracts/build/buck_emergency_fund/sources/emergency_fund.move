module buck_emergency_fund::emergency_fund {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::event;
    use buck_emergency_fund::bucket_mock::{Self, BUCKET_MOCK as BUCK, Bottle};
    use buck_emergency_fund::credit_score::{Self, CreditScore};
    use buck_emergency_fund::price_feed_mock;

    // Error codes
    const E_INSUFFICIENT_POOL_BALANCE: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const E_INSUFFICIENT_COLLATERAL: u64 = 4;
    const E_NOT_EXPIRED: u64 = 5;
    
    /// One-Time Witness for LP Token
    public struct EMERGENCY_FUND has drop {}

    /// Capability for developer to claim maintenance funds (Ujrah)
    public struct MaintenanceCap has key, store {
        id: UID,
    }

    /// Main Lending Pool
    public struct LendingPool has key {
        id: UID,
        buck_balance: Balance<BUCK>,      
        sui_balance: Balance<SUI>,        // Can hold SUI from collateral repayments
        lp_buck_supply: TreasuryCap<EMERGENCY_FUND>,
        maintenance_balance: Balance<BUCK>, 
        waqf_reserve: Balance<EMERGENCY_FUND>,     

        total_sui_locked: u64,

        service_fee_bps: u64,            
        min_collateral_ratio: u64,       
        split_maintenance_bps: u64,      
        split_waqf_bps: u64,             
    }

    /// User Vault for managing Collateral and Debt
    public struct UserVault has key, store {
        id: UID,
        owner: address,
        collateral_balance: Balance<SUI>,
        principal_debt: u64,
        fee_debt: u64, 
        start_time: u64,
        deadline: u64,
    }

    // --- Events ---
    public struct BorrowEvent has copy, drop {
        vault_id: ID,
        borrower: address,
        amount: u64,
        ujrah: u64,
        deadline: u64,
    }

    public struct RepayEvent has copy, drop {
        vault_id: ID,
        payer: address,
        amount: u64,
        is_collateral_payment: bool,
    }

    #[allow(deprecated_usage)]
    fun init(witness: EMERGENCY_FUND, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"lpBUCK", 
            b"BUCK Emergency LP", 
            b"Liquidity Provider Token for BUCK Emergency Fund", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);

        let pool = LendingPool {
            id: object::new(ctx),
            buck_balance: balance::zero(),
            sui_balance: balance::zero(),
            lp_buck_supply: treasury,
            maintenance_balance: balance::zero(),
            waqf_reserve: balance::zero(), 
            total_sui_locked: 0,
            
            service_fee_bps: 1000,         
            min_collateral_ratio: 150,
            
            split_maintenance_bps: 2000,   
            split_waqf_bps: 4000,          
        };
        transfer::share_object(pool);

        let cap = MaintenanceCap { id: object::new(ctx) };
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    public fun create_vault(ctx: &mut TxContext): UserVault {
        UserVault {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            collateral_balance: balance::zero(),
            principal_debt: 0,
            fee_debt: 0,
            start_time: 0,
            deadline: 0,
        }
    }

    public fun deposit_collateral(pool: &mut LendingPool, vault: &mut UserVault, collateral: Coin<SUI>) {
        let amount = coin::value(&collateral);
        pool.total_sui_locked = pool.total_sui_locked + amount;
        balance::join(&mut vault.collateral_balance, coin::into_balance(collateral));
    }

    public fun withdraw_collateral(pool: &mut LendingPool, vault: &mut UserVault, amount: u64, ctx: &mut TxContext): Coin<SUI> {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(balance::value(&vault.collateral_balance) >= amount, E_INSUFFICIENT_COLLATERAL);

        let remaining_collateral_sui = balance::value(&vault.collateral_balance) - amount;
        let total_obligation = vault.principal_debt + vault.fee_debt;
        
        if (total_obligation > 0) {
            let predicted_price = price_feed_mock::get_predicted_low_price(); 
            let collateral_val_buck = (remaining_collateral_sui * predicted_price) / 1_000_000_000;
            let required_collateral = (total_obligation * pool.min_collateral_ratio) / 100;
            assert!(collateral_val_buck >= required_collateral, E_INSUFFICIENT_COLLATERAL);
        };

        pool.total_sui_locked = pool.total_sui_locked - amount;
        coin::from_balance(balance::split(&mut vault.collateral_balance, amount), ctx)
    }

    // --- Borrowing with Duration ---

    public fun borrow(
        pool: &mut LendingPool,
        vault: &mut UserVault,
        bottle: &Bottle,
        amount_to_borrow: u64,
        duration_months: u64, // 1 to 24
        score: &mut CreditScore,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<BUCK> {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(bucket_mock::is_legit_bottle(bottle), E_NOT_OWNER);
        assert!(duration_months >= 1 && duration_months <= 24, E_ZERO_AMOUNT);
        assert!(balance::value(&pool.buck_balance) >= amount_to_borrow, E_INSUFFICIENT_POOL_BALANCE);

        let tier = credit_score::get_tier(score);
        let discount_bps = credit_score::get_fee_discount(tier);
        let effective_fee_bps = if (pool.service_fee_bps > discount_bps) { pool.service_fee_bps - discount_bps } else { 0 };
        
        let fee_amount = (amount_to_borrow * effective_fee_bps) / 10000;

        vault.principal_debt = vault.principal_debt + amount_to_borrow;
        vault.fee_debt = vault.fee_debt + fee_amount;

        // Set Time
        let now = clock::timestamp_ms(clock);
        vault.start_time = now;
        // 1 month approx = 30 days = 2,592,000,000 ms
        vault.deadline = now + (duration_months * 2592000000);

        let predicted_price = price_feed_mock::get_predicted_low_price();
        let collateral_sui = balance::value(&vault.collateral_balance);
        let collateral_val_buck = (collateral_sui * predicted_price) / 1_000_000_000;
        let total_obligation = vault.principal_debt + vault.fee_debt;
        assert!(collateral_val_buck >= (total_obligation * pool.min_collateral_ratio) / 100, E_INSUFFICIENT_COLLATERAL);

        event::emit(BorrowEvent {
            vault_id: object::id(vault),
            borrower: vault.owner,
            amount: amount_to_borrow,
            ujrah: fee_amount,
            deadline: vault.deadline,
        });

        coin::take(&mut pool.buck_balance, amount_to_borrow, ctx)
    }

    /// Repay using BUCK (Standard)
    public fun repay(pool: &mut LendingPool, vault: &mut UserVault, payment: Coin<BUCK>, score: &mut CreditScore, clock: &Clock, ctx: &mut TxContext) {
        let amount = coin::value(&payment);
        let mut payment_balance = coin::into_balance(payment);
        execute_repayment_math(pool, vault, &mut payment_balance, amount, score, clock, ctx, false);
        if (balance::value(&payment_balance) > 0) {
             balance::join(&mut pool.buck_balance, payment_balance);
        } else {
            balance::destroy_zero(payment_balance);
        };
    }

    /// Repay using SUI from Vault (If user has no BUCK)
    /// This effectively sells a portion of the jaminan to the pool at current market price
    public fun repay_with_jaminan(pool: &mut LendingPool, vault: &mut UserVault, amount_sui: u64, score: &mut CreditScore, clock: &Clock, ctx: &mut TxContext) {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(balance::value(&vault.collateral_balance) >= amount_sui, E_INSUFFICIENT_COLLATERAL);

        let current_price = price_feed_mock::get_sui_price();
        let buck_value = (amount_sui * current_price) / 1_000_000_000;

        let sui_to_pool = balance::split(&mut vault.collateral_balance, amount_sui);
        balance::join(&mut pool.sui_balance, sui_to_pool);
        pool.total_sui_locked = pool.total_sui_locked - amount_sui;

        // For the math logic, we "pretend" we have BUCK balance
        // In a real pool, the pool would now hold SUI assets instead of BUCK
        // LPs can withdraw this SUI later
        let mut dummy_buck = balance::zero<BUCK>();
        execute_repayment_math(pool, vault, &mut dummy_buck, buck_value, score, clock, ctx, true);
        balance::destroy_zero(dummy_buck);
    }

    /// Internal helper for repayment accounting
    fun execute_repayment_math(pool: &mut LendingPool, vault: &mut UserVault, payment_balance: &mut Balance<BUCK>, amount: u64, score: &mut CreditScore, clock: &Clock, _ctx: &mut TxContext, is_collateral: bool) {
        let mut remaining = amount;
        
        // 1. Ujrah
        if (vault.fee_debt > 0) {
            let fee_pay = if (remaining >= vault.fee_debt) { vault.fee_debt } else { remaining };
            
            if (!is_collateral) {
                let maintenance_amt = (fee_pay * pool.split_maintenance_bps) / 10000;
                balance::join(&mut pool.maintenance_balance, balance::split(payment_balance, maintenance_amt));
                // ... rest of split logic ...
            };

            vault.fee_debt = vault.fee_debt - fee_pay;
            remaining = remaining - fee_pay;
        };

        // 2. Principal
        if (remaining > 0 && vault.principal_debt > 0) {
            let pri_pay = if (remaining >= vault.principal_debt) { vault.principal_debt } else { remaining };
            vault.principal_debt = vault.principal_debt - pri_pay;
            if (vault.principal_debt == 0 && vault.fee_debt == 0) {
                 credit_score::update_credit_score(score, 0, amount, clock); 
            };
        };

        event::emit(RepayEvent {
            vault_id: object::id(vault),
            payer: vault.owner,
            amount,
            is_collateral_payment: is_collateral,
        });
    }

    // --- LP Functions ---
    public fun provide_liquidity(pool: &mut LendingPool, buck: Coin<BUCK>, ctx: &mut TxContext): Coin<EMERGENCY_FUND> {
        let amount = coin::value(&buck);
        let buck_balance = balance::value(&pool.buck_balance);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        let shares = if (lp_supply == 0) { amount } else { (amount * lp_supply) / buck_balance };
        balance::join(&mut pool.buck_balance, coin::into_balance(buck));
        coin::mint(&mut pool.lp_buck_supply, shares, ctx)
    }

    public fun remove_liquidity(pool: &mut LendingPool, lp_coin: Coin<EMERGENCY_FUND>, ctx: &mut TxContext): (Coin<BUCK>, Coin<SUI>) {
        let shares = coin::value(&lp_coin);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        
        let buck_amt = (shares * balance::value(&pool.buck_balance)) / lp_supply;
        let sui_amt = (shares * balance::value(&pool.sui_balance)) / lp_supply;
        
        coin::burn(&mut pool.lp_buck_supply, lp_coin);
        (
            coin::take(&mut pool.buck_balance, buck_amt, ctx),
            coin::take(&mut pool.sui_balance, sui_amt, ctx)
        )
    }

    public fun claim_maintenance(_: &MaintenanceCap, pool: &mut LendingPool, ctx: &mut TxContext): Coin<BUCK> {
        let amount = balance::value(&pool.maintenance_balance);
        coin::from_balance(balance::split(&mut pool.maintenance_balance, amount), ctx)
    }
}