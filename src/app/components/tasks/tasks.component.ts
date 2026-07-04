import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface TodosResponse {
  todos: any[];
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgClass],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  private http = inject(HttpClient);

  tasks = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);

    this.http.get<TodosResponse>('https://dummyjson.com/todos').subscribe({
      next: (res) => {
        this.tasks.set(res.todos);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
