module buck_emergency_fund::emergency_fund {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::event;
    use buck_emergency_fund::bucket_mock::{Self, BUCKET_MOCK as BUCK, Bottle, SUSDB, SavingPool};
    use buck_emergency_fund::credit_score::{Self, CreditScore};

    // Error codes
    const E_NOT_OWNER: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    
    /// One-Time Witness for LP Token
    public struct EMERGENCY_FUND has drop {}

    /// Capability for developer to claim maintenance funds (Ujrah)
    public struct MaintenanceCap has key, store {
        id: UID,
    }

    /// Main Lending Pool
    public struct LendingPool has key {
        id: UID,
        
        // Productive Liquidity (Held by Contract)
        susdb_balance: Balance<SUSDB>,    // Staked USDB receipts
        buck_reserve: Balance<BUCK>,      // Operational cash
        sui_reserve: Balance<SUI>,        // Repayments in SUI
        
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
        deadline: u64,
    }

    // --- Events ---
    public struct BorrowEvent has copy, drop { vault_id: ID, borrower: address, amount: u64, ujrah: u64 }

    #[allow(deprecated_usage)]
    fun init(witness: EMERGENCY_FUND, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"lpBUCK", 
            b"BEFS LP", 
            b"Liquidity Provider Token for BEFS (Staked sUSDB)", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);

        let pool = LendingPool {
            id: object::new(ctx),
            susdb_balance: balance::zero(),
            buck_reserve: balance::zero(),
            sui_reserve: balance::zero(),
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
        UserVault { id: object::new(ctx), owner: tx_context::sender(ctx), collateral_balance: balance::zero(), principal_debt: 0, fee_debt: 0, deadline: 0 }
    }

    public fun deposit_collateral(pool: &mut LendingPool, vault: &mut UserVault, collateral: Coin<SUI>) {
        pool.total_sui_locked = pool.total_sui_locked + coin::value(&collateral);
        balance::join(&mut vault.collateral_balance, coin::into_balance(collateral));
    }

    // --- Liquidity & Bucket Integration ---

    public fun provide_liquidity(
        pool: &mut LendingPool, 
        saving_pool: &mut SavingPool,
        buck: Coin<BUCK>, 
        ctx: &mut TxContext
    ): Coin<EMERGENCY_FUND> {
        let amount = coin::value(&buck);
        assert!(amount > 0, E_ZERO_AMOUNT);
        let total_value = balance::value(&pool.susdb_balance) + balance::value(&pool.buck_reserve);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        let shares = if (lp_supply == 0) { amount } else { (amount * lp_supply) / total_value };

        let susdb_coin = bucket_mock::stake(saving_pool, buck, ctx);
        balance::join(&mut pool.susdb_balance, coin::into_balance(susdb_coin));

        coin::mint(&mut pool.lp_buck_supply, shares, ctx)
    }

    public fun remove_liquidity(
        pool: &mut LendingPool, 
        saving_pool: &mut SavingPool,
        lp_coin: Coin<EMERGENCY_FUND>, 
        ctx: &mut TxContext
    ): Coin<BUCK> {
        let shares = coin::value(&lp_coin);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        let total_susdb = balance::value(&pool.susdb_balance);
        let amount_to_unstake = (shares * total_susdb) / lp_supply;
        
        let susdb_to_burn = coin::from_balance(balance::split(&mut pool.susdb_balance, amount_to_unstake), ctx);
        let buck_output = bucket_mock::unstake(saving_pool, susdb_to_burn, ctx);
        
        coin::burn(&mut pool.lp_buck_supply, lp_coin);
        buck_output
    }

    public fun borrow(
        pool: &mut LendingPool,
        saving_pool: &mut SavingPool,
        vault: &mut UserVault,
        _bottle: &Bottle,
        amount_to_borrow: u64,
        duration_months: u64,
        _score: &mut CreditScore,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<BUCK> {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        if (balance::value(&pool.buck_reserve) < amount_to_borrow) {
            let needed = amount_to_borrow - balance::value(&pool.buck_reserve);
            let susdb_to_unstake = coin::from_balance(balance::split(&mut pool.susdb_balance, needed), ctx);
            let buck_from_bucket = bucket_mock::unstake(saving_pool, susdb_to_unstake, ctx);
            balance::join(&mut pool.buck_reserve, coin::into_balance(buck_from_bucket));
        };

        let fee_amount = (amount_to_borrow * 1000) / 10000;
        vault.principal_debt = vault.principal_debt + amount_to_borrow;
        vault.fee_debt = vault.fee_debt + fee_amount;
        vault.deadline = clock::timestamp_ms(clock) + (duration_months * 2592000000);

        event::emit(BorrowEvent { vault_id: object::id(vault), borrower: vault.owner, amount: amount_to_borrow, ujrah: fee_amount });
        coin::take(&mut pool.buck_reserve, amount_to_borrow, ctx)
    }

    public fun repay(pool: &mut LendingPool, vault: &mut UserVault, payment: Coin<BUCK>, score: &mut CreditScore, clock: &Clock, _ctx: &mut TxContext) {
        let amount = coin::value(&payment);
        balance::join(&mut pool.buck_reserve, coin::into_balance(payment));
        if (vault.fee_debt > 0) {
            let fee_pay = if (amount >= vault.fee_debt) { vault.fee_debt } else { amount };
            vault.fee_debt = vault.fee_debt - fee_pay;
        };
        if (vault.principal_debt > 0) {
            let pri_pay = if (amount >= vault.principal_debt) { vault.principal_debt } else { amount };
            vault.principal_debt = vault.principal_debt - pri_pay;
            if (vault.principal_debt == 0 && vault.fee_debt == 0) {
                 credit_score::update_credit_score(score, 0, amount, clock); 
            };
        };
    }
}
