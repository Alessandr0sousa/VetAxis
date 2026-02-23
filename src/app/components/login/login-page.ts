import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Login } from './login';
import { AutenticacaoService } from '../services/autenticacao-service';
import { AuthTokenService } from '../services/auth-token-service';
import { UserProfileService } from '../services/user-profile-service';
import { NavigationStateService } from '../services/navigation-state-service';
import { AlertService } from '../services/alert-service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, Login],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AutenticacaoService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(AuthTokenService);
  private readonly navState = inject(NavigationStateService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.errorMessage.set(null);
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email!;
    const password = this.form.value.password!;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .autenticar(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.handleLoginSuccess(response),
        error: () => this.handleLoginError(),
      });
  }

  private handleLoginSuccess(response: any): void {
    this.tokenService.setToken(response.token);
    this.userProfileService.setUserProfile({
      nome: response.nome,
      login: response.login,
      role: response.role,
      clinicaId: response.clinicaId,
      clinicaNome: response.clinicaNome,
      clinicaLogo: response.clinicaLogo,
    });

    this.alertService.success(`Seja bem vindo, ${response.nome}!`);
    this.loading.set(false);
    this.form.reset();

    const targetRoute = this.navState.consumeLastRoute() ?? '/dashboard';
    this.router.navigateByUrl(targetRoute);
  }

  private handleLoginError(): void {
    this.alertService.error('Erro ao autenticar. Verifique suas credenciais.');
    this.loading.set(false);
  }
}
