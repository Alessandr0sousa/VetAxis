import { Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UserProfileService } from '@infrastructure/storage';

@Component({
	selector: 'app-navbar',
	imports: [],
	templateUrl: './navbar.html',
	styleUrl: './navbar.scss',
})
export class Navbar {
	private readonly userProfileService = inject(UserProfileService);
	private readonly sanitizer = inject(DomSanitizer);

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
