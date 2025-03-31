import React, { useState, useEffect } from 'react';
import { Todo } from './declarations/todo_app_backend/todo_app_backend.did';
import { todo_app_backend } from './declarations/todo_app_backend';

function App() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState({ title: '', description: '' });
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        loadTodos();
    }, [filter]);

    const loadTodos = async () => {
        try {
            let loadedTodos: Todo[] = [];
            switch (filter) {
                case 'active':
                    loadedTodos = await todo_app_backend.get_todos_by_status(false);
                    break;
                case 'completed':
                    loadedTodos = await todo_app_backend.get_todos_by_status(true);
                    break;
                default:
                    loadedTodos = await todo_app_backend.get_all_todos();
            }
            setTodos(loadedTodos);
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    };

    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.title.trim()) return;

        try {
            await todo_app_backend.create_todo(newTodo.title, newTodo.description);
            setNewTodo({ title: '', description: '' });
            loadTodos();
        } catch (error) {
            console.error('Error creating todo:', error);
        }
    };

    const handleToggleTodo = async (id: bigint) => {
        try {
            await todo_app_backend.toggle_todo(id);
            loadTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const handleDeleteTodo = async (id: bigint) => {
        try {
            await todo_app_backend.delete_todo(id);
            loadTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Todo List</h1>

            <form onSubmit={handleCreateTodo} className="mb-8">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Todo title"
                        value={newTodo.title}
                        onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={newTodo.description}
                        onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Add Todo
                    </button>
                </div>
            </form>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Completed
                </button>
            </div>

            <div className="space-y-4">
                {todos.map((todo) => (
                    <div
                        key={Number(todo.id)}
                        className="flex items-center gap-4 p-4 border rounded"
                    >
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id)}
                            className="h-5 w-5"
                        />
                        <div className="flex-1">
                            <h3 className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                {todo.title}
                            </h3>
                            {todo.description && (
                                <p className={`text-gray-600 ${todo.completed ? 'line-through' : ''}`}>
                                    {todo.description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App; 