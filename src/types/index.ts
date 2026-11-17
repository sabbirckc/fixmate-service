export type Role = 'customer' | 'technician' | 'admin'

export type ServiceCategory =
  | 'Smartphone'
  | 'Laptop & PC'
  | 'AC'
  | 'Refrigerator'
  | 'TV'
  | 'Washing Machine'
  | 'Electrical'

export type ServiceMode = 'Home Visit' | 'Shop Drop-off'

export type JobStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  _id?: string
  id?: string
  name: string
  email: string
  image?: string | null
  role: Role
  phone?: string | null
  area?: string | null
  bio?: string | null
  createdAt?: string | Date
}

export interface Service {
  _id: string
  title: string
  category: ServiceCategory
  description: string
  image: string
  basePrice: number
  estimatedDuration: string
  serviceMode: ServiceMode
  serviceArea: string
  technicianName: string
  technicianEmail: string
  approvalStatus: ApprovalStatus
  isAvailable: boolean
  createdAt: string
  updatedAt?: string
}

export interface StatusHistoryItem {
  status: JobStatus | 'paid'
  changedAt: string | Date
  changedBy: string
}

export interface Booking {
  _id: string
  serviceId: string
  serviceTitle: string
  serviceImage: string
  category: ServiceCategory
  basePrice: number
  technicianName: string
  technicianEmail: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  preferredDate: string | Date
  problemDescription: string
  status: JobStatus
  finalAmount: number
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt?: string
  statusHistory?: StatusHistoryItem[]
}

export interface Payment {
  _id: string
  bookingId: string
  serviceTitle: string
  customerName: string
  customerEmail: string
  technicianName: string
  technicianEmail: string
  amount: number
  currency: string
  transactionId: string
  stripeSessionId: string
  paymentStatus: 'paid'
  paidAt: string
}

export interface AdminStats {
  totalUsers: number
  totalTechnicians: number
  totalCustomers: number
  pendingServices: number
  totalApprovedServices: number
  totalBookings: number
  totalRevenue: number
  totalTransactions: number
}
