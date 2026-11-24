import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, RegisterRequest, LoginRequest, User } from '../../shared/models/auth.model';
import { TokenService } from './token.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenService = inject(TokenService);

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/users';

  //Registrar un nuevo usuario
  register(data: RegisterRequest): Observable<{ mensaje: string; usuario: User }> {
    return this.http.post<{ mensaje: string; usuario: User }>(
      `${this.apiUrl}/register`,
      data
    );

  }

  //Login para usuario existente
  login(data: LoginRequest): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      data
    ).pipe(
      tap(response => {
        this.tokenService.saveToken(response.token);

        localStorage.setItem(
          'task_manager_user',
          JSON.stringify(response.usuario)
        );
      })
    );

  }


  //Cerrar sesión
  logout(): void {
  this.tokenService.removeToken();
  localStorage.removeItem('task_manager_user');
}

  //Verificar si el usuario está autenticado
  getUser(): User | null {
  const user = localStorage.getItem('task_manager_user');

  return user ? JSON.parse(user) as User : null;
}

}
