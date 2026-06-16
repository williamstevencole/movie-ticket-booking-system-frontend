import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideEye,
  LucideEyeOff,
} from '@lucide/angular';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
      <aside class="brand-panel">
        <div class="brand-panel-inner">
          <a class="brand" routerLink="/">
            <span class="mark">C</span><span class="name">Cinetario</span>
          </a>
          <div class="brand-hero">
            <h1>Crear nueva contraseña</h1>
            <p>Ingresá una contraseña segura. No compartas este enlace.</p>
          </div>
          <div class="brand-foot">
          </div>
        </div>
      </aside>

      <section class="form-panel">
        <div class="form-card">
          <div class="form-head">
            <h2>Nueva contraseña</h2>
            <p>Completá el formulario para establecer una nueva contraseña.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body" novalidate>
            <div class="field">
              <label for="password">Contraseña</label>
              <div class="pw-wrap">
                <input id="password" [type]="showPassword() ? 'text' : 'password'" class="input"
                  [class.invalid]="invalid('password')" placeholder="Mínimo 6 caracteres" formControlName="password" />
                <button type="button" class="pw-toggle" (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  <svg *ngIf="showPassword()" lucideEyeOff [size]="16"></svg>
                  <svg *ngIf="!showPassword()" lucideEye [size]="16"></svg>
                </button>
              </div>
              <span *ngIf="invalid('password')" class="err">
                {{ form.controls.password.errors?.['required'] ? 'Ingresá una contraseña.' : 'Mínimo 6 caracteres.' }}
              </span>
            </div>
            <div class="field">
                <label for="confirmPassword">Confirmar contraseña</label>
                    <div class="pw-wrap">
                        <input id="confirmPassword" [type]="showPassword() ? 'text' : 'password'" class="input"
                          [class.invalid]="invalid('confirmPassword') || passwordsDontMatch()" placeholder="Repetí la contraseña" formControlName="confirmPassword"/>
                        <button       type="button"      class="pw-toggle"      (click)="showPassword.set(!showPassword())"
                          [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                          <svg *ngIf="showPassword()" lucideEyeOff [size]="16"></svg>
                          <svg *ngIf="!showPassword()" lucideEye [size]="16"></svg>
                        </button>
                    </div>

              <span *ngIf="invalid('confirmPassword')" class="err">Repetí la contraseña.</span>
              <span *ngIf="passwordsDontMatch()" class="err"> Las contraseñas no coinciden.</span>
            </div>

            <div *ngIf="errorMsg()" class="alert">
              <svg lucideAlertCircle [size]="18" class="alert-ico"></svg>
              <span>{{ errorMsg() }}</span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="loading()">
              <ng-container *ngIf="loading(); else label">Guardando…</ng-container>
              <ng-template #label>
                <span>Guardar contraseña</span>
                <svg lucideArrowRight [size]="18"></svg>
              </ng-template>
            </button>

            <p class="signup">Volver a <a routerLink="/login">Iniciar sesión</a></p>
          </form>
        </div>

        <footer class="form-foot">© 2026 Cinetario · Hecho en Honduras</footer>
      </section>
    </div>
  `,
  styleUrl: '../login.component.scss',
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPassword = signal(false);
  private token = '';

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator },
  );
  passwordsMatchValidator(group: any) {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw === cpw ? null : { mismatch: true };
  }

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMsg.set('Token inválido o expirado.');
    }
  }

  invalid(field: 'password' | 'confirmPassword'): boolean {
  const c = this.form.controls[field];
  return c.invalid && (c.touched || c.dirty);
}


  passwordsDontMatch(): boolean {
    return this.form.errors?.['mismatch'] && this.form.touched;
  }

  onSubmit() {
    if (this.form.errors?.['mismatch']) {
  this.errorMsg.set('Las contraseñas no coinciden.');
  return;
}

    this.errorMsg.set(null);
    if (!this.token) {
      this.errorMsg.set('Token inválido o expirado.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { password } = this.form.getRawValue();
    this.auth.resetPassword(this.token, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/login');
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 400 || err.status === 410) {
          this.errorMsg.set(
            'Token inválido o expirado. Solicitá un nuevo enlace.',
          );
        } else if (err.status === 0) {
          this.errorMsg.set(
            'No pudimos conectar con el servidor. Intentá de nuevo más tarde.',
          );
        } else {
          const apiMsg = (err.error as { message?: string | string[] })
            ?.message;
          this.errorMsg.set(
            Array.isArray(apiMsg)
              ? apiMsg.join(' · ')
              : apiMsg || 'Ocurrió un error inesperado.',
          );
        }
      },
    });
  }
}
