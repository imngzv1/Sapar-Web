import { User, VerificationRequest, Driver, Ride, Complaint, City, Transaction, Payout, Refund, FAQItem, AdminLog } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Азамат Исаев',
    phone: '+996 555 123 456',
    email: 'azamat.is@gmail.com',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    registrationDate: '12.03.2026',
    verified: true,
    totalRidesPassenger: 12,
    totalRidesDriver: 124,
    rating: 4.9
  },
  {
    id: 'usr_2',
    name: 'Бектур Усманов',
    phone: '+996 700 987 654',
    email: 'bektur99@mail.ru',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    registrationDate: '20.04.2026',
    verified: false,
    totalRidesPassenger: 34,
    totalRidesDriver: 0,
    rating: 4.8
  },
  {
    id: 'usr_3',
    name: 'Айгерим Сабырова',
    phone: '+996 777 445 566',
    email: 'aigerim.cab@gmail.com',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    registrationDate: '05.05.2026',
    verified: false,
    totalRidesPassenger: 18,
    totalRidesDriver: 0,
    rating: 4.7
  },
  {
    id: 'usr_4',
    name: 'Каныкей Борубаева',
    phone: '+996 502 889 911',
    email: 'kanykey_b@list.ru',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    registrationDate: '01.02.2026',
    verified: true,
    totalRidesPassenger: 5,
    totalRidesDriver: 86,
    rating: 4.95
  },
  {
    id: 'usr_5',
    name: 'Руслан Алиев',
    phone: '+996 705 332 211',
    email: 'ruslan.aliev@yandex.ru',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'blocked',
    registrationDate: '15.01.2026',
    blockReason: 'Систематические отмены поездок без предупреждения водителей и грубое общение в чате',
    verified: false,
    totalRidesPassenger: 22,
    totalRidesDriver: 0,
    rating: 3.2
  },
  {
    id: 'usr_6',
    name: 'Улан Маматов',
    phone: '+996 550 556 778',
    email: 'mamatov.u@gmail.com',
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    registrationDate: '28.05.2026',
    verified: false,
    totalRidesPassenger: 1,
    totalRidesDriver: 0,
    rating: 5.0
  },
  {
    id: 'usr_7',
    name: 'Нурбек Турсунов',
    phone: '+996 701 445 522',
    email: 'nurbek.t@mail.ru',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    registrationDate: '10.04.2026',
    verified: false,
    totalRidesPassenger: 3,
    totalRidesDriver: 0,
    rating: 4.0
  }
];

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'req_1',
    userId: 'usr_7',
    userName: 'Нурбек Турсунов',
    userPhone: '+996 701 445 522',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    carModel: 'Toyota Camry (Белый)',
    carNumber: '01KG555ADF',
    carColor: 'Белый металлик',
    carYear: 2018,
    documentPassportUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=600&q=85',
    documentLicenseUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=85',
    documentCarPhotoUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=85',
    status: 'Pending',
    dateSubmitted: '29.05.2026'
  },
  {
    id: 'req_2',
    userId: 'usr_1',
    userName: 'Азамат Исаев',
    userPhone: '+996 555 123 456',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    carModel: 'Toyota Land Cruiser Prado (Серебристый)',
    carNumber: '02KG777AAA',
    carColor: 'Серебристый',
    carYear: 2017,
    documentPassportUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=600&q=85',
    documentLicenseUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=85',
    documentCarPhotoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=85',
    status: 'Approved',
    dateSubmitted: '11.03.2026',
    dateReviewed: '12.03.2026'
  },
  {
    id: 'req_3',
    userId: 'usr_5',
    userName: 'Руслан Алиев',
    userPhone: '+996 705 332 211',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    carModel: 'Daewoo Nexia (Нексия)',
    carNumber: '08KG123AAB',
    carColor: 'Красный',
    carYear: 2008,
    documentPassportUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=600&q=85',
    documentLicenseUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=85',
    documentCarPhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=85',
    status: 'Rejected',
    rejectReason: 'Загруженное фото технического паспорта размыто. Невозможно прочитать регистрационный номер кузова автомобиля и вин-код.',
    dateSubmitted: '10.01.2026',
    dateReviewed: '12.01.2026'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv_1',
    userId: 'usr_1',
    name: 'Азамат Исаев',
    phone: '+996 555 123 456',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 4.9,
    carModel: 'Toyota Land Cruiser Prado',
    carNumber: '02KG777AAA',
    carColor: 'Серебристый',
    completedRides: 124,
    totalEarned: 186000,
    verificationDate: '12.03.2026',
    status: 'active'
  },
  {
    id: 'drv_2',
    userId: 'usr_4',
    name: 'Каныкей Борубаева',
    phone: '+996 502 889 911',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 4.95,
    carModel: 'Lexus RX 350',
    carNumber: '01KG889ABC',
    carColor: 'Черный',
    completedRides: 86,
    totalEarned: 129000,
    verificationDate: '01.02.2026',
    status: 'active'
  }
];

