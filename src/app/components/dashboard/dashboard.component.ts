import { Component, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface UsersResponse {
  users: any[];
}

interface TodosResponse {
  todos: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  currentUser = this.authService.currentUser;

  leads = signal<any[]>([]);
  tasks = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  totalLeadsCount = computed(() => this.leads().length);
  totalTasksCount = computed(() => this.tasks().length);
  totalCompletedTasksCount = computed(() => this.tasks().filter((task) => task.completed).length);
  totalUncompletedTasksCount = computed(() => this.tasks().filter((task) => !task.completed).length);
  totalTasksProgress = computed(() => this.totalTasksCount() > 0 ? Math.round((this.totalCompletedTasksCount() / this.totalTasksCount()) * 100): 0);
  totalRevenue = computed(() => this.totalLeadsCount() * 1500);


  ngOnInit(): void {
    this.isLoading.set(true);
    let completedRequests = 0;
    const finishRequest = () => {
      completedRequests += 1;
      if (completedRequests === 2) {
        this.isLoading.set(false);
      }
    };
    this.http.get<UsersResponse>('https://dummyjson.com/users').subscribe({
      next: (data) => {
        this.leads.set(data.users);
        finishRequest();
      },
      error: () => {
        finishRequest();
      }
    });
    this.http.get<TodosResponse>('https://dummyjson.com/todos').subscribe({
      next: (data) => {
        this.tasks.set(data.todos);
        finishRequest();
      },
      error: () => {
        finishRequest();
      }
    });
  }
  }
