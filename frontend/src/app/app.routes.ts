import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { TaskList } from './features/tasks/task-list/task-list';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'tasks',
    component: TaskList,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];