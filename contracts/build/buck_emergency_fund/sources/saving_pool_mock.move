module buck_emergency_fund::bucket_mock {
    use sui::coin::{Self, Coin, TreasuryCap};

    /// OTW for BUCK
    public struct BUCKET_MOCK has drop {}

    public struct BuckTreasury has key {
        id: UID,
        cap: TreasuryCap<BUCKET_MOCK>,
    }

    #[allow(deprecated_usage)]
    fun init(witness: BUCKET_MOCK, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(witness, 9, b"BUCK", b"Bucket USD", b"Mock BUCK Token", option::none(), ctx);
        transfer::public_freeze_object(metadata);
        transfer::share_object(BuckTreasury { id: object::new(ctx), cap: treasury });
    }

    public fun mint_mock(treasury: &mut BuckTreasury, amount: u64, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        coin::mint(&mut treasury.cap, amount, ctx)
    }

    public struct Bottle has store, key {
        id: UID,
        collateral_amount: u64,
        buck_amount: u64,
    }

    public fun is_legit_bottle(_bottle: &Bottle): bool {
        true
    }

    public fun create_mock_bottle(collateral_amount: u64, buck_amount: u64, ctx: &mut TxContext): Bottle {
        Bottle { id: object::new(ctx), collateral_amount, buck_amount }
    }
}

module buck_emergency_fund::saving_pool_mock {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use buck_emergency_fund::bucket_mock::BUCKET_MOCK;

    /// OTW for sUSDB
    public struct SAVING_POOL_MOCK has drop {}

    public struct SavingPool has key {
        id: UID,
        buck_vault: Balance<BUCKET_MOCK>,
        sui_reward_vault: Balance<SUI>,
        susdb_supply: TreasuryCap<SAVING_POOL_MOCK>,
    }

    #[allow(deprecated_usage)]
    fun init(witness: SAVING_POOL_MOCK, ctx: &mut TxContext) {
        let (s_treasury, s_metadata) = coin::create_currency(witness, 9, b"sUSDB", b"Staked USDB", b"Bucket Saving Receipt", option::none(), ctx);
        transfer::public_freeze_object(s_metadata);

        let pool = SavingPool {
            id: object::new(ctx),
            buck_vault: balance::zero(),
            sui_reward_vault: balance::zero(),
            susdb_supply: s_treasury,
        };
        transfer::share_object(pool);
    }

    public fun stake(pool: &mut SavingPool, buck: Coin<BUCKET_MOCK>, ctx: &mut TxContext): Coin<SAVING_POOL_MOCK> {
        let amount = coin::value(&buck);
        balance::join(&mut pool.buck_vault, coin::into_balance(buck));
        coin::mint(&mut pool.susdb_supply, amount, ctx)
    }

    public fun unstake(pool: &mut SavingPool, susdb: Coin<SAVING_POOL_MOCK>, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        let amount = coin::value(&susdb);
        coin::burn(&mut pool.susdb_supply, susdb);
        coin::take(&mut pool.buck_vault, amount, ctx)
    }
}
