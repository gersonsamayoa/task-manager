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

  // Obtener perfil del usuario autenticado
  getProfile(): Observable<{ mensaje: string; usuario: User }> {
    return this.http.get<{ mensaje: string; usuario: User }>(
      `${this.apiUrl}/profile`
    );
  }

  // Actualizar perfil del usuario autenticado
  updateProfile(data: { name: string; email: string }): Observable<{ mensaje: string; usuario: User }> {
    return this.http.patch<{ mensaje: string; usuario: User }>(
      `${this.apiUrl}/profile`,
      data
    ).pipe(
      tap(response => {
        localStorage.setItem(
          'task_manager_user',
          JSON.stringify(response.usuario)
        );
      })
    );
  }

  // Cambiar contraseña del usuario autenticado
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.apiUrl}/change-password`,
      data
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
