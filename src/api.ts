import type { Todo } from "./types";

const API_URL = "https://mate.academy/students-api/todos";

const USER_ID = 48291;

export const getTodos = async (): Promise<Todo[]> => {
  const res = await fetch(`${API_URL}?userId=${USER_ID}`);
  if (!res.ok) throw new Error("Не вдалося завантажити");
  return res.json();
};

export const addTodo = async (title: string): Promise<Todo> => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, title, completed: false }),
    });
    if (!res.ok) throw new Error("Не вдалося додати задачу");
    return await res.json();
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : "Помилка з'єднання з сервером"
    );
  }
};


export const updateTodo = async (id: number, completed: boolean): Promise<Todo> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Не вдалося оновити задачу");
  return res.json();
};

export const deleteTodo = async (id: number) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};

export async function updateTodoTitle(id: number, title: string): Promise<Todo> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Не вдалося оновити задачу");
  return response.json();
}