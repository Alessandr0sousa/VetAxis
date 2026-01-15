import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  // sinal reativo com os totais
  qtds = signal<Record<string, number>>({});

  updateQtd(key: string, value: number) {
    const current = this.qtds();
    this.qtds.set({ ...current, [key]: value });
  }

  getQtd(key: string): number {
    return this.qtds()[key] ?? 0;
  }
}
