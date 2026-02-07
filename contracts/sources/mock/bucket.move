module buck_emergency_fund::bucket_mock {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::balance::Balance;
    use std::option;

    /// The BUCK coin witness (Matches module name for OTW)
    public struct BUCKET_MOCK has drop {}

    /// Shared Treasury for Mock Minting
    public struct BuckTreasury has key {
        id: UID,
        cap: TreasuryCap<BUCKET_MOCK>,
    }

    #[allow(deprecated_usage)]
    fun init(witness: BUCKET_MOCK, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"BUCK", 
            b"Bucket USD", 
            b"Mock BUCK Token", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        
        transfer::share_object(BuckTreasury { 
            id: object::new(ctx), 
            cap: treasury 
        });
    }

    public fun mint_mock(treasury: &mut BuckTreasury, amount: u64, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        coin::mint(&mut treasury.cap, amount, ctx)
    }

    /// Official Bottle struct from Bucket Protocol
    public struct Bottle has store, key {
        id: UID,
        collateral_amount: u64,
        buck_amount: u64,
        stake_amount: u64,
        reward_coll_snapshot: u128,
        reward_debt_snapshot: u128,
    }

    /// Official Bucket struct (simplified for mock)
    public struct Bucket<phantom T0> has store, key {
        id: UID,
        min_collateral_ratio: u64,
        collateral_vault: Balance<T0>,
        minted_buck_amount: u64,
    }

    /// Logic to check Bottle health against a Bucket
    public fun get_bottle_info(bottle: &Bottle): (u64, u64) {
        (bottle.collateral_amount, bottle.buck_amount)
    }

    /// Mock verification of bottle ownership
    /// In a real integration, we might check if the sender is the owner
    /// or if the bottle ID is registered in the user's account.
    public fun is_legit_bottle(_bottle: &Bottle): bool {
        true
    }

    // --- Helpers for testing ---
    
    public fun create_mock_bottle(
        collateral_amount: u64, 
        buck_amount: u64, 
        ctx: &mut TxContext
    ): Bottle {
        Bottle {
            id: object::new(ctx),
            collateral_amount,
            buck_amount,
            stake_amount: 0,
            reward_coll_snapshot: 0,
            reward_debt_snapshot: 0,
        }
    }
}