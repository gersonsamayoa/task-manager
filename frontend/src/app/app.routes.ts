import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { TaskList } from './features/tasks/task-list/task-list';
import { authGuard } from './core/guards/auth.guard';
import { Profile } from './features/profile/profile/profile';

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
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];