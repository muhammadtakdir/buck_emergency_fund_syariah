module buck_emergency_fund::bucket_mock {
    use sui::coin::{Self, Coin, TreasuryCap};

    /// The BUCK coin witness (Renamed to match module name for OTW)
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
        
        // Share treasury so anyone can mint for testing
        transfer::share_object(BuckTreasury { 
            id: object::new(ctx), 
            cap: treasury 
        });
    }

    public fun mint_mock(treasury: &mut BuckTreasury, amount: u64, ctx: &mut TxContext): Coin<BUCKET_MOCK> {
        coin::mint(&mut treasury.cap, amount, ctx)
    }

    /// Mock CDP struct
    public struct CDP has key, store {
        id: UID,
        collateral: u64,
        debt: u64,
        owner: address,
    }

    public fun get_collateral_ratio(_cdp: &CDP): u64 {
        15000 // Fixed 150%
    }

    public fun check_cdp_owner(cdp: &CDP, user: address): bool {
        cdp.owner == user
    }
    
    public fun create_mock_cdp(
        collateral: u64, 
        debt: u64, 
        ctx: &mut TxContext
    ): CDP {
        CDP {
            id: object::new(ctx),
            collateral,
            debt,
            owner: tx_context::sender(ctx)
        }
    }
}
