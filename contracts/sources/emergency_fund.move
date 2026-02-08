module buck_emergency_fund::emergency_fund {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::event;
    use buck_emergency_fund::bucket_mock::{Self, BUCKET_MOCK as BUCK, SUSDB, Bottle, SavingPool, BuckTreasury};
    use buck_emergency_fund::credit_score::{Self, CreditScore};

    // Error codes
    const E_NOT_OWNER: u64 = 2;
    const E_INSUFFICIENT_COLLATERAL: u64 = 3;
    const E_DEBT_NOT_PAID: u64 = 1;
    const E_INVALID_CREDIT_SCORE: u64 = 4;
    
    public struct EMERGENCY_FUND has drop {}

    public struct MaintenanceCap has key, store { id: UID }

    public struct LendingPool has key {
        id: UID,
        susdb_balance: Balance<SUSDB>,    
        buck_reserve: Balance<BUCK>,      
        sui_reserve: Balance<SUI>,        
        lp_buck_supply: TreasuryCap<EMERGENCY_FUND>,
        maintenance_balance: Balance<BUCK>, 
        waqf_reserve: Balance<EMERGENCY_FUND>,     
        total_sui_locked: u64,
        service_fee_bps: u64,            
        min_collateral_ratio: u64,       
        split_maintenance_bps: u64,      
        split_waqf_bps: u64,             
    }

    public struct UserVault has key, store { id: UID, owner: address, collateral_balance: Balance<SUI>, principal_debt: u64, fee_debt: u64, deadline: u64 }

    public struct BorrowEvent has copy, drop { vault_id: ID, borrower: address, amount: u64, ujrah: u64 }
    public struct RepayEvent has copy, drop { vault_id: ID, payer: address, amount: u64 }

    #[allow(deprecated_usage)]
    fun init(witness: EMERGENCY_FUND, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(witness, 9, b"lpBUCK", b"BEFS LP", b"BEFS Liquidity Share", option::none(), ctx);
        transfer::public_freeze_object(metadata);
        let pool = LendingPool { id: object::new(ctx), susdb_balance: balance::zero(), buck_reserve: balance::zero(), sui_reserve: balance::zero(), lp_buck_supply: treasury, maintenance_balance: balance::zero(), waqf_reserve: balance::zero(), total_sui_locked: 0, service_fee_bps: 1000, min_collateral_ratio: 150, split_maintenance_bps: 2000, split_waqf_bps: 4000 };
        transfer::share_object(pool);
        transfer::transfer(MaintenanceCap { id: object::new(ctx) }, tx_context::sender(ctx));
    }

    public fun create_vault(ctx: &mut TxContext): UserVault {
        UserVault { id: object::new(ctx), owner: tx_context::sender(ctx), collateral_balance: balance::zero(), principal_debt: 0, fee_debt: 0, deadline: 0 }
    }

    public fun deposit_collateral(pool: &mut LendingPool, vault: &mut UserVault, collateral: Coin<SUI>) {
        pool.total_sui_locked = pool.total_sui_locked + coin::value(&collateral);
        balance::join(&mut vault.collateral_balance, coin::into_balance(collateral));
    }

    public fun provide_liquidity(pool: &mut LendingPool, saving_pool: &mut SavingPool, buck: Coin<BUCK>, ctx: &mut TxContext): Coin<EMERGENCY_FUND> {
        let amount = coin::value(&buck);
        let total_value = balance::value(&pool.susdb_balance) + balance::value(&pool.buck_reserve);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        
        let shares = if (lp_supply == 0) { 
            amount 
        } else { 
            (((amount as u128) * (lp_supply as u128) / (total_value as u128)) as u64)
        };
        
        let susdb_coin = bucket_mock::stake(saving_pool, buck, ctx);
        balance::join(&mut pool.susdb_balance, coin::into_balance(susdb_coin));
        coin::mint(&mut pool.lp_buck_supply, shares, ctx)
    }

    public fun remove_liquidity(pool: &mut LendingPool, saving_pool: &mut SavingPool, lp_coin: Coin<EMERGENCY_FUND>, ctx: &mut TxContext): (Coin<BUCK>, Coin<SUI>) {
        let shares = coin::value(&lp_coin);
        let lp_supply = coin::total_supply(&pool.lp_buck_supply);
        let total_v = balance::value(&pool.susdb_balance) + balance::value(&pool.buck_reserve);
        
        let buck_amt = (((shares as u128) * (total_v as u128) / (lp_supply as u128)) as u64);
        let sui_amt = (((shares as u128) * (balance::value(&pool.sui_reserve) as u128) / (lp_supply as u128)) as u64);
        
        let susdb_to_unstake = if (balance::value(&pool.susdb_balance) >= buck_amt) { buck_amt } else { balance::value(&pool.susdb_balance) };
        let susdb_coin = coin::from_balance(balance::split(&mut pool.susdb_balance, susdb_to_unstake), ctx);
        let buck_output = bucket_mock::unstake(saving_pool, susdb_coin, ctx);
        coin::burn(&mut pool.lp_buck_supply, lp_coin);
        (buck_output, coin::take(&mut pool.sui_reserve, sui_amt, ctx))
    }

    public fun borrow(pool: &mut LendingPool, saving_pool: &mut SavingPool, vault: &mut UserVault, amount_to_borrow: u64, price: u64, duration_months: u64, clock: &Clock, ctx: &mut TxContext): Coin<BUCK> {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Check collateral ratio
        let collateral_val = (((balance::value(&vault.collateral_balance) as u128) * (price as u128) / 1000000000) as u64);
        let total_new_debt = vault.principal_debt + vault.fee_debt + amount_to_borrow + ((amount_to_borrow * pool.service_fee_bps) / 10000);
        assert!((collateral_val * 100 / total_new_debt) >= pool.min_collateral_ratio, E_INSUFFICIENT_COLLATERAL);

        if (balance::value(&pool.buck_reserve) < amount_to_borrow) {
            let needed = amount_to_borrow - balance::value(&pool.buck_reserve);
            let susdb_coin = coin::from_balance(balance::split(&mut pool.susdb_balance, needed), ctx);
            let buck_from_bucket = bucket_mock::unstake(saving_pool, susdb_coin, ctx);
            balance::join(&mut pool.buck_reserve, coin::into_balance(buck_from_bucket));
        };
        vault.principal_debt = vault.principal_debt + amount_to_borrow;
        vault.fee_debt = vault.fee_debt + ((amount_to_borrow * pool.service_fee_bps) / 10000);
        vault.deadline = clock::timestamp_ms(clock) + (duration_months * 2592000000);
        event::emit(BorrowEvent { vault_id: object::id(vault), borrower: vault.owner, amount: amount_to_borrow, ujrah: (amount_to_borrow * pool.service_fee_bps / 10000) });
        coin::take(&mut pool.buck_reserve, amount_to_borrow, ctx)
    }

    public fun repay(pool: &mut LendingPool, vault: &mut UserVault, payment: Coin<BUCK>, score: &mut CreditScore, clock: &Clock, ctx: &mut TxContext) {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(credit_score::get_user(score) == tx_context::sender(ctx), E_INVALID_CREDIT_SCORE);

        let amount = coin::value(&payment);
        let mut payment_balance = coin::into_balance(payment);
        if (vault.fee_debt > 0) {
            let current_balance = balance::value(&payment_balance);
            let fee_pay = if (current_balance >= vault.fee_debt) { vault.fee_debt } else { current_balance };
            let maint_amt = (fee_pay * pool.split_maintenance_bps) / 10000;
            let waqf_amt = (fee_pay * pool.split_waqf_bps) / 10000;
            balance::join(&mut pool.maintenance_balance, balance::split(&mut payment_balance, maint_amt));
            let waqf_buck = balance::split(&mut payment_balance, waqf_amt);
            let lp_sup = coin::total_supply(&pool.lp_buck_supply);
            let total_v = balance::value(&pool.susdb_balance) + balance::value(&pool.buck_reserve);
            
            let waqf_shares = if (lp_sup == 0) { 
                balance::value(&waqf_buck) 
            } else { 
                (((balance::value(&waqf_buck) as u128) * (lp_sup as u128) / (total_v as u128)) as u64) 
            };
            
            balance::join(&mut pool.buck_reserve, waqf_buck);
            balance::join(&mut pool.waqf_reserve, coin::into_balance(coin::mint(&mut pool.lp_buck_supply, waqf_shares, ctx)));
            vault.fee_debt = vault.fee_debt - fee_pay;
        };
        if (vault.principal_debt > 0) {
            let current_balance = balance::value(&payment_balance);
            if (current_balance > 0) {
                let pri_pay = if (current_balance >= vault.principal_debt) { vault.principal_debt } else { current_balance };
                vault.principal_debt = vault.principal_debt - pri_pay;
                balance::join(&mut pool.buck_reserve, balance::split(&mut payment_balance, pri_pay));
                if (vault.principal_debt == 0 && vault.fee_debt == 0) { credit_score::update_credit_score(score, 0, amount, clock); };
            };
        };
        balance::join(&mut pool.buck_reserve, payment_balance);
        event::emit(RepayEvent { vault_id: object::id(vault), payer: tx_context::sender(ctx), amount });
    }

    public fun claim_maintenance(_: &MaintenanceCap, pool: &mut LendingPool, ctx: &mut TxContext): Coin<BUCK> {
        let amount = balance::value(&pool.maintenance_balance);
        coin::from_balance(balance::split(&mut pool.maintenance_balance, amount), ctx)
    }

    public fun claim_jaminan(pool: &mut LendingPool, vault: &mut UserVault, ctx: &mut TxContext): Coin<SUI> {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(vault.principal_debt == 0 && vault.fee_debt == 0, E_DEBT_NOT_PAID);
        let amt = balance::value(&vault.collateral_balance);
        pool.total_sui_locked = pool.total_sui_locked - amt;
        coin::from_balance(balance::split(&mut vault.collateral_balance, amt), ctx)
    }

    public fun repay_with_jaminan(pool: &mut LendingPool, vault: &mut UserVault, sui_repay_amount: u64, score: &mut CreditScore, price: u64, treasury: &mut BuckTreasury, clock: &Clock, ctx: &mut TxContext) {
        assert!(vault.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(credit_score::get_user(score) == tx_context::sender(ctx), E_INVALID_CREDIT_SCORE);

        let total_debt = vault.principal_debt + vault.fee_debt;
        let debt_in_sui = (((total_debt as u128) * 1000000000 / (price as u128)) as u64);
        assert!(sui_repay_amount >= debt_in_sui, E_INSUFFICIENT_COLLATERAL);
        let sui_payment = balance::split(&mut vault.collateral_balance, sui_repay_amount);
        balance::join(&mut pool.sui_reserve, sui_payment);
        let buck_minted = bucket_mock::mint_mock(treasury, total_debt, ctx);
        repay(pool, vault, buck_minted, score, clock, ctx);
    }
}
