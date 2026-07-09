import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Task {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

interface TodosResponse {
  todos: Task[];
}

type TaskStatusFilter = 'all' | 'completed' | 'in-progress';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  private http = inject(HttpClient);

  tasks = signal<Task[]>([]);
  isLoading = signal<boolean>(false);
  newTaskTitle = signal<string>('');
  searchTerm = signal<string>('');
  statusFilter = signal<TaskStatusFilter>('all');

  filteredTasks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.tasks().filter((task) => {
      const matchesSearch = !term || task.todo.toLowerCase().includes(term);
      const matchesStatus =
        status === 'all' ||
        (status === 'completed' && task.completed) ||
        (status === 'in-progress' && !task.completed);

      return matchesSearch && matchesStatus;
    });
  });

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

  toggleTaskStatus(taskId: number): void {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;

    this.tasks.update((tasks) =>
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: newCompleted } : t
      )
    );

    this.http
      .put(`https://dummyjson.com/todos/${taskId}`, {
        completed: newCompleted
      })
      .subscribe({
        error: (err) => {
          console.error('Failed to update task status', err);
        }
      });
  }

  addTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const newTask: Task = {
      id: Date.now(),
      todo: title,
      completed: false,
      userId: 1
    };

    this.tasks.set([newTask, ...this.tasks()]);
    this.newTaskTitle.set('');

    this.http
      .post('https://dummyjson.com/todos/add', {
        todo: title,
        completed: false,
        userId: 1
      })
      .subscribe({
        error: (err) => {
          console.error('Failed to add task', err);
        }
      });
  }
}