import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  success(message: string, title: string = 'Sucesso') {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#3085d6'
    });
  }

  error(message: string, title: string = 'Erro') {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#d33'
    });
  }

  warning(message: string, title: string = 'Atenção') {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message
    });
  }

  info(message: string, title: string = 'Informação') {
    Swal.fire({
      icon: 'info',
      title: title,
      text: message
    });
  }

  confirm(message: string, title: string = 'Confirmação'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      return result.isConfirmed;
    });
  }

}

