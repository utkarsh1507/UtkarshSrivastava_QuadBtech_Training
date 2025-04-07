module counter::counter {
    use std::signer;

    /// Resource to store counter value
    struct Counter has key {
        value: u64,
    }

    /// Initializes the counter with value 0 for the signer account
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        if (exists<Counter>(addr)) {
            abort 1; // Already initialized
        };
        move_to(account, Counter { value: 0 });
    }

    /// Increments the counter value for the signer account
    public entry fun increment(account: &signer) acquires Counter {
        let counter = borrow_global_mut<Counter>(signer::address_of(account));
        counter.value = counter.value + 1;
    }

    /// Returns the current counter value of the specified address
    public fun get(address: address): u64 acquires Counter {
        borrow_global<Counter>(address).value
    }
}
