use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct Todo {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub completed: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

thread_local! {
    static TODOS: std::cell::RefCell<HashMap<u64, Todo>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
}

#[update]
fn create_todo(title: String, description: String) -> Todo {
    let id = NEXT_ID.with(|next_id| {
        let current = *next_id.borrow();
        *next_id.borrow_mut() = current + 1;
        current
    });

    let now = time();
    let todo = Todo {
        id,
        title,
        description,
        completed: false,
        created_at: now,
        updated_at: now,
    };

    TODOS.with(|todos| {
        todos.borrow_mut().insert(id, todo.clone());
    });

    todo
}

#[query]
fn get_todo(id: u64) -> Option<Todo> {
    TODOS.with(|todos| {
        todos.borrow().get(&id).cloned()
    })
}

#[query]
fn get_all_todos() -> Vec<Todo> {
    TODOS.with(|todos| {
        todos.borrow()
            .values()
            .cloned()
            .collect()
    })
}

#[update]
fn update_todo(id: u64, title: Option<String>, description: Option<String>, completed: Option<bool>) -> Option<Todo> {
    TODOS.with(|todos| {
        if let Some(todo) = todos.borrow_mut().get_mut(&id) {
            if let Some(title) = title {
                todo.title = title;
            }
            if let Some(description) = description {
                todo.description = description;
            }
            if let Some(completed) = completed {
                todo.completed = completed;
            }
            todo.updated_at = time();
            Some(todo.clone())
        } else {
            None
        }
    })
}

#[update]
fn delete_todo(id: u64) -> bool {
    TODOS.with(|todos| {
        todos.borrow_mut().remove(&id).is_some()
    })
}

#[update]
fn toggle_todo(id: u64) -> Option<Todo> {
    TODOS.with(|todos| {
        if let Some(todo) = todos.borrow_mut().get_mut(&id) {
            todo.completed = !todo.completed;
            todo.updated_at = time();
            Some(todo.clone())
        } else {
            None
        }
    })
}

#[query]
fn get_todos_by_status(completed: bool) -> Vec<Todo> {
    TODOS.with(|todos| {
        todos.borrow()
            .values()
            .filter(|todo| todo.completed == completed)
            .cloned()
            .collect()
    })
}

#[query]
fn get_todo_count() -> u64 {
    TODOS.with(|todos| {
        todos.borrow().len() as u64
    })
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
