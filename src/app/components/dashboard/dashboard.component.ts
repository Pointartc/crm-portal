import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { Lead } from '../../models/leads.model';

interface Task {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

interface UsersResponse {
  users: Lead[];
}

interface TodosResponse {
  todos: Task[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  currentUser = this.authService.currentUser;

  leads = signal<Lead[]>([]);
  tasks = signal<Task[]>([]);
  isLoading = signal<boolean>(false);

  totalLeadsCount = computed(() => this.leads().length);
  totalTasksCount = computed(() => this.tasks().length);

  totalCompletedTasksCount = computed(() =>
    this.tasks().filter((task) => task.completed).length
  );

  totalUncompletedTasksCount = computed(() =>
    this.tasks().filter((task) => !task.completed).length
  );

  totalTasksProgress = computed(() =>
    this.totalTasksCount() > 0
      ? Math.round((this.totalCompletedTasksCount() / this.totalTasksCount()) * 100)
      : 0
  );

  totalRevenue = computed(() => this.totalLeadsCount() * 1500);

  recentLeads = computed(() => this.leads().slice(0, 5));

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

  getLeadStatus(index: number): 'New' | 'Contacted' | 'Qualified' {
    const statuses: ('New' | 'Contacted' | 'Qualified')[] = [
      'New',
      'Contacted',
      'Qualified'
    ];

    return statuses[index % statuses.length];
  }
}