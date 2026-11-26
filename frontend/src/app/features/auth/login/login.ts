import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage: string | null = null;
  isLoading: boolean = false;
  successMessage: string | null = null;
  showPassword: boolean = false;

  onSubmit(): void {

    this.errorMessage = null;
    this.successMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const datos = this.loginForm.getRawValue();

    this.authService.login({
      email: datos.email!,
      password: datos.password!
    }).subscribe({
      next: () => {
        this.successMessage = '¡Credenciales correctas! Sesión iniciada correctamente.';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/tasks']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error.error?.mensaje ||
          'No fue posible iniciar sesión. Verifica tus credenciales.';

        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500);

        console.error('Error al iniciar sesión:', error);
      }
    });

  }

}