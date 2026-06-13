// Общие типы домена. Совпадают с тем, что использует фронт.

export type UserRole = 'passenger' | 'driver' | 'admin';
export type UserStatus = 'active' | 'blocked';
export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';
export type RideStatus = 'Active' | 'Completed' | 'Cancelled';
export type ComplaintStatus = 'Pending' | 'Resolved' | 'Dismissed';
export type TransactionStatus = 'Completed' | 'Refunded' | 'Pending';
export type TransactionType = 'Payment' | 'Payout' | 'Refund';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  registrationDate: string;
  blockReason?: string;
  verified: boolean;
  totalRidesPassenger: number;
  totalRidesDriver: number;
  rating?: number;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAvatar: string;
  carModel: string;
  carNumber: string;
  carColor: string;
  carYear: number;
  documentPassportUrl: string;
  documentLicenseUrl: string;
  documentCarPhotoUrl: string;
  status: VerificationStatus;
  rejectReason?: string;
  dateSubmitted: string;
  dateReviewed?: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  carModel: string;
  carNumber: string;
  carColor: string;
  completedRides: number;
  totalEarned: number;
  verificationDate: string;
  status: 'active' | 'suspended';
}

export interface RidePassenger {
  id: string;
  name: string;
  phone: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  fromCity: string;
  toCity: string;
  date: string;
  time: string;
  price: number;
  totalSeats: number;
  occupiedSeats: number;
  status: RideStatus;
  carModel: string;
  passengers: RidePassenger[];
}

export interface Complaint {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reportedRole: UserRole;
  text: string;
  category: 'rudeness' | 'reckless_driving' | 'car_dirty' | 'noshow' | 'price_mismatch' | 'other';
  date: string;
  status: ComplaintStatus;
  decision?: string;
}

export interface City {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  ridesCount: number;
}

export interface Transaction {
  id: string;
  amount: number;
  commission: number;
  date: string;
  status: TransactionStatus;
  type: TransactionType;
  sender: string;
  recipient: string;
  rideId?: string;
}

export interface Payout {
  id: string;
  driverId: string;
  driverName: string;
  amount: number;
  bankCard: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface Refund {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
  reason: string;
}

export type FaqCategory = 'general' | 'drivers' | 'passengers' | 'safety';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export type AdminLogTargetType =
  | 'verification'
  | 'user_state'
  | 'complaint'
  | 'city'
  | 'faq'
  | 'finance';

export interface AdminLog {
  id: string;
  adminName: string;
  action: string;
  targetType: AdminLogTargetType;
  targetId: string;
  date: string;
  details: string;
}

// расширение Express.Request — кладём имя текущего админа
declare global {
  namespace Express {
    interface Request {
      adminName: string;
    }
  }
}
