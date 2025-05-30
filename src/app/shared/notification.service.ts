// src/app/shared/notification.service.ts
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',       // ← lateral arriba como antes
    showConfirmButton: false,
    timer: 3000,               // tiempo visible
    timerProgressBar: true,
    didOpen: el => {
      el.addEventListener('mouseenter', Swal.stopTimer);
      el.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  success(title: string, text?: string) { this.toast.fire({ icon: 'success', title, text }); }
  error(title: string, text?: string)   { this.toast.fire({ icon: 'error',   title, text }); }
  info(title: string, text?: string)    { this.toast.fire({ icon: 'info',    title, text }); }
}
