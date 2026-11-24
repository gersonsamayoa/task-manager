import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../shared/models/task.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {

  private taskService = inject(TaskService);
  private authService = inject(AuthService);
private router = inject(Router);

  tasks = signal<Task[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isUserMenuOpen = signal(false);
  user = this.authService.getUser();

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {

    this.isLoading.set(true);
    this.errorMessage.set(null);
    

    this.taskService.getTasks().subscribe({

      next: (response) => {
        this.tasks.set(response.tareas);
        this.isLoading.set(false);
      },

      error: (error) => {
        this.isLoading.set(false);

        this.errorMessage.set(
          error.error?.mensaje || 'No fue posible obtener las tareas.'
        );

        console.error('Error al obtener tareas:', error);
      }

    });

  }

  logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}

toggleUserMenu(): void {
  this.isUserMenuOpen.update(open => !open);
}

}