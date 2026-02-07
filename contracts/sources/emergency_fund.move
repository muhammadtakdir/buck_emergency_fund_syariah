module buck_emergency_fund::emergency_fund {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::clock::Clock;
    use sui::event;
    use buck_emergency_fund::bucket_mock::{Self, BUCKET_MOCK as BUCK, Bottle};
    use buck_emergency_fund::credit_score::{Self, CreditScore};
    use buck_emergency_fund::price_feed_mock;

    // Error codes
    const E_INSUFFICIENT_POOL_BALANCE: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const E_INSUFFICIENT_COLLATERAL: u64 = 4;
    
    /// One-Time Witness for LP Token
    public struct EMERGENCY_FUND has drop {}

    /// Capability for developer to claim maintenance funds (Ujrah)
    public struct MaintenanceCap has key, store {
        id: UID,
    }

    /// Main Lending Pool
    public struct LendingPool has key {
        id: UID,
        
        // Liquidity
        buck_balance: Balance<BUCK>,      
        lp_buck_supply: TreasuryCap<EMERGENCY_FUND>,
        
        // Reserves
        maintenance_balance: Balance<BUCK>, 
        waqf_reserve: Balance<EMERGENCY_FUND>,     

        // Global Stats
        total_sui_locked: u64,

        // Configuration
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
    }

    // --- Events ---
    public struct BorrowEvent has copy, drop {
        vault_id: ID,
        borrower: address,
        amount: u64,
        ujrah: u64,
    }

    public struct RepayEvent has copy, drop {
        vault_id: ID,
        payer: address,
        amount: u64,
        remaining_principal: u64,
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

    // --- User Vault Management ---

    public fun create_vault(ctx: &mut TxContext): UserVault {
        UserVault {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            collateral_balance: balance::zero(),
            principal_debt: 0,
            fee_debt: 0,
        }
    }

    public fun deposit_collateral(
        pool: &mut LendingPool,
        vault: &mut UserVault,
        collateral: Coin<SUI>
    ) {
        let amount = coin::value(&collateral);
        pool.total_sui_locked = pool.total_sui_locked + amount;
        balance::join(&mut vault.collateral_balance, coin::into_balance(collateral));
    }

    public fun withdraw_collateral(
        pool: &mut LendingPool,
        vault: &mut UserVault,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
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

    // --- Liquidity & Waqf Functions ---

    public fun provide_liquidity(
        pool: &mut LendingPool, buck: Coin<BUCK>, ctx: &mut TxContext
    ): Coin<EMERGENCY_FUND> {
        let amount = coin::value(&buck);
        assert!(amount > 0, E_ZERO_AMOUNT);
        let buck_balance = balance::value(&pool.buck_balance);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        
        let shares = if (lp_supply == 0) { amount } else { (amount * lp_supply) / buck_balance };
        
        balance::join(&mut pool.buck_balance, coin::into_balance(buck));
        coin::mint(&mut pool.lp_buck_supply, shares, ctx)
    }

    public fun remove_liquidity(
        pool: &mut LendingPool, lp_coin: Coin<EMERGENCY_FUND>, ctx: &mut TxContext
    ): Coin<BUCK> {
        let shares = coin::value(&lp_coin);
        assert!(shares > 0, E_ZERO_AMOUNT);
        let buck_balance = balance::value(&pool.buck_balance);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        
        let amount = (shares * buck_balance) / lp_supply;
        
        coin::burn(&mut pool.lp_buck_supply, lp_coin);
        coin::take(&mut pool.buck_balance, amount, ctx)
    }

    // --- Borrowing (Qard with Ujrah) ---

    public fun borrow(
        pool: &mut LendingPool,
        vault: &mut UserVault,
        bottle: &Bottle, // Use real Bottle from Bucket Protocol
        amount_to_borrow: u64,
        score: &mut CreditScore,
        _clock: &Clock,
        ctx: &mut TxContext
    ): Coin<BUCK> {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(bucket_mock::is_legit_bottle(bottle), E_NOT_OWNER);
        assert!(amount_to_borrow > 0, E_ZERO_AMOUNT);
        assert!(balance::value(&pool.buck_balance) >= amount_to_borrow, E_INSUFFICIENT_POOL_BALANCE);

        let tier = credit_score::get_tier(score);
        let discount_bps = credit_score::get_fee_discount(tier);
        let effective_fee_bps = if (pool.service_fee_bps > discount_bps) {
            pool.service_fee_bps - discount_bps
        } else {
            0
        };
        
        let fee_amount = (amount_to_borrow * effective_fee_bps) / 10000;

        vault.principal_debt = vault.principal_debt + amount_to_borrow;
        vault.fee_debt = vault.fee_debt + fee_amount;

        let predicted_price = price_feed_mock::get_predicted_low_price();
        let collateral_sui = balance::value(&vault.collateral_balance);
        let collateral_val_buck = (collateral_sui * predicted_price) / 1_000_000_000;
        
        let total_obligation = vault.principal_debt + vault.fee_debt;
        let required_collateral = (total_obligation * pool.min_collateral_ratio) / 100;
        
        assert!(collateral_val_buck >= required_collateral, E_INSUFFICIENT_COLLATERAL);

        event::emit(BorrowEvent {
            vault_id: object::id(vault),
            borrower: vault.owner,
            amount: amount_to_borrow,
            ujrah: fee_amount,
        });

        coin::take(&mut pool.buck_balance, amount_to_borrow, ctx)
    }

    public fun repay(
        pool: &mut LendingPool,
        vault: &mut UserVault,
        payment: Coin<BUCK>,
        score: &mut CreditScore,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, E_ZERO_AMOUNT);
        let mut payment_balance = coin::into_balance(payment);
        let mut remaining_amount = amount;

        if (vault.fee_debt > 0) {
            let fee_payment = if (remaining_amount >= vault.fee_debt) {
                vault.fee_debt
            } else {
                remaining_amount
            };

            let maintenance_amt = (fee_payment * pool.split_maintenance_bps) / 10000;
            balance::join(&mut pool.maintenance_balance, balance::split(&mut payment_balance, maintenance_amt));

            let waqf_amt = (fee_payment * pool.split_waqf_bps) / 10000;
            if (waqf_amt > 0) {
                 let buck_res = balance::value(&pool.buck_balance);
                 let lp_sup = coin::total_supply(&pool.lp_buck_supply);
                 let shares_to_mint = if (lp_sup == 0) { waqf_amt } else { (waqf_amt * lp_sup) / buck_res };
                 
                 balance::join(&mut pool.buck_balance, balance::split(&mut payment_balance, waqf_amt));
                 balance::join(&mut pool.waqf_reserve, coin::into_balance(coin::mint(&mut pool.lp_buck_supply, shares_to_mint, ctx)));
            };

            vault.fee_debt = vault.fee_debt - fee_payment;
            remaining_amount = remaining_amount - fee_payment;
        };

        if (remaining_amount > 0 && vault.principal_debt > 0) {
            let principal_payment = if (remaining_amount >= vault.principal_debt) {
                vault.principal_debt
            } else {
                remaining_amount
            };
            vault.principal_debt = vault.principal_debt - principal_payment;
            
            if (vault.principal_debt == 0 && vault.fee_debt == 0) {
                 credit_score::update_credit_score(score, 0, amount, clock); 
            };
        };

        if (balance::value(&payment_balance) > 0) {
             balance::join(&mut pool.buck_balance, payment_balance);
        } else {
            balance::destroy_zero(payment_balance);
        };

        event::emit(RepayEvent {
            vault_id: object::id(vault),
            payer: tx_context::sender(ctx),
            amount,
            remaining_principal: vault.principal_debt,
        });
    }

    public fun claim_maintenance(
        _: &MaintenanceCap,
        pool: &mut LendingPool,
        ctx: &mut TxContext
    ): Coin<BUCK> {
        let amount = balance::value(&pool.maintenance_balance);
        assert!(amount > 0, E_ZERO_AMOUNT);
        coin::from_balance(balance::split(&mut pool.maintenance_balance, amount), ctx)
    }

    public fun get_waqf_shares(pool: &LendingPool): u64 {
        balance::value(&pool.waqf_reserve)
    }
}
