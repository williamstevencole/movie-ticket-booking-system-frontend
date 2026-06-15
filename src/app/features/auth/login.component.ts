import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideEye,
  LucideEyeOff,
} from '@lucide/angular';
import { AuthService } from '../../shared/services/auth.service';
import { LocationService } from '../../shared/services/location.service';
import { homeAfterLogin } from '../../core/auth/role-redirect';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAlertCircle,
    LucideArrowRight,
    LucideEye,
    LucideEyeOff,
  ],
  template: `
    <div class="login-page">
      <!-- panel izquierdo (brand) -->
      <aside class="brand-panel">
        <div class="brand-panel-inner">
          <a class="brand" routerLink="/">
            <span class="mark">C</span>
            <span class="name">Cinetario</span>
          </a>

          <div class="brand-hero">
            <h1>El cine empieza<br>cuando bajan<br>las luces.</h1>
            <p>Cartelera al día, asientos en tiempo real, boletos por correo. Inicia sesión para comprar tus boletos.</p>
          </div>

          <div class="brand-foot">
            <span class="dot"></span>
            <span>Tegucigalpa · 14 funciones hoy</span>
          </div>
        </div>
      </aside>

      <!-- panel derecho (form) -->
      <section class="form-panel">
        <div class="form-card">
          <div class="form-head">
            <h2>Iniciar sesión</h2>
            <p>Ingresa con el correo y la contraseña de tu cuenta de Cinetario.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body" novalidate>
            <div class="field">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autocomplete="email"
                class="input"
                [class.invalid]="emailInvalid()"
                placeholder="tucorreo@dominio.com"
                formControlName="email"
              />
              @if (emailInvalid()) {
                <span class="err">
                  @if (form.controls.email.errors?.['required']) {
                    Ingresá tu correo.
                  } @else {
                    Ese correo no es válido.
                  }
                </span>
              }
            </div>

            <div class="field">
              <label for="password">
                Contraseña
                <a class="forgot" routerLink="/olvide-password">¿La olvidaste?</a>
              </label>
              <div class="pw-wrap">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  class="input"
                  [class.invalid]="pwInvalid()"
                  placeholder="••••••••"
                  formControlName="password"
                />
                <button
                  type="button"
                  class="pw-toggle"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  @if (showPassword()) {
                    <svg lucideEyeOff [size]="16"></svg>
                  } @else {
                    <svg lucideEye [size]="16"></svg>
                  }
                </button>
              </div>
              @if (pwInvalid()) {
                <span class="err">Ingresá tu contraseña.</span>
              }
            </div>

            @if (errorMsg()) {
              <div class="alert">
                <svg lucideAlertCircle [size]="18" class="alert-ico"></svg>
                <span>{{ errorMsg() }}</span>
              </div>
            }

            <button
              type="submit"
              class="btn btn-primary btn-lg btn-block"
              [disabled]="loading()"
            >
              @if (loading()) {
                Verificando…
              } @else {
                <span>Entrar</span>
                <svg lucideArrowRight [size]="18"></svg>
              }
            </button>

            <p class="signup">
              ¿Primera vez en Cinetario? <a routerLink="/registro">Crear cuenta</a>
            </p>
          </form>
        </div>

        <footer class="form-foot">
          © 2026 Cinetario · Hecho en Honduras
        </footer>
      </section>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private location = inject(LocationService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(
        homeAfterLogin(this.auth.role(), this.location.hasSelection()),
      );
    }
  }

  emailInvalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.touched || c.dirty);
  }

  pwInvalid(): boolean {
    const c = this.form.controls.password;
    return c.invalid && (c.touched || c.dirty);
  }

  onSubmit() {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(
        homeAfterLogin(this.auth.role(), this.location.hasSelection()),
      );
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMsg.set('Correo o contraseña incorrectos.');
        } else if (err.status === 0) {
          this.errorMsg.set('No pudimos conectar con el servidor. ¿Está arriba la API?');
        } else {
          const apiMsg = (err.error as { message?: string | string[] })?.message;
          this.errorMsg.set(
            Array.isArray(apiMsg) ? apiMsg.join(' · ') : apiMsg || 'Ocurrió un error inesperado.',
          );
        }
      },
    });
  }
}
