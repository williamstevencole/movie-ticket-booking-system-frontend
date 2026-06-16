import { Injectable, signal } from '@angular/core';

export type ToastMessage = {
  id: number;
  text: string;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly messages = signal<ToastMessage[]>([]);

  show(text: string, durationMs = 2500): void {
    const id = ++this.seq;
    this.messages.update((list) => [...list, { id, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}
