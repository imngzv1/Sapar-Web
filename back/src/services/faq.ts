import { FaqCategory, FaqItem } from '../types';
import { createStore, nextId } from './store';
import { recordAudit } from './audit';

const faqStore = createStore<FaqItem>('faq.json');

export function listFaq(): FaqItem[] {
  return faqStore.list();
}

interface CreateFaqArgs {
  question: string;
  answer: string;
  category: FaqCategory;
  adminName: string;
}

export function createFaq(args: CreateFaqArgs): FaqItem {
  const item = faqStore.add({
    id: nextId('faq'),
    question: args.question,
    answer: args.answer,
    category: args.category,
  });
  recordAudit({
    adminName: args.adminName,
    action: 'Добавление FAQ',
    targetType: 'faq',
    targetId: item.id,
    details: `Добавлен вопрос: ${args.question}`,
  });
  return item;
}

export function removeFaq(id: string, adminName: string): boolean {
  const item = faqStore.find(id);
  if (!item) return false;
  faqStore.remove(id);
  recordAudit({
    adminName,
    action: 'Удаление FAQ',
    targetType: 'faq',
    targetId: item.id,
    details: `Удалён вопрос: ${item.question}`,
  });
  return true;
}
