export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  expiryDate: string;
  manufacturer: string;
  minThreshold: number;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    dosage: string;
  }[];
}

export interface Sale {
  id: string;
  items: {
    medicineId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  timestamp: string;
  userId: string;
}

export type ViewType = 'dashboard' | 'inventory' | 'prescriptions' | 'sales' | 'settings';
