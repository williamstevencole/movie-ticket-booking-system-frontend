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
  selector: 'app-register',
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
            <h1>Creá tu cuenta<br>en un minuto.</h1>
            <p>Compra rápida, historial de boletos, recordatorios de tus funciones y cupones exclusivos. Sin costo de membresía.</p>
          </div>

          <div class="brand-foot">
            <span class="dot"></span>
            <span>Más de 2 400 clientes activos en HN</span>
          </div>
        </div>
      </aside>

      <!-- panel derecho (form) -->
      <section class="form-panel">
        <div class="form-card">
          <div class="form-head">
            <h2>Crear cuenta</h2>
            <p>Completá tus datos para empezar a comprar boletos al instante.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body" novalidate>
            <div class="field">
              <label for="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                autocomplete="name"
                class="input"
                [class.invalid]="invalid('nombre')"
                placeholder="María Pineda"
                formControlName="nombre"
              />
              @if (invalid('nombre')) {
                <span class="err">Ingresá tu nombre.</span>
              }
            </div>

            <div class="field">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autocomplete="email"
                class="input"
                [class.invalid]="invalid('email')"
                placeholder="tucorreo@dominio.com"
                formControlName="email"
              />
              @if (invalid('email')) {
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
              <label for="telefono">
                Teléfono <span class="opt">(opcional)</span>
              </label>
              <input
                id="telefono"
                type="tel"
                autocomplete="tel"
                class="input"
                placeholder="+504 9999-9999"
                formControlName="telefono"
              />
            </div>

            <div class="field">
              <label for="password">Contraseña</label>
              <div class="pw-wrap">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="input"
                  [class.invalid]="invalid('password')"
                  placeholder="Mínimo 6 caracteres"
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
              @if (invalid('password')) {
                <span class="err">
                  @if (form.controls.password.errors?.['required']) {
                    Ingresá una contraseña.
                  } @else {
                    Mínimo 6 caracteres.
                  }
                </span>
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
                Creando cuenta…
              } @else {
                <span>Crear cuenta</span>
                <svg lucideArrowRight [size]="18"></svg>
              }
            </button>

            <p class="signup">
              ¿Ya tenés una cuenta? <a routerLink="/login">Iniciá sesión</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private location = inject(LocationService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: [''],
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(
        homeAfterLogin(this.auth.role(), this.location.hasSelection()),
      );
    }
  }

  invalid(field: 'nombre' | 'email' | 'password'): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || c.dirty);
  }

  onSubmit() {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    this.auth
      .register({
        nombre: raw.nombre,
        email: raw.email,
        password: raw.password,
        ...(raw.telefono ? { telefono: raw.telefono } : {}),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl(
        homeAfterLogin(this.auth.role(), this.location.hasSelection()),
      );
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 409) {
            this.errorMsg.set('Ese correo ya está registrado. Probá iniciar sesión.');
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
