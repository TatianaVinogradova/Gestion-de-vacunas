import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']

})
  export class ToastComponent implements OnInit {
    toasts: Toast[] = [];
  
    constructor(private toastService: ToastService) {}
  
    ngOnInit() {
      this.toastService.toast$.subscribe(toast => {
        this.toasts.push(toast);
        setTimeout(() => {
          this.removeToast(toast.id);
        }, 3000);
      });
    }
  
    removeToast(id: number) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }