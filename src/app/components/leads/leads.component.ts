import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UsersResponse {
  users: any[];
}

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss'
})
export class LeadsComponent implements OnInit {
  private http = inject(HttpClient);

  leads = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);

    this.http.get<UsersResponse>('https://dummyjson.com/users').subscribe({
      next: (res) => {
        this.leads.set(res.users);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatus(index: number): 'Active' | 'Contacted' {
    return index % 2 === 0 ? 'Active' : 'Contacted';
  }
}
