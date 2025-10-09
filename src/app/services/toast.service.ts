import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();
  private idCounter = 0;

  success(message: string, title?: string) {
    this.show(message, title, 'success');
  }

  error(message: string, title?: string) {
    this.show(message, title, 'error');
  }

  info(message: string, title?: string) {
    this.show(message, title, 'info');
  }

  warning(message: string, title?: string) {
    this.show(message, title, 'warning');
  }

  private show(message: string, title: string | undefined, type: Toast['type']) {
    const toast: Toast = {
      id: this.idCounter++,
      message,
      title,
      type
    };
    this.toastSubject.next(toast);
  }
}