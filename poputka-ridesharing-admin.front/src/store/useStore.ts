import { create } from 'zustand';
import { 
  User, 
  VerificationRequest, 
  Driver, 
  Ride, 
  Complaint, 
  City, 
  Transaction, 
  Payout, 
  Refund, 
  FAQItem, 
  AdminLog 
} from '../types';
import { createAdminLog } from '../lib/adminLogs';
import { useAuthStore } from './useAuthStore';

import { 
  INITIAL_USERS, 
  INITIAL_VERIFICATION_REQUESTS, 
  INITIAL_DRIVERS, 
  INITIAL_RIDES, 
  INITIAL_COMPLAINTS, 
  INITIAL_CITIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PAYOUTS, 
  INITIAL_REFUNDS, 
  INITIAL_FAQ, 
  INITIAL_LOGS 
} from '../data';

const DEMO_LOG_IDS = new Set(['log_1', 'log_2', 'log_3']);

function loadLogsFromStorage(): AdminLog[] {
  const saved = getLocalStorage('poputka_logs', INITIAL_LOGS);
  return saved.filter((l) => !DEMO_LOG_IDS.has(l.id));
}

// Helper for localStorage retrieval
const getLocalStorage = <T>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

// Helper for localStorage setting
const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

interface AppState {
  activeTab: string;
  sidebarOpen: boolean;
  users: User[];
  verificationRequests: VerificationRequest[];
  drivers: Driver[];
  rides: Ride[];
  complaints: Complaint[];
  cities: City[];
  transactions: Transaction[];
  payouts: Payout[];
  refunds: Refund[];
  faq: FAQItem[];
  logs: AdminLog[];

