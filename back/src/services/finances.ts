import { Payout, Refund, Transaction } from '../types';
import { createStore, formatDateTime, nextId } from './store';
import { recordAudit } from './audit';

const transactionsStore = createStore<Transaction>('transactions.json');
const payoutsStore = createStore<Payout>('payouts.json');
const refundsStore = createStore<Refund>('refunds.json');

export function listTransactions(): Transaction[] {
  return transactionsStore.list();
}

export function listPayouts(): Payout[] {
  return payoutsStore.list();
}

export function listRefunds(): Refund[] {
  return refundsStore.list();
}

export function approvePayout(id: string, adminName: string): Payout | null {
  const payout = payoutsStore.update(id, { status: 'Completed' });
  if (!payout) return null;

  transactionsStore.add({
    id: nextId('tx_pay'),
    amount: payout.amount,
    commission: 0,
    date: formatDateTime(),
    status: 'Completed',
    type: 'Payout',
    sender: 'Попутка',
    recipient: `${payout.driverName} (водитель)`,
  });

  recordAudit({
    adminName,
    action: 'Подтверждение выплаты',
    targetType: 'finance',
    targetId: payout.id,
    details: `Выплата ${payout.amount} сом водителю ${payout.driverName} на ${payout.bankCard}`,
  });

  return payout;
}
