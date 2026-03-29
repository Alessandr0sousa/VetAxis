import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Login } from './login';
import { AutenticacaoService } from '@core/services';
import { AuthTokenService, UserProfileService, NavigationStateService } from '@infrastructure/storage';
import { AlertService } from '@shared/services';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, Login],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  private fb!: FormBuilder;
  private authService!: AutenticacaoService;
  private alertService!: AlertService;
  private router!: Router;
  private tokenService!: AuthTokenService;
  private navState!: NavigationStateService;
  private userProfileService!: UserProfileService;
  private destroyRef!: DestroyRef;

  readonly form!: any;
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    fb: FormBuilder,
    authService: AutenticacaoService,
    alertService: AlertService,
    router: Router,
    tokenService: AuthTokenService,
    navState: NavigationStateService,
    userProfileService: UserProfileService,
    destroyRef: DestroyRef
  ) {
    this.fb = fb;
    this.authService = authService;
    this.alertService = alertService;
    this.router = router;
    this.tokenService = tokenService;
    this.navState = navState;
    this.userProfileService = userProfileService;
    this.destroyRef = destroyRef;

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });

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

    // Após login, sempre iniciar no dashboard.
    this.router.navigateByUrl('/dashboard');
  }

  private handleLoginError(): void {
    this.alertService.error('Erro ao autenticar. Verifique suas credenciais.');
    this.loading.set(false);
  }
}
