import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private fireWithModalPause(options: SweetAlertOptions): Promise<SweetAlertResult<unknown>> {
    const pausedModals = this.pauseActiveModals();
    return Swal.fire(options).finally(() => {
      this.resumePausedModals(pausedModals);
    });
  }

  private pauseActiveModals(): Array<{ element: HTMLElement; visibility: string; pointerEvents: string }> {
    if (typeof document === 'undefined') {
      return [];
    }

    const activeModals = Array.from(
      document.querySelectorAll<HTMLElement>('.internacao-dialog-overlay, .modal.show')
    );

    return activeModals.map((element) => {
      const snapshot = {
        element,
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents,
      };

      element.style.visibility = 'hidden';
      element.style.pointerEvents = 'none';
      return snapshot;
    });
  }

  private resumePausedModals(pausedModals: Array<{ element: HTMLElement; visibility: string; pointerEvents: string }>): void {
    pausedModals.forEach(({ element, visibility, pointerEvents }) => {
      element.style.visibility = visibility;
      element.style.pointerEvents = pointerEvents;
    });
  }

  success(message: string, title: string = 'Sucesso') {
    void this.fireWithModalPause({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#3085d6',
    });
  }

  error(message: string, title: string = 'Erro') {
    void this.fireWithModalPause({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#d33',
    });
  }

  warning(message: string, title: string = 'Atenção') {
    void this.fireWithModalPause({
      icon: 'warning',
      title: title,
      text: message,
    });
  }

  info(message: string, title: string = 'Informação') {
    void this.fireWithModalPause({
      icon: 'info',
      title: title,
      text: message,
    });
  }

  confirm(message: string, title: string = 'Confirmação'): Promise<boolean> {
    return this.fireWithModalPause({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}
