module message_board_addr::borrow {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use message_board_addr::lend;

    // Resource to track borrowing
    struct BorrowRecord has key {
        amount: u64,
        is_repaid: bool
    }

    // Borrow funds from the lending pool
    public entry fun borrow_funds(account: &signer, amount: u64) acquires BorrowRecord {
        let account_addr = signer::address_of(account);
        
        // Check if user already has an active loan
        if (exists<BorrowRecord>(account_addr)) {
            let record = borrow_global_mut<BorrowRecord>(account_addr);
            assert!(record.is_repaid, 0); // Ensure previous loan is repaid
            record.amount = amount;
            record.is_repaid = false;
        } else {
            // Create new borrow record
            move_to(account, BorrowRecord {
                amount: amount,
                is_repaid: false
            });
        };
        
        // Check if pool has enough funds
        let pool_funds = lend::get_pool_funds();
        assert!(pool_funds >= amount, 1); // Ensure pool has enough funds
        
        // Extract funds from pool
        let coins = lend::extract_funds(amount);
        
        // Deposit APT to borrower
        coin::deposit(account_addr, coins);
    }

    // Repay borrowed funds
    public entry fun repay_loan(account: &signer) acquires BorrowRecord {
        let account_addr = signer::address_of(account);
        
        // Ensure user has a loan
        assert!(exists<BorrowRecord>(account_addr), 2);
        
        let record = borrow_global_mut<BorrowRecord>(account_addr);
        assert!(!record.is_repaid, 3); // Ensure loan is not already repaid
        
        // Withdraw funds from borrower to repay loan
        let repay_coins = coin::withdraw<AptosCoin>(account, record.amount);
        
        // Add funds back to the lending pool
        lend::add_funds(repay_coins);
        
        // Mark loan as repaid
        record.is_repaid = true;
    }

    // View function to check if account has an active loan
    #[view]
    public fun has_active_loan(account_addr: address): bool acquires BorrowRecord {
        if (!exists<BorrowRecord>(account_addr)) {
            return false
        };
        
        let record = borrow_global<BorrowRecord>(account_addr);
        !record.is_repaid
    }

    // View function to get loan amount
    #[view]
    public fun get_loan_amount(account_addr: address): u64 acquires BorrowRecord {
        assert!(exists<BorrowRecord>(account_addr), 2);
        let record = borrow_global<BorrowRecord>(account_addr);
        record.amount
    }
}
