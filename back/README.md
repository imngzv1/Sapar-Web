# Попутка — бэкенд админ-панели

Node.js + Express + TypeScript. Отдаёт данные админ-фронту и пишет журнал действий администратора.

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run dev          # автоперезагрузка через tsx watch
# или через pm2:
npm run pm2:start
npm run pm2:logs
```

После запуска API доступен на `http://localhost:4000` (см. `PORT` в `.env`).

## Структура

```
back/
├── ecosystem.config.cjs   — конфиг PM2
├── tsconfig.json
├── package.json
├── .env.example
├── scripts/
│   └── seed.ts            — утилита (бекап / откат сидов)
├── uploads/               — пока пусто, под фото документов
└── src/
    ├── index.ts           — точка входа: express + middleware + роутер
    ├── types.ts           — общие типы домена
    ├── config.ts          — env
    ├── db/
    │   ├── connection.ts  — заглушка под SQL-драйвер
    │   ├── schema.sql     — схема будущих таблиц
    │   └── seed/          — JSON-сиды (пока работаем на них)
    ├── middleware/
    │   ├── adminContext.ts
    │   ├── requestLogger.ts
    │   └── errorHandler.ts
    ├── routes/            — express-роутеры по доменам
    └── services/          — бизнес-логика и доступ к данным
        ├── store.ts       — generic CRUD поверх JSON
        ├── audit.ts       — журнал действий
        ├── logRotator.ts  — авточистка > 30 дней
        ├── users.ts
        ├── drivers.ts
        ├── verifications.ts
        ├── rides.ts
        ├── complaints.ts
        ├── cities.ts
        ├── finances.ts
        └── faq.ts
```

Папка с логами создаётся рядом — `../logs/`.

## База данных

Сейчас данные читаются и пишутся в JSON (`src/db/seed/*.json`).
Когда подключим базу:

1. в `src/db/connection.ts` поднять пул соединений (`pg` / `mysql2`);
2. в `src/services/store.ts` заменить чтение/запись файлов на SQL-запросы;
3. контроллеров нет, роуты и сервисы остаются — поменяется только store.

Схема таблиц — в `src/db/schema.sql`.

## Журнал админа

Каждое мутирующее действие проходит через `recordAudit(...)`. Запись уходит:

1. в journal (`src/db/seed/logs.json`, будущая `admin_logs`) — фронт читает через `GET /api/logs`;
2. в файл `../logs/admin-actions-YYYY-MM-DD.log` (строки JSON);
3. в stdout — попадает в `pm2 logs`.

`logRotator` раз в сутки и при старте чистит:

- файлы `admin-actions-*.log`, которым больше `LOG_RETENTION_DAYS` (по умолчанию 30);
- записи из активного журнала с такой же давностью (старые отправляются в `../logs/archive.log`).

## API

| Метод  | Маршрут                              | Назначение                                  |
| ------ | ------------------------------------ | ------------------------------------------- |
| GET    | `/health`                            | проверка живости                            |
| GET    | `/api/users`                         | список пользователей                        |
| GET    | `/api/users/:id`                     | один пользователь                           |
| POST   | `/api/users/:id/block`               | заблокировать (body: `{ reason }`)          |
| POST   | `/api/users/:id/unblock`             | разблокировать                              |
| GET    | `/api/verifications`                 | заявки водителей                            |
| POST   | `/api/verifications/:id/approve`     | одобрить                                    |
| POST   | `/api/verifications/:id/reject`      | отклонить (body: `{ reason }`)              |
| GET    | `/api/drivers`                       | водители                                    |
| POST   | `/api/drivers/:id/suspend`           | приостановить                               |
| POST   | `/api/drivers/:id/activate`          | активировать                                |
| GET    | `/api/rides`                         | поездки                                     |
| POST   | `/api/rides/:id/cancel`              | отменить (создаёт возвраты + транзакции)    |
| GET    | `/api/complaints`                    | жалобы                                      |
| POST   | `/api/complaints/:id/resolve`        | удовлетворить (body: `{ decision }`)        |
| POST   | `/api/complaints/:id/dismiss`        | отклонить (body: `{ decision }`)            |
| GET    | `/api/cities`                        | города                                      |
| POST   | `/api/cities`                        | добавить (body: `{ name }`)                 |
| POST   | `/api/cities/:id/toggle`             | вкл/выкл                                    |
| DELETE | `/api/cities/:id`                    | удалить                                     |
| GET    | `/api/transactions`                  | транзакции                                  |
| GET    | `/api/payouts`                       | выплаты                                     |
| GET    | `/api/refunds`                       | возвраты                                    |
| POST   | `/api/payouts/:id/approve`           | подтвердить выплату                         |
| GET    | `/api/faq`                           | FAQ                                         |
| POST   | `/api/faq`                           | добавить (`{ question, answer, category }`) |
| DELETE | `/api/faq/:id`                       | удалить                                     |
| GET    | `/api/logs`                          | журнал действий админа                      |

Имя админа берётся из заголовка `X-Admin-Name`, иначе — `DEFAULT_ADMIN_NAME` из `.env`.
