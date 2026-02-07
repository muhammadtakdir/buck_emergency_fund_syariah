module buck_emergency_fund::bucket_mock {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;

    /// The BUCKET_MOCK witness (Matches module name for OTW)
    public struct BUCKET_MOCK has drop {}

    /// The SUSDB (Staked USDB/BUCK) witness
    public struct SUSDB has drop {}

    /// Shared Treasury for Mock Minting
    public struct BuckTreasury has key {
        id: UID,
        cap: TreasuryCap<BUCKET_MOCK>,
    }

    /// Saving Pool Mock
    public struct SavingPool has key {
        id: UID,
        buck_vault: Balance<BUCKET_MOCK>,
        sui_reward_vault: Balance<SUI>,
        susdb_supply: TreasuryCap<SUSDB>,
    }

    #[allow(deprecated_usage)]
    fun init(witness: BUCKET_MOCK, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(witness, 9, b"BUCK", b"Bucket USD", b"Mock BUCK Token", option::none(), ctx);
        transfer::public_freeze_object(metadata);
        transfer::share_object(BuckTreasury { id: object::new(ctx), cap: treasury });
    }

    /// Initialize the saving pool with sUSDB
    #[allow(deprecated_usage)]
    public fun create_saving_pool(susdb_witness: SUSDB, ctx: &mut TxContext) {
        let (s_treasury, s_metadata) = coin::create_currency(susdb_witness, 9, b"sUSDB", b"Staked USDB", b"Bucket Saving Receipt", option::none(), ctx);
        transfer::public_freeze_object(s_metadata);

        let pool = SavingPool {
            id: object::new(ctx),
            buck_vault: balance::zero(),
            sui_reward_vault: balance::zero(),
            susdb_supply: s_treasury,
        };
        transfer::share_object(pool);
    }

    public fun stake(pool: &mut SavingPool, buck: Coin<BUCKET_MOCK>, ctx: &mut TxContext): Coin<SUSDB> {
        let amount = coin::value(&buck);
        balance::join(&mut pool.buck_vault, coin::into_balance(buck));
        coin::mint(&mut pool.susdb_supply, amount, ctx)
    }

    public fun unstake(pool: &mut SavingPool, susdb: Coin<SUSDB>, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        let amount = coin::value(&susdb);
        coin::burn(&mut pool.susdb_supply, susdb);
        coin::take(&mut pool.buck_vault, amount, ctx)
    }

    public struct Bottle has store, key { id: UID, collateral_amount: u64, buck_amount: u64, stake_amount: u64, reward_coll_snapshot: u128, reward_debt_snapshot: u128 }
    public fun get_bottle_info(bottle: &Bottle): (u64, u64) { (bottle.collateral_amount, bottle.buck_amount) }
    public fun is_legit_bottle(_bottle: &Bottle): bool { true }
    public fun create_mock_bottle(collateral_amount: u64, buck_amount: u64, ctx: &mut TxContext): Bottle {
        Bottle { id: object::new(ctx), collateral_amount, buck_amount, stake_amount: 0, reward_coll_snapshot: 0, reward_debt_snapshot: 0 }
    }
    public fun mint_mock(treasury: &mut BuckTreasury, amount: u64, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        coin::mint(&mut treasury.cap, amount, ctx)
    }
}
