import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/auth.model';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {

  private router = inject(Router);

  private authService = inject(AuthService);

  user: User | null = this.authService.getUser();

  // Controlar la edición del perfil
  editingProfile = signal(false);

  // Datos del formulario
  profileForm = signal({
    name: '',
    email: ''
  });

  // Mensajes
  profileMessage = signal('');
  profileError = signal('');

  // Controlar cambio de contraseña
  changingPassword = signal(false);

  // Datos del formulario de contraseña
  passwordForm = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mensajes de contraseña
  passwordMessage = signal('');
  passwordError = signal('');

  // Controlar visibilidad de cada contraseña
  passwordVisibility = signal({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Controlar envíos repetidos
  savingProfile = signal(false);
  savingPassword = signal(false);

  goToTasks() {
    this.router.navigate(['/tasks']);
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.user = response.usuario;

        localStorage.setItem(
          'task_manager_user',
          JSON.stringify(response.usuario)
        );
      },
      error: (error) => {
        console.error('Error al obtener perfil:', error);
      }
    });
  }

  // Abrir formulario de edición
  openEditProfile(): void {
    if (!this.user) return;

    this.profileForm.set({
      name: this.user.name,
      email: this.user.email
    });

    this.profileMessage.set('');
    this.profileError.set('');
    this.editingProfile.set(true);
  }

  // Cancelar edición del perfil
  cancelEditProfile(): void {
    this.editingProfile.set(false);
    this.profileMessage.set('');
    this.profileError.set('');
  }

  // Guardar cambios del perfil
  saveProfile(): void {

    const data = this.profileForm();

    if (!data.name.trim() || !data.email.trim()) {
      this.profileError.set('Todos los campos son obligatorios');
      return;
    }

    this.profileMessage.set('');
    this.profileError.set('');

    this.authService.updateProfile({
      name: data.name,
      email: data.email
    }).subscribe({

      next: (response) => {
        this.user = response.usuario;

        this.profileMessage.set(response.mensaje);
        this.editingProfile.set(false);
      },

      error: (error) => {
        this.profileError.set(
          error.error?.mensaje || 'Error al actualizar el perfil'
        );
      }

    });

  }

  // Actualizar campos del formulario
  updateProfileField(field: 'name' | 'email', value: string): void {
    this.profileForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  // Abrir formulario de cambio de contraseña
  openChangePassword(): void {
    this.passwordForm.set({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    this.passwordMessage.set('');
    this.passwordError.set('');
    this.changingPassword.set(true);
  }

  // Cancelar cambio de contraseña
  cancelChangePassword(): void {
    this.changingPassword.set(false);
    this.passwordMessage.set('');
    this.passwordError.set('');
  }

  updatePasswordField(
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    value: string
  ): void {
    this.passwordForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  savePassword(): void {

    if (this.savingPassword()) return;

    this.savingPassword.set(true);
    const data = this.passwordForm();

    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      this.passwordError.set('Todos los campos son obligatorios');
      return;
    }

    if (data.newPassword.length < 8) {
      this.passwordError.set('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      this.passwordError.set('Las contraseñas nuevas no coinciden');
      return;
    }

    this.passwordMessage.set('');
    this.passwordError.set('');

    this.authService.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }).subscribe({
      next: (response) => {
        this.passwordMessage.set(response.mensaje);
        this.changingPassword.set(false);
        this.passwordForm.set({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        this.savingPassword.set(false);
      },
      error: (error) => {
        this.passwordError.set(
          error.error?.mensaje || 'Error al cambiar la contraseña'
        );
        this.savingPassword.set(false);
      }
    });
  }

  togglePasswordVisibility(
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    visible: boolean
  ): void {
    this.passwordVisibility.update(state => ({
      ...state,
      [field]: visible
    }));
  }



}