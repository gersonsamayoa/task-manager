import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../shared/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/tasks';

  getTasks(): Observable<{ mensaje: string; tareas: Task[] }> {
    return this.http.get<{ mensaje: string; tareas: Task[] }>(
      this.apiUrl
    );
  }

}