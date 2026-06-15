import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-host" aria-live="polite">
      @for (m of toast.messages(); track m.id) {
        <div class="toast">{{ m.text }}</div>
      }
    </div>
  `,
  styles: `
    .toast-host {
      position: fixed;
      bottom: var(--s6, 24px);
      right: var(--s6, 24px);
      z-index: 300;
      display: flex;
      flex-direction: column;
      gap: var(--s2, 8px);
      pointer-events: none;
    }
    .toast {
      padding: var(--s3, 12px) var(--s4, 16px);
      background: var(--ink);
      color: white;
      border-radius: var(--r, 10px);
      font-size: 14px;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      animation: slideIn 200ms var(--ease, ease);
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
