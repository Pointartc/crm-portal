import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../../models/leads.model';

interface UsersResponse {
  users: Lead[];
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

  leads = signal<Lead[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  filteredLeads = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
  
    if (!query) {
      return this.leads();
    }
  
    return this.leads().filter((lead) => {
      const firstName = (lead.firstName ?? '').toLowerCase();
      const lastName = (lead.lastName ?? '').toLowerCase();
      const companyName = (lead.company?.name ?? '').toLowerCase();
  
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        companyName.includes(query)
      );
    });
  });
  
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