  // Pure State Setters
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // Actions / Handlers
  logAction: (action: string, targetType: AdminLog['targetType'], targetId: string, details: string) => void;
  blockUser: (userId: string, reason: string) => void;
  unblockUser: (userId: string) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  suspendDriver: (driverId: string) => void;
  activateDriver: (driverId: string) => void;
  cancelRide: (rideId: string) => void;
  resolveComplaint: (complaintId: string, decision: string) => void;
  dismissComplaint: (complaintId: string, decision: string) => void;
  approvePayout: (payoutId: string) => void;
  addCity: (cityName: string) => void;
  removeCity: (cityId: string) => void;
  toggleCityStatus: (cityId: string) => void;
  addFAQ: (question: string, answer: string, category: FAQItem['category']) => void;
  removeFAQ: (faqId: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  sidebarOpen: true,
  users: getLocalStorage('poputka_users', INITIAL_USERS),
  verificationRequests: getLocalStorage('poputka_verification_requests', INITIAL_VERIFICATION_REQUESTS),
  drivers: getLocalStorage('poputka_drivers', INITIAL_DRIVERS),
  rides: getLocalStorage('poputka_rides', INITIAL_RIDES),
  complaints: getLocalStorage('poputka_complaints', INITIAL_COMPLAINTS),
  cities: getLocalStorage('poputka_cities', INITIAL_CITIES),
  transactions: getLocalStorage('poputka_transactions', INITIAL_TRANSACTIONS),
  payouts: getLocalStorage('poputka_payouts', INITIAL_PAYOUTS),
  refunds: getLocalStorage('poputka_refunds', INITIAL_REFUNDS),
  faq: getLocalStorage('poputka_faq', INITIAL_FAQ),
  logs: loadLogsFromStorage(),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set((state) => ({ 
    sidebarOpen: typeof open === 'function' ? open(state.sidebarOpen) : open 
  })),

  logAction: (action, targetType, targetId, details) => {
    const adminName = useAuthStore.getState().admin?.login ?? 'Ислам';
    const fallback: AdminLog = {
      id: `log_${Date.now()}`,
      adminName,
      action,
      targetType,
      targetId,
      date: new Date().toLocaleString('ru-RU'),
      details,
    };

    set((state) => {
      const updated = [fallback, ...state.logs];
      setLocalStorage('poputka_logs', updated);
      return { logs: updated };
    });

    createAdminLog({ adminName, action, targetType, targetId, details })
      .then((entry) => {
        set((state) => {
          const withoutFallback = state.logs.filter((l) => l.id !== fallback.id);
          const updated = [entry, ...withoutFallback];
          setLocalStorage('poputka_logs', updated);
          return { logs: updated };
        });
      })
      .catch((err) => {
        console.warn('[audit] не удалось отправить на сервер:', err.message);
      });
  },

  blockUser: (userId, reason) => set((state) => {
    const updatedUsers = state.users.map(u => u.id === userId ? { ...u, status: 'blocked' as const, blockReason: reason } : u);
    setLocalStorage('poputka_users', updatedUsers);

    // Also suspend driver status if they are a driver
    const updatedDrivers = state.drivers.map(d => d.userId === userId ? { ...d, status: 'suspended' as const } : d);
    setLocalStorage('poputka_drivers', updatedDrivers);

    return { users: updatedUsers, drivers: updatedDrivers };
  }),

  unblockUser: (userId) => set((state) => {
    const updatedUsers = state.users.map(u => u.id === userId ? { ...u, status: 'active' as const, blockReason: undefined } : u);
    setLocalStorage('poputka_users', updatedUsers);

    // Also resume driver status if they are an active driver
    const updatedDrivers = state.drivers.map(d => d.userId === userId ? { ...d, status: 'active' as const } : d);
    setLocalStorage('poputka_drivers', updatedDrivers);

    return { users: updatedUsers, drivers: updatedDrivers };
  }),

  approveRequest: (requestId) => set((state) => {
    const requestReviewed = state.verificationRequests.map(req => {
      if (req.id === requestId) {
        return { 
          ...req, 
          status: 'Approved' as const,
          dateReviewed: new Date().toLocaleDateString('ru')
        };
      }
      return req;
    });
    setLocalStorage('poputka_verification_requests', requestReviewed);

    // Find requested user info to create active driver profile
    const req = state.verificationRequests.find(r => r.id === requestId);
    let updatedUsers = state.users;
    let updatedDrivers = state.drivers;

    if (req) {
      updatedUsers = state.users.map(u => u.id === req.userId ? { ...u, role: 'driver' as const, verified: true } : u);
      setLocalStorage('poputka_users', updatedUsers);

      const alreadyDriver = state.drivers.some(d => d.userId === req.userId);
      if (!alreadyDriver) {
        const newDriver: Driver = {
          id: `drv_${Date.now()}`,
          userId: req.userId,
          name: req.userName,
          phone: req.userPhone,
          avatar: req.userAvatar,
          rating: 5.0,
          carModel: req.carModel,
          carNumber: req.carNumber,
          carColor: req.carColor,
          completedRides: 0,
          totalEarned: 0,
          verificationDate: new Date().toLocaleDateString('ru'),
          status: 'active'
        };
        updatedDrivers = [newDriver, ...state.drivers];
        setLocalStorage('poputka_drivers', updatedDrivers);
      }
    }

    return { 
      verificationRequests: requestReviewed, 
      users: updatedUsers, 
      drivers: updatedDrivers 
    };
  }),

  rejectRequest: (requestId, reason) => set((state) => {
    const requestReviewed = state.verificationRequests.map(req => {
      if (req.id === requestId) {
        return { 
          ...req, 
          status: 'Rejected' as const,
          rejectReason: reason,
          dateReviewed: new Date().toLocaleDateString('ru')
        };
      }
      return req;
    });
    setLocalStorage('poputka_verification_requests', requestReviewed);
    return { verificationRequests: requestReviewed };
  }),

  suspendDriver: (driverId) => set((state) => {
    const updated = state.drivers.map(d => d.id === driverId ? { ...d, status: 'suspended' as const } : d);
    setLocalStorage('poputka_drivers', updated);
    return { drivers: updated };
  }),

  activateDriver: (driverId) => set((state) => {
    const updated = state.drivers.map(d => d.id === driverId ? { ...d, status: 'active' as const } : d);
    setLocalStorage('poputka_drivers', updated);
    return { drivers: updated };
  }),

  cancelRide: (rideId) => set((state) => {
    const updatedRides = state.rides.map(r => r.id === rideId ? { ...r, status: 'Cancelled' as const } : r);
    setLocalStorage('poputka_rides', updatedRides);

    // Find travelers to perform financial rollback refunds
    const ride = state.rides.find(r => r.id === rideId);
    let updatedRefunds = state.refunds;
    let updatedTransactions = state.transactions;

    if (ride && ride.passengers && ride.passengers.length > 0) {
      const generatedRefunds: Refund[] = [];
      const generatedTx: Transaction[] = [];

      ride.passengers.forEach(pas => {
        const newRefund: Refund = {
          id: `ref_${Date.now()}_${pas.id}`,
          rideId: ride.id,
          passengerId: pas.id,
          passengerName: pas.name,
          amount: ride.price,
          date: new Date().toLocaleDateString('ru'),
          status: 'Completed',
          reason: `Принудительная отмена поездки (${ride.fromCity} - ${ride.toCity}) представителем администрации.`
        };
        generatedRefunds.push(newRefund);

        const refundTx: Transaction = {
          id: `tx_ref_${Date.now()}_${pas.id}`,
          amount: ride.price,
          commission: -Math.round(ride.price * 0.1),
          date: new Date().toLocaleString('ru', { timeZone: 'UTC' }).replace(',', ''),
          status: 'Refunded',
          type: 'Refund',
          sender: `Сервис Автокасса Кыргызстан`,
          recipient: `${pas.name} (Пассажир)`,
          rideId: ride.id
        };
        generatedTx.push(refundTx);
      });

      updatedRefunds = [...generatedRefunds, ...state.refunds];
      updatedTransactions = [...generatedTx, ...state.transactions];

      setLocalStorage('poputka_refunds', updatedRefunds);
      setLocalStorage('poputka_transactions', updatedTransactions);
    }

    return { 
      rides: updatedRides, 
      refunds: updatedRefunds, 
      transactions: updatedTransactions 
    };
  }),

  resolveComplaint: (complaintId, decision) => set((state) => {
    const updated = state.complaints.map(c => c.id === complaintId ? { ...c, status: 'Resolved' as const, decision } : c);
    setLocalStorage('poputka_complaints', updated);
    return { complaints: updated };
  }),

  dismissComplaint: (complaintId, decision) => set((state) => {
    const updated = state.complaints.map(c => c.id === complaintId ? { ...c, status: 'Dismissed' as const, decision } : c);
    setLocalStorage('poputka_complaints', updated);
    return { complaints: updated };
  }),

  approvePayout: (payoutId) => set((state) => {
    const updatedPayouts = state.payouts.map(p => p.id === payoutId ? { ...p, status: 'Completed' as const } : p);
    setLocalStorage('poputka_payouts', updatedPayouts);

    const payoutObj = state.payouts.find(p => p.id === payoutId);
    let updatedTransactions = state.transactions;

    if (payoutObj) {
      const payoutTx: Transaction = {
        id: `tx_pay_${Date.now()}`,
        amount: payoutObj.amount,
        commission: 0,
        date: new Date().toLocaleString('ru', { timeZone: 'UTC' }).replace(',', ''),
        status: 'Completed',
        type: 'Payout',
        sender: 'Сервис Попутка',
        recipient: `${payoutObj.driverName} (Водитель)`
      };
      updatedTransactions = [payoutTx, ...state.transactions];
      setLocalStorage('poputka_transactions', updatedTransactions);
    }

    return { payouts: updatedPayouts, transactions: updatedTransactions };
  }),

  addCity: (cityName) => set((state) => {
    const newCity: City = {
      id: `cit_${Date.now()}`,
      name: cityName,
      status: 'active',
      ridesCount: 0
    };
    const updated = [newCity, ...state.cities];
    setLocalStorage('poputka_cities', updated);
    return { cities: updated };
  }),

  removeCity: (cityId) => set((state) => {
    const updated = state.cities.filter(c => c.id !== cityId);
    setLocalStorage('poputka_cities', updated);
    return { cities: updated };
  }),

  toggleCityStatus: (cityId) => set((state) => {
    const updated = state.cities.map(c => c.id === cityId ? { ...c, status: (c.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : c);
    setLocalStorage('poputka_cities', updated);
    return { cities: updated };
  }),

  addFAQ: (question, answer, category) => set((state) => {
    const newItem: FAQItem = {
      id: `faq_${Date.now()}`,
      question,
      answer,
      category
    };
    const updated = [newItem, ...state.faq];
    setLocalStorage('poputka_faq', updated);
    return { faq: updated };
  }),

  removeFAQ: (faqId) => set((state) => {
    const updated = state.faq.filter(f => f.id !== faqId);
    setLocalStorage('poputka_faq', updated);
    return { faq: updated };
  })
}));
