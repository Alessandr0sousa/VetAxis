import { Component, computed, inject } from '@angular/core';
import { UserProfileService } from '../services/user-profile-service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly userProfileService = inject(UserProfileService);

  user = computed(() => {
    const profile = this.userProfileService.getUserProfile();
    return {
      name: profile?.nome || 'Usuário',
      company: profile?.clinicaNome || 'VetAxis Inc.',
      logo: profile?.clinicaLogo || '/assets/img/logo-mini.png',
    };
  });
}
