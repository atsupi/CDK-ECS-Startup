import { useEffect, useState } from 'react';

interface Todo {
  id: number;
  task: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');

  // Fetching from relative path '/api/todos'
  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (e) {
      console.error("Failed to fetch todos", e);
    }
  };

  const addTodo = async () => {
    if (!task) return;
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    setTask('');
    fetchTodos();
  };

  useEffect(() => { fetchTodos(); }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ECS ToDo App</h1>
      <input 
        value={task} 
        onChange={(e) => setTask(e.target.value)} 
        placeholder="What needs to be done?"
      />
      <button onClick={addTodo}>Add Task</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.task}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