export const INITIAL_RIDES: Ride[] = [
  {
    id: 'rd_1',
    driverId: 'drv_1',
    driverName: 'Азамат Исаев',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    fromCity: 'Бишкек',
    toCity: 'Ош',
    date: 'Сегодня',
    time: '10:00',
    price: 1500,
    totalSeats: 4,
    occupiedSeats: 2,
    status: 'Active',
    carModel: 'Toyota Prado',
    passengers: [
      { id: 'usr_2', name: 'Бектур Усманов', phone: '+996 700 987 654' },
      { id: 'usr_3', name: 'Айгерим Сабырова', phone: '+996 777 445 566' }
    ]
  },
  {
    id: 'rd_2',
    driverId: 'drv_2',
    driverName: 'Каныкей Борубаева',
    driverAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    fromCity: 'Бишкек',
    toCity: 'Каракол',
    date: 'Завтра',
    time: '08:00',
    price: 800,
    totalSeats: 4,
    occupiedSeats: 4,
    status: 'Active',
    carModel: 'Lexus RX 350',
    passengers: [
      { id: 'usr_2', name: 'Бектур Усманов', phone: '+996 700 987 654' },
      { id: 'usr_6', name: 'Улан Маматов', phone: '+996 550 556 778' },
      { id: 'p_1', name: 'Марат Оморов', phone: '+996 553 441 229' },
      { id: 'p_2', name: 'Жамиля Садыкова', phone: '+996 707 334 112' }
    ]
  },
  {
    id: 'rd_3',
    driverId: 'drv_1',
    driverName: 'Азамат Исаев',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    fromCity: 'Ош',
    toCity: 'Бишкек',
    date: '28.05.2026',
    time: '22:30',
    price: 1500,
    totalSeats: 4,
    occupiedSeats: 4,
    status: 'Completed',
    carModel: 'Toyota Prado',
    passengers: [
      { id: 'usr_3', name: 'Айгерим Сабырова', phone: '+996 777 445 566' },
      { id: 'usr_6', name: 'Улан Маматов', phone: '+996 550 556 778' },
      { id: 'p_3', name: 'Нурсултан Кадыров', phone: '+996 554 112 233' },
      { id: 'p_4', name: 'Сезим Баитова', phone: '+996 700 334 455' }
    ]
  },
  {
    id: 'rd_4',
    driverId: 'drv_2',
    driverName: 'Каныкей Борубаева',
    driverAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    fromCity: 'Нарын',
    toCity: 'Бишкек',
    date: '25.05.2026',
    time: '13:00',
    price: 700,
    totalSeats: 4,
    occupiedSeats: 0,
    status: 'Cancelled',
    carModel: 'Lexus RX 350',
    passengers: []
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp_1',
    reporterId: 'usr_2',
    reporterName: 'Бектур Усманов',
    reportedId: 'usr_1',
    reportedName: 'Азамат Исаев',
    reportedRole: 'driver',
    category: 'reckless_driving',
    text: 'Водитель ехал очень опасно и превышал скорость на серпантине перевала Тоо-Ашуу. На просьбы ехать медленнее реагировал неохотно, говоря, что спешит.',
    date: '29.05.2026',
    status: 'Pending'
  },
  {
    id: 'cmp_2',
    reporterId: 'usr_1',
    reporterName: 'Азамат Исаев',
    reportedId: 'usr_5',
    reportedName: 'Руслан Алиев',
    reportedRole: 'passenger',
    category: 'noshow',
    text: 'Пассажир забронировал поездку до Каракола, но к назначенному времени не пришел. Телефон был отключен. Ждали 30 минут, из-за него выехали позже.',
    date: '14.01.2026',
    status: 'Resolved',
    decision: 'Вынесено предупреждение пользователю Руслан Алиев. В связи с повторными жалобами на пропуск поездок, аккаунт пользователя заблокирован.'
  },
  {
    id: 'cmp_3',
    reporterId: 'usr_3',
    reporterName: 'Айгерим Сабырова',
    reportedId: 'usr_4',
    reportedName: 'Каныкей Борубаева',
    reportedRole: 'driver',
    category: 'car_dirty',
    text: 'В салоне автомобиля было пыльно, на заднем сидении лежали какие-то коробки, из-за чего было тесно сидеть.',
    date: '26.05.2026',
    status: 'Dismissed',
    decision: 'Жалоба отклонена. Претензий к состоянию автомобиля у других пассажиров данного рейса не возникло. Водителю рекомендовано следить за чистотой багажного отделения.'
  }
];

