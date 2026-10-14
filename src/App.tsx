import { useState, useEffect } from "react";
import * as api from "./api";
import type { Todo, Filter } from "./types";
import "./App.css";

type Theme = "light" | "dark";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const savedEdit = async (id: number) => {
    const title = editText.trim();
    if (!title) return;

    try {
      const updated = await api.updateTodoTitle(id, title);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updated.id ? updated : todo)),
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.filter((todo) => !todo.completed).length;
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

  const visibleTodos = todos
    .filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed))
    .filter((todo) =>
      todo.title.toLowerCase().includes(found.trim().toLowerCase()),
    );

  const addTodo = async () => {
    if (!text.trim()) return;
    const newTodo = await api.addTodo(text.trim());
    setTodos([...todos, newTodo]);
    setText("");
  };

  const clearComplete = async () => {
    const completeTodos = todos.filter((todo) => todo.completed);

    try {
      await Promise.all(completeTodos.map((todo) => api.deleteTodo(todo.id)));
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    }
  };

  const toggleTodo = async (todo: Todo) => {
    const updated = await api.updateTodo(todo.id, !todo.completed);
    setTodos(todos.map((todo) => (todo.id === updated.id ? updated : todo)));
  };

  const deleteTodo = async (id: number) => {
    await api.deleteTodo(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Todo</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="found">
        <input
          value={found}
          onChange={(event) => setFound(event.target.value)}
          placeholder="Фільтрація за назвою"
        />
      </div>

      <div className="counter">
        <p>
          Активних: {activeCount} · Виконаних: {completedCount}
        </p>
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
              onKeyDown={(event) => event.key === "Enter" && toggleTodo(todo)}
              disabled={editingId === todo.id}
            />

            {editingId === todo.id ? (
              <>
                <input
                  className="edit-input"
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") savedEdit(todo.id);
                    if (event.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                />
                <div className="item-actions">
                  <button
                    className="save-btn"
                    onClick={() => savedEdit(todo.id)}
                    disabled={!editText.trim()}
                  >
                    Зберегти
                  </button>

                  <button className="cancel-btn" onClick={cancelEdit}>
                    Скасувати
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{todo.title}</span>
                <div className="item-actions">
                  <button className="edit-btn" onClick={() => startEdit(todo)}>
                    Редагувати
                  </button>
                  <button onClick={() => deleteTodo(todo.id)}>x</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {!loading && visibleTodos.length === 0 && (
        <p className="emply">
          {todos.length === 0 ? "Задач ще немає" : "Нічого не знайдено"}
        </p>
      )}

      <div className="footer">
        <button
          className="clear-btn"
          onClick={clearComplete}
          disabled={!todos.some((t) => t.completed)}
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}

export default App;
