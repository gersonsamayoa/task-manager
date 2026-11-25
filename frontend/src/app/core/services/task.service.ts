import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../shared/models/task.model';
import { Priority } from '../../shared/models/priority.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/tasks';

  //Servicio para obtener las tareas del usuario autenticado
  getTasks(): Observable<{ mensaje: string; tareas: Task[] }> {
    return this.http.get<{ mensaje: string; tareas: Task[] }>(
      this.apiUrl
    );
  }

  //Servicio para obtener las tareas eliminadas
getDeletedTasks(): Observable<{ mensaje: string; tareas: Task[] }> {
  return this.http.get<{ mensaje: string; tareas: Task[] }>(
    `${this.apiUrl}/deleted`
  );
}

  //Servicio para obtener las prioridades
  getPriorities(): Observable<{ mensaje: string; prioridades: Priority[] }> {
  return this.http.get<{ mensaje: string; prioridades: Priority[] }>(
    'http://localhost:3000/api/priorities'
  );
}

  //Servicio para actualizar una tarea específica
  updateTask(id: number, task: Partial<Task>): Observable<{ mensaje: string }> {
  return this.http.patch<{ mensaje: string }>(
    `${this.apiUrl}/${id}`,
    task
  );
}

//Servicio para crear una nueva tarea
createTask(task: Partial<Task>): Observable<{ mensaje: string }> {
  return this.http.post<{ mensaje: string }>(
    this.apiUrl,
    task
  );
}

//Servicio para eliminar una tarea específica
deleteTask(id: number): Observable<{ mensaje: string }> {
  return this.http.delete<{ mensaje: string }>(
    `${this.apiUrl}/${id}`
  );
}

//Servicio para restaurar una tarea específica
restoreTask(id: number): Observable<{ mensaje: string }> {
  return this.http.patch<{ mensaje: string }>(
    `${this.apiUrl}/${id}/restore`,
    {}
  );
}



}