module buck_emergency_fund::bucket_mock {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;

    /// BUCK Token OTW
    public struct BUCKET_MOCK has drop {}

    /// sUSDB (Staked BUCK) OTW
    public struct SUSDB has drop {}

    public struct BuckTreasury has key {
        id: UID,
        cap: TreasuryCap<BUCKET_MOCK>,
    }

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

    /// Public Faucet for BUCK
    public fun mint_mock(treasury: &mut BuckTreasury, amount: u64, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        coin::mint(&mut treasury.cap, amount, ctx)
    }

    /// Create Saving Pool manually for mock
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

    // --- Saving Pool Logic ---

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

    // --- Reward Logic ---

    public fun generate_rewards(pool: &mut SavingPool, reward: Coin<SUI>) {
        balance::join(&mut pool.sui_reward_vault, coin::into_balance(reward));
    }

    public fun harvest_rewards(pool: &mut SavingPool, ctx: &mut TxContext): Coin<SUI> {
        let amt = balance::value(&pool.sui_reward_vault);
        coin::from_balance(balance::split(&mut pool.sui_reward_vault, amt), ctx)
    }

    // --- Bottle Logic ---

    public struct Bottle has store, key {
        id: UID,
        collateral_amount: u64,
        buck_amount: u64,
    }

    public fun is_legit_bottle(_bottle: &Bottle): bool { true }

    public fun create_mock_bottle(collateral_amount: u64, buck_amount: u64, ctx: &mut TxContext): Bottle {
        Bottle { id: object::new(ctx), collateral_amount, buck_amount }
    }
}
