import { Complaint } from '../types';
import { createStore } from './store';
import { recordAudit } from './audit';

const complaintsStore = createStore<Complaint>('complaints.json');

export function listComplaints(): Complaint[] {
  return complaintsStore.list();
}

export function resolveComplaint(
  id: string,
  decision: string,
  adminName: string
): Complaint | null {
  const complaint = complaintsStore.update(id, { status: 'Resolved', decision });
  if (!complaint) return null;
  recordAudit({
    adminName,
    action: 'Жалоба удовлетворена',
    targetType: 'complaint',
    targetId: complaint.id,
    details: `Жалоба на ${complaint.reportedName} (${complaint.reportedRole}). Решение: ${decision}`,
  });
  return complaint;
}

export function dismissComplaint(
  id: string,
  decision: string,
  adminName: string
): Complaint | null {
  const complaint = complaintsStore.update(id, { status: 'Dismissed', decision });
  if (!complaint) return null;
  recordAudit({
    adminName,
    action: 'Жалоба отклонена',
    targetType: 'complaint',
    targetId: complaint.id,
    details: `Жалоба на ${complaint.reportedName}. Причина отклонения: ${decision}`,
  });
  return complaint;
}
