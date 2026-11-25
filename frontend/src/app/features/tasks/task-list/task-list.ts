import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../shared/models/task.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Priority } from '../../../shared/models/priority.model';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {

  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  priorities = signal<Priority[]>([]);

  tasks = signal<Task[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isUserMenuOpen = signal(false);
  user = this.authService.getUser();
  editingTask = signal<Task | null>(null);
  editForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority_id: [1, Validators.required],
    status: ['pendiente', Validators.required],
    due_date: ['']
  });
  isClosing = signal(false);
  isCreating = signal(false);
  taskToDelete = signal<Task | null>(null);
  isDeleteClosing = signal(false);
  deletedTasks = signal<Task[]>([]);
  showTrash = signal(false);


  loadPriorities(): void {
    this.taskService.getPriorities().subscribe({
      next: (response) => {
        this.priorities.set(response.prioridades);
        console.log('Prioridades cargadas:', this.priorities());
      },
      error: (error) => {
        console.error('Error al obtener prioridades:', error);
      }
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadPriorities();
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

  editTask(task: Task): void {
    this.editingTask.set(task);

    this.editForm.patchValue({
      title: task.title,
      description: task.description || '',
      priority_id: task.priority_id,
      status: task.status,
      due_date: task.due_date ? task.due_date.substring(0, 10) : ''
    });
  }

  saveTask(): void {

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const values = this.editForm.getRawValue();

    const taskData = {
      title: values.title ?? '',
      description: values.description ?? '',
      priority_id: values.priority_id ?? 1,
      status: values.status ?? 'pending',
      due_date: values.due_date || null
    };

    // CREAR UNA TAREA
    if (this.isCreating()) {

      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.closeEditModal();
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.mensaje || 'No fue posible crear la tarea.'
          );
          console.error('Error al crear tarea:', error);
        }
      });

      return;
    }

    // ACTUALIZAR UNA TAREA
    const task = this.editingTask();

    if (!task) {
      return;
    }

    this.taskService.updateTask(task.id, taskData).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.mensaje || 'No fue posible actualizar la tarea.'
        );
        console.error('Error al actualizar tarea:', error);
      }
    });
  }

  closeEditModal(): void {
    this.isClosing.set(true);

    setTimeout(() => {
      this.editingTask.set(null);
      this.isCreating.set(false);
      this.isClosing.set(false);
    }, 350);
  }

  openCreateModal(): void {
    this.editingTask.set(null);
    this.isCreating.set(true);
    this.isClosing.set(false);

    this.editForm.reset({
      title: '',
      description: '',
      priority_id: 1,
      status: 'pending',
      due_date: ''
    });
  }

  confirmDelete(): void {

    const task = this.taskToDelete();

    if (!task) {
      return;
    }

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.mensaje || 'No fue posible eliminar la tarea.'
        );
        console.error('Error al eliminar tarea:', error);
      }
    });
  }

  openDeleteModal(task: Task): void {
    this.taskToDelete.set(task);
  }

  closeDeleteModal(): void {
    this.isDeleteClosing.set(true);

    setTimeout(() => {
      this.taskToDelete.set(null);
      this.isDeleteClosing.set(false);
    }, 350);
  }

  loadDeletedTasks(): void {
  this.taskService.getDeletedTasks().subscribe({
    next: (response) => {
      this.deletedTasks.set(response.tareas);
      console.log('Tareas eliminadas:', this.deletedTasks());
    },
    error: (error) => {
      console.error('Error al obtener tareas eliminadas:', error);
    }
  });
}

showTasks(): void {
  this.showTrash.set(false);
}

showTrashSection(): void {
  this.showTrash.set(true);
  this.loadDeletedTasks();
}

restoreTask(id: number): void {
  this.taskService.restoreTask(id).subscribe({
    next: () => {
      this.loadDeletedTasks();
      this.loadTasks();
    },
    error: (error) => {
      this.errorMessage.set(
        error.error?.mensaje || 'No fue posible restaurar la tarea.'
      );
      console.error('Error al restaurar tarea:', error);
    }
  });
}

}