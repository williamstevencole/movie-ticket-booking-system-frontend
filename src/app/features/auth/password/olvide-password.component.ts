import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { LucideArrowRight, LucideAlertCircle } from '@lucide/angular';

@Component({
  selector: 'app-olvide-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideArrowRight,
    LucideAlertCircle,
  ],
  templateUrl: './olvide-password.component.html',
  styleUrls: ['../login.component.scss'],
})
export class OlvidePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly loading = signal(false);
  readonly done = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  invalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.touched || c.dirty);
  }

  onSubmit() {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const email = this.form.controls.email.value;

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.done.set(true);
      },
    });
  }
}
