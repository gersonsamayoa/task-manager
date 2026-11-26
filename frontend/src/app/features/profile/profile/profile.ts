import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/auth.model';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {

  private router = inject(Router);

  private authService = inject(AuthService);

  user: User | null = this.authService.getUser();

  goToTasks() {
  this.router.navigate(['/tasks']);
}

}