export namespace TodoNS {
  export interface Todo {
    id: string;
    user_id: string;
    title: string;
    ctime: number;
    mtime: number;
  }

  export interface CreateTodoParams {
    user_id: string;
    title: string;
  }

  export interface UpdateTodoParams {
    title?: string;
  }

  export interface BLL {
    ListTodo(user_id: string): Promise<Todo[]>;
    GetTodo(id: string): Promise<Todo>;
    CreateTodo(params: CreateTodoParams): Promise<Todo>;
    UpdateTodo(id: string, params: UpdateTodoParams): Promise<Todo>; 
    DeleteTodo(id: string): Promise<void>;
  }

  export interface DAL {
    ListTodo(user_id: string): Promise<Todo[]>;
    GetTodo(id: string): Promise<Todo>;
    CreateTodo(Todo: Todo): Promise<void>;
    UpdateTodo(Todo: Todo): Promise<void>;
    DeleteTodo(id: string): Promise<void>;
  }

  export const Errors = {
    ErrTodoNotFound: new Error("Todo not found"),
  };
}
