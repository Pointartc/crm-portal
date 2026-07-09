export interface Lead {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    image: string;
    company: {
      name: string;
    };
  }