export const INITIAL_CITIES: City[] = [
  { id: 'cit_1', name: 'Бишкек', status: 'active', ridesCount: 384 },
  { id: 'cit_2', name: 'Ош', status: 'active', ridesCount: 295 },
  { id: 'cit_3', name: 'Джалал-Абад', status: 'active', ridesCount: 154 },
  { id: 'cit_4', name: 'Каракол', status: 'active', ridesCount: 98 },
  { id: 'cit_5', name: 'Чолпон-Ата', status: 'active', ridesCount: 112 },
  { id: 'cit_6', name: 'Нарын', status: 'active', ridesCount: 56 },
  { id: 'cit_7', name: 'Талас', status: 'active', ridesCount: 42 },
  { id: 'cit_8', name: 'Баткен', status: 'active', ridesCount: 31 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    amount: 1500,
    commission: 150,
    date: '30.05.2026 11:20',
    status: 'Completed',
    type: 'Payment',
    sender: 'Бектур Усманов (Пассажир)',
    recipient: 'Азамат Исаев (Водитель)',
    rideId: 'rd_1'
  },
  {
    id: 'tx_2',
    amount: 1500,
    commission: 150,
    date: '30.05.2026 11:23',
    status: 'Completed',
    type: 'Payment',
    sender: 'Айгерим Сабырова (Пассажир)',
    recipient: 'Азамат Исаев (Водитель)',
    rideId: 'rd_1'
  },
  {
    id: 'tx_3',
    amount: 5400,
    commission: 540,
    date: '28.05.2026 23:15',
    status: 'Completed',
    type: 'Payout',
    sender: 'Сервис Попутка',
    recipient: 'Азамат Исаев (Водитель)',
    rideId: 'rd_3'
  },
  {
    id: 'tx_4',
    amount: 700,
    commission: 70,
    date: '25.05.2026 14:02',
    status: 'Refunded',
    type: 'Refund',
    sender: 'Каныкей Борубаева (Водитель)',
    recipient: 'Улан Маматов (Пассажир)',
    rideId: 'rd_4'
  }
];

export const INITIAL_PAYOUTS: Payout[] = [
  {
    id: 'pay_1',
    driverId: 'drv_1',
    driverName: 'Азамат Исаев',
    amount: 12400,
    bankCard: '•••• 4321',
    date: '29.05.2026',
    status: 'Completed'
  },
  {
    id: 'pay_2',
    driverId: 'drv_2',
    driverName: 'Каныкей Борубаева',
    amount: 8600,
    bankCard: '•••• 8899',
    date: '28.05.2026',
    status: 'Completed'
  },
  {
    id: 'pay_3',
    driverId: 'drv_1',
    driverName: 'Азамат Исаев',
    amount: 5400,
    bankCard: '•••• 4321',
    date: '30.05.2026',
    status: 'Pending'
  }
];

export const INITIAL_REFUNDS: Refund[] = [
  {
    id: 'ref_1',
    rideId: 'rd_4',
    passengerId: 'usr_6',
    passengerName: 'Улан Маматов',
    amount: 700,
    date: '25.05.2026',
    status: 'Completed',
    reason: 'Рейс Нарын - Бишкек был отменен водителем по техническим причинам.'
  }
];

export const INITIAL_FAQ: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'Как стать верифицированным водителем?',
    answer: 'Чтобы стать верифицированным водителем, зайдите в свой профиль в мобильном приложении, нажмите кнопку "Стать водителем" и загрузите три документа: качественное фото паспорта, водительского удостоверения и СТС автомобиля, а также четкое фото вашего автомобиля с государственным номером. Модерация занимает до 24 часов.',
    category: 'drivers'
  },
  {
    id: 'faq_2',
    question: 'Какая комиссия взимается сервисом?',
    answer: 'Сервис взимает фиксированную комиссию в размере 10% с каждой успешной поездки. Эти средства идут на поддержание серверов, рекламу и обеспечение безопасности поездок.',
    category: 'general'
  },
  {
    id: 'faq_3',
    question: 'Что делать, если водитель не приехал или ведет себя агрессивно?',
    answer: 'В случае нарушения правил пользования сервисом водителем, незамедлительно оставьте жалобу в карточке этой поездки, либо обратитесь в чат поддержки. Каждая жалоба тщательно рассматривается модератором, а злостных нарушителей мы заносим в черный список пожизненно.',
    category: 'safety'
  },
  {
    id: 'faq_4',
    question: 'Как осуществляется возврат средств при отмене поездки?',
    answer: 'Если поездку отменил водитель, средства пассажиру возвращаются в 100% размере автоматически на привязанную карту. Если пассажир отменяет бронь менее чем за 3 часа до выезда, удерживается комиссия за бронирование в пользу водителя.',
    category: 'passengers'
  }
];

export const INITIAL_LOGS: AdminLog[] = [
  {
    id: 'log_1',
    adminName: 'Админ Ислам',
    action: 'Одобрение верификации',
    targetType: 'verification',
    targetId: 'req_2',
    date: '12.03.2026 14:32',
    details: 'Одобрена заявка на верификацию водителя Азамат Исаев. Проверены паспорт, права и данные Toyota Prado 02KG777AAA.'
  },
  {
    id: 'log_2',
    adminName: 'Админ Ислам',
    action: 'Блокировка аккаунта',
    targetType: 'user_state',
    targetId: 'usr_5',
    date: '15.01.2026 10:15',
    details: 'Заблокирован пользователь Руслан Алиев. Причина: Систематический невыход на забронированные рейсы.'
  },
  {
    id: 'log_3',
    adminName: 'Админ Ислам',
    action: 'Добавление города',
    targetType: 'city',
    targetId: 'cit_8',
    date: '18.04.2026 16:11',
    details: 'Добавлен новый обслуживаемый регион: город Баткен.'
  }
];
