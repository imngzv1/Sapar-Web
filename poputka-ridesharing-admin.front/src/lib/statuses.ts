export function rideStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'waiting':
      return 'Ожидание';
    case 'on_way':
      return 'В пути';
    case 'completed':
      return 'Завершена';
    case 'cancelled':
    case 'canceled':
      return 'Отменена';
    case 'active':
      return 'Активна';
    default:
      return status;
  }
}

export function rideStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'waiting':
      return 'bg-amber-100 text-amber-800';
    case 'on_way':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
    case 'canceled':
      return 'bg-rose-100 text-rose-800';
    case 'active':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function bookingStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'Подтверждена';
    case 'cancelled':
    case 'canceled':
      return 'Отменена';
    default:
      return status;
  }
}

export function bookingStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
    case 'canceled':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
}
