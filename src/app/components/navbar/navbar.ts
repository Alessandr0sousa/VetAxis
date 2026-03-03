import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserProfileService } from '../services/user-profile-service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private userProfileService!: UserProfileService;
  private sanitizer!: DomSanitizer;

  constructor(userProfileService: UserProfileService, sanitizer: DomSanitizer) {
    this.userProfileService = userProfileService;
    this.sanitizer = sanitizer;
  }

  user = computed(() => {
    const profile = this.userProfileService.getUserProfile();
    const logoUrl = profile?.clinicaLogo || '/assets/img/logo-mini.png';

    return {
      name: profile?.nome || 'Usuário',
      company: profile?.clinicaNome || 'VetAxis Inc.',
      logo: this.sanitizer.bypassSecurityTrustUrl(logoUrl),
    };
  });
}
