module message_board_addr::lend {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    // Resource to track lending
    struct LendingPool has key {
        funds: coin::Coin<AptosCoin>
    }

    // Initialize the lending pool
    fun init_module(account: &signer) {
        move_to(account, LendingPool {
            funds: coin::zero<AptosCoin>()
        });
    }

    // Deposit funds into the lending pool
    public entry fun deposit_funds(account: &signer, amount: u64) acquires LendingPool {
        let pool = borrow_global_mut<LendingPool>(@message_board_addr);
        
        // Transfer funds from account to pool
        let coins = coin::withdraw<AptosCoin>(account, amount);
        coin::merge(&mut pool.funds, coins);
    }

    // Extract funds from the pool - used by borrow module
    public fun extract_funds(amount: u64): coin::Coin<AptosCoin> acquires LendingPool {
        let pool = borrow_global_mut<LendingPool>(@message_board_addr);
        
        // Ensure pool has enough funds
        assert!(coin::value(&pool.funds) >= amount, 1);
        
        // Extract funds from pool
        coin::extract(&mut pool.funds, amount)
    }

    // Add funds to the pool - used by borrow module
    public fun add_funds(coins: coin::Coin<AptosCoin>) acquires LendingPool {
        let pool = borrow_global_mut<LendingPool>(@message_board_addr);
        
        // Add funds to pool
        coin::merge(&mut pool.funds, coins);
    }

    // View function to get pool funds
    #[view]
    public fun get_pool_funds(): u64 acquires LendingPool {
        let pool = borrow_global<LendingPool>(@message_board_addr);
        coin::value(&pool.funds)
    }

    // For testing
    #[test_only]
    public fun init_for_testing(account: &signer) {
        init_module(account);
    }
}
