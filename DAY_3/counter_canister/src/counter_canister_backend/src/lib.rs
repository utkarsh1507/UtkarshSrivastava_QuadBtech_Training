use ic_cdk::storage;
use ic_cdk_macros::{init, query, update};
use std::cell::Cell;

thread_local! {
    static COUNTER: Cell<u64> = Cell::new(0);
}

// Initialize counter (called when deployed)
#[init]
fn init() {
    COUNTER.with(|c| c.set(0));
}

// Increment the counter
#[update]
fn increment() -> u64 {
    COUNTER.with(|c| {
        let value = c.get() + 1;
        c.set(value);
        value
    })
}

// Get the counter value
#[query]
fn get() -> u64 {
    COUNTER.with(|c| c.get())
}
