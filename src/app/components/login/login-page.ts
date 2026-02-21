import { Router } from '@angular/router';
import { AlertService } from './../services/alert-service';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Login } from './login';
import { AutenticacaoService } from '../services/autenticacao-service';
import { AuthTokenService } from '../services/auth-token-service';
import { NavigationStateService } from '../services/navigation-state-service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, Login],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private authService: AutenticacaoService,
    private swa: AlertService,
    private router: Router,
    private tokenService: AuthTokenService,
    private navState: NavigationStateService
  ) {
    this.form.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const email = this.form.value.email!;
    const senha = this.form.value.password!;

    this.authService.autenticar(email, senha).subscribe({
      next: (response) => {
        this.tokenService.setToken(response.token);
        this.swa.success('Seja bem vindo, ' + response.nome + '!');
        this.loading.set(false);
        this.form.reset();
        const target = this.navState.consumeLastRoute() ?? '/dashboard';
        this.router.navigateByUrl(target);
      },
      error: (error) => {
        this.swa.error('Erro ao autenticar. Verifique suas credenciais.');
        this.loading.set(false);
      },
    });
  }
}
