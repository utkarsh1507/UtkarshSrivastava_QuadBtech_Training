use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct Data {
    pub text: Option<String>,
    pub number: Option<i64>,
    pub boolean: Option<bool>,
    pub array: Option<Vec<u64>>,
}

thread_local! {
    static DATA_STORE: std::cell::RefCell<HashMap<Principal, Data>> = std::cell::RefCell::new(HashMap::new());
}

#[update]
fn store_data(data: Data) -> bool {
    let caller = ic_cdk::caller();
    DATA_STORE.with(|store| {
        store.borrow_mut().insert(caller, data);
    });
    true
}

#[query]
fn get_data() -> Option<Data> {
    let caller = ic_cdk::caller();
    DATA_STORE.with(|store| {
        store.borrow().get(&caller).cloned()
    })
}

#[update]
fn delete_data() -> bool {
    let caller = ic_cdk::caller();
    DATA_STORE.with(|store| {
        store.borrow_mut().remove(&caller);
    });
    true
}

#[query]
fn get_all_data() -> Vec<(Principal, Data)> {
    DATA_STORE.with(|store| {
        store.borrow()
            .iter()
            .map(|(k, v)| (*k, v.clone()))
            .collect()
    })
}

#[update]
fn clear_all_data() -> bool {
    DATA_STORE.with(|store| {
        store.borrow_mut().clear();
    });
    true
}

#[query]
fn get_data_count() -> u64 {
    DATA_STORE.with(|store| {
        store.borrow().len() as u64
    })
}

#[query]
fn has_data() -> bool {
    let caller = ic_cdk::caller();
    DATA_STORE.with(|store| {
        store.borrow().contains_key(&caller)
    })
}
