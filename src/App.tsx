import { useState, useEffect } from "react";
import * as api from "./api";
import type { Todo, Filter } from "./types";
import "./App.css";

type Theme = "light" | "dark";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    api
      .getTodos()
      .then(setTodos)
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const addTodo = async () => {
    if (!text.trim()) return;
    const newTodo = await api.addTodo(text.trim());
    setTodos([...todos, newTodo]);
    setText("");
  };

  const toggleTodo = async (todo: Todo) => {
    const updated = await api.updateTodo(todo.id, !todo.completed);
    setTodos(todos.map((todo) => (todo.id === updated.id ? updated : todo)));
  };

  const deleteTodo = async (id: number) => {
    await api.deleteTodo(id);
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Todo</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
      <div className="form">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addTodo()}
          placeholder="Нова задача"
        />
        <button onClick={addTodo} disabled={!text.trim()}>
          Додати
        </button>
      </div>

      {loading && <p>Завантаження...</p>}
      {error && <p>{error}</p>}

      <div className="filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "active" ? "active" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Complete
        </button>
      </div>

      <ul>
        {visibleTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "done" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span>{todo.title}</span>
            <button onClick={() => deleteTodo(todo.id)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
