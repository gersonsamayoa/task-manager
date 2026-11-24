export interface Task {
  id: number;
  user_id: number;
  priority_id: number;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}