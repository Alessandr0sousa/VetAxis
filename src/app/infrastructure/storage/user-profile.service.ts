import { Injectable, PLATFORM_ID, inject, signal, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserProfile } from '../../models/user-profile.model';

/**
 * Service responsible for managing user profile data in sessionStorage.
 * Handles SSR-compatible persistent storage of user information.
 */
@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userProfile = signal<UserProfile | null>(null);
  private readonly storageKey = 'userProfile';

  constructor() {
    // Carrega o perfil após a aplicação estar inicializada
    afterNextRender(() => {
      this.loadUserProfile();
    });
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile.set(profile);
    if (this.isBrowser()) {
      sessionStorage.setItem(this.storageKey, JSON.stringify(profile));
    }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile();
  }

  isProfileValid(): boolean {
    const profile = this.userProfile();
    return !!(profile && profile.clinicaId && profile.clinicaId > 0);
  }

  getClinicaId(): number {
    const profile = this.userProfile();
    return profile?.clinicaId ?? 0;
  }

  clearUserProfile(): void {
    this.userProfile.set(null);
    if (this.isBrowser()) {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  private loadUserProfile(): void {
    if (!this.isBrowser()) {
      return;
    }

    const profile = sessionStorage.getItem(this.storageKey);
    if (profile) {
      try {
        this.userProfile.set(JSON.parse(profile));
      } catch {
        console.error('Failed to parse user profile from storage');
        this.userProfile.set(null);
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
