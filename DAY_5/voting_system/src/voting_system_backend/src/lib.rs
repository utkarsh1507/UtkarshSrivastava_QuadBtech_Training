use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub creator: Principal,
    pub created_at: u64,
    pub end_time: u64,
    pub votes: HashMap<Principal, Vote>,
    pub status: ProposalStatus,
}

#[derive(CandidType, Deserialize, Clone)]
pub enum Vote {
    Yes,
    No,
    Abstain,
}

#[derive(CandidType, Deserialize, Clone)]
pub enum ProposalStatus {
    Active,
    Passed,
    Failed,
    Expired,
}

thread_local! {
    static PROPOSALS: std::cell::RefCell<HashMap<u64, Proposal>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
}

#[update]
fn create_proposal(title: String, description: String, duration_seconds: u64) -> Proposal {
    let id = NEXT_ID.with(|next_id| {
        let current = *next_id.borrow();
        *next_id.borrow_mut() = current + 1;
        current
    });

    let now = time();
    let proposal = Proposal {
        id,
        title,
        description,
        creator: ic_cdk::caller(),
        created_at: now,
        end_time: now + duration_seconds,
        votes: HashMap::new(),
        status: ProposalStatus::Active,
    };

    PROPOSALS.with(|proposals| {
        proposals.borrow_mut().insert(id, proposal.clone());
    });

    proposal
}

#[query]
fn get_proposal(id: u64) -> Option<Proposal> {
    PROPOSALS.with(|proposals| {
        proposals.borrow().get(&id).cloned()
    })
}

#[query]
fn get_all_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .values()
            .cloned()
            .collect()
    })
}

#[update]
fn vote(proposal_id: u64, vote: Vote) -> bool {
    let caller = ic_cdk::caller();
    let now = time();

    PROPOSALS.with(|proposals| {
        if let Some(proposal) = proposals.borrow_mut().get_mut(&proposal_id) {
            if proposal.status != ProposalStatus::Active {
                return false;
            }
            if now > proposal.end_time {
                proposal.status = ProposalStatus::Expired;
                return false;
            }
            proposal.votes.insert(caller, vote);
            true
        } else {
            false
        }
    })
}

#[query]
fn get_proposal_results(proposal_id: u64) -> Option<HashMap<Vote, u64>> {
    PROPOSALS.with(|proposals| {
        if let Some(proposal) = proposals.borrow().get(&proposal_id) {
            let mut results = HashMap::new();
            results.insert(Vote::Yes, 0);
            results.insert(Vote::No, 0);
            results.insert(Vote::Abstain, 0);

            for vote in proposal.votes.values() {
                *results.get_mut(vote).unwrap() += 1;
            }

            Some(results)
        } else {
            None
        }
    })
}

#[update]
fn end_proposal(proposal_id: u64) -> Option<ProposalStatus> {
    let now = time();

    PROPOSALS.with(|proposals| {
        if let Some(proposal) = proposals.borrow_mut().get_mut(&proposal_id) {
            if proposal.status != ProposalStatus::Active {
                return None;
            }
            if now > proposal.end_time {
                let yes_votes = proposal.votes.values().filter(|&&v| matches!(v, Vote::Yes)).count();
                let no_votes = proposal.votes.values().filter(|&&v| matches!(v, Vote::No)).count();
                let total_votes = yes_votes + no_votes;

                proposal.status = if total_votes == 0 {
                    ProposalStatus::Expired
                } else if yes_votes > no_votes {
                    ProposalStatus::Passed
                } else {
                    ProposalStatus::Failed
                };
            }
            Some(proposal.status.clone())
        } else {
            None
        }
    })
}

#[query]
fn get_voter_status(proposal_id: u64) -> Option<Vote> {
    let caller = ic_cdk::caller();
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .get(&proposal_id)
            .and_then(|proposal| proposal.votes.get(&caller).cloned())
    })
}

#[query]
fn get_active_proposals() -> Vec<Proposal> {
    let now = time();
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .values()
            .filter(|proposal| matches!(proposal.status, ProposalStatus::Active) && proposal.end_time > now)
            .cloned()
            .collect()
    })
}
