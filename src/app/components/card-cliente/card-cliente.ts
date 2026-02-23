import { Component, computed, inject } from '@angular/core';
import { UserProfileService } from '../services/user-profile-service';

@Component({
  selector: 'app-card-company',
  imports: [],
  templateUrl: './card-cliente.html',
  styleUrl: './card-cliente.scss',
})
export class CardCompany {
  private readonly userProfileService = inject(UserProfileService);

  cliente = computed(() => {
    const profile = this.userProfileService.getUserProfile();
    return {
      nome: profile?.clinicaNome || 'Cliente Exemplo',
      telefone: '(11) 98765-4321',
      email: profile?.login || 'cliente@exemplo.com',
      logo: profile?.clinicaLogo
    };
  });
}
