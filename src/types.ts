export type Todo = {
  id: number;
  text: string;
  completed:boolean,
  title:string,
  userId: number;
  done: boolean;
};

export type Filter = "all" | "active" | "completed";