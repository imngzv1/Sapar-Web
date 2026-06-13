import { Refund, Ride, Transaction } from '../types';
import { createStore, formatDate, formatDateTime, nextId } from './store';
import { recordAudit } from './audit';

const ridesStore = createStore<Ride>('rides.json');
const refundsStore = createStore<Refund>('refunds.json');
const transactionsStore = createStore<Transaction>('transactions.json');

export function listRides(): Ride[] {
  return ridesStore.list();
}

export function cancelRide(id: string, adminName: string): Ride | null {
  const ride = ridesStore.update(id, { status: 'Cancelled' });
  if (!ride) return null;

  for (const passenger of ride.passengers ?? []) {
    refundsStore.add({
      id: nextId('ref'),
      rideId: ride.id,
      passengerId: passenger.id,
      passengerName: passenger.name,
      amount: ride.price,
      date: formatDate(),
      status: 'Completed',
      reason: `Поездка ${ride.fromCity} — ${ride.toCity} отменена администратором.`,
    });

    transactionsStore.add({
      id: nextId('tx_ref'),
      amount: ride.price,
      commission: -Math.round(ride.price * 0.1),
      date: formatDateTime(),
      status: 'Refunded',
      type: 'Refund',
      sender: 'Попутка',
      recipient: `${passenger.name} (пассажир)`,
      rideId: ride.id,
    });
  }

  recordAudit({
    adminName,
    action: 'Отмена поездки',
    targetType: 'finance',
    targetId: ride.id,
    details: `Отменена поездка ${ride.fromCity} — ${ride.toCity} (${ride.date} ${ride.time}). Возвращено пассажирам: ${(ride.passengers ?? []).length}`,
  });

  return ride;
}
