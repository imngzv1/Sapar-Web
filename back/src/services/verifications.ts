import { Driver, User, VerificationRequest } from '../types';
import { createStore, nextId, formatDate } from './store';
import { recordAudit } from './audit';

const requestsStore = createStore<VerificationRequest>('verificationRequests.json');
const usersStore = createStore<User>('users.json');
const driversStore = createStore<Driver>('drivers.json');

export function listRequests(): VerificationRequest[] {
  return requestsStore.list();
}

export function approveRequest(id: string, adminName: string): VerificationRequest | null {
  const reviewedAt = formatDate();
  const request = requestsStore.update(id, {
    status: 'Approved',
    dateReviewed: reviewedAt,
  });
  if (!request) return null;

  usersStore.update(request.userId, { role: 'driver', verified: true });

  const exists = driversStore.where((d) => d.userId === request.userId)[0];
  if (!exists) {
    driversStore.add({
      id: nextId('drv'),
      userId: request.userId,
      name: request.userName,
      phone: request.userPhone,
      avatar: request.userAvatar,
      rating: 5.0,
      carModel: request.carModel,
      carNumber: request.carNumber,
      carColor: request.carColor,
      completedRides: 0,
      totalEarned: 0,
      verificationDate: reviewedAt,
      status: 'active',
    });
  }

  recordAudit({
    adminName,
    action: 'Одобрение верификации',
    targetType: 'verification',
    targetId: id,
    details: `Одобрена заявка водителя ${request.userName}, машина ${request.carModel} ${request.carNumber}`,
  });

  return request;
}

export function rejectRequest(
  id: string,
  reason: string,
  adminName: string
): VerificationRequest | null {
  const request = requestsStore.update(id, {
    status: 'Rejected',
    rejectReason: reason,
    dateReviewed: formatDate(),
  });
  if (!request) return null;

  recordAudit({
    adminName,
    action: 'Отклонение верификации',
    targetType: 'verification',
    targetId: id,
    details: `Отклонена заявка ${request.userName}. Причина: ${reason}`,
  });

  return request;
}
