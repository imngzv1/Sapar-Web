-- =============================================================
-- Схема базы данных админ-панели «Попутка».
-- Пока база не подключена — это заготовка под Postgres/MySQL.
-- Имена таблиц совпадают с именами файлов в db/seed/.
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
  id                    VARCHAR(64) PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL,
  phone                 VARCHAR(32)  NOT NULL,
  email                 VARCHAR(255),
  role                  VARCHAR(16)  NOT NULL,
  avatar                TEXT,
  status                VARCHAR(16)  NOT NULL DEFAULT 'active',
  registration_date     VARCHAR(32),
  block_reason          TEXT,
  verified              BOOLEAN      NOT NULL DEFAULT FALSE,
  total_rides_passenger INTEGER      NOT NULL DEFAULT 0,
  total_rides_driver    INTEGER      NOT NULL DEFAULT 0,
  rating                NUMERIC(3,2)
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id                     VARCHAR(64) PRIMARY KEY,
  user_id                VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  user_name              VARCHAR(255),
  user_phone             VARCHAR(32),
  user_avatar            TEXT,
  car_model              VARCHAR(255),
  car_number             VARCHAR(32),
  car_color              VARCHAR(64),
  car_year               INTEGER,
  document_passport_url  TEXT,
  document_license_url   TEXT,
  document_car_photo_url TEXT,
  status                 VARCHAR(16) NOT NULL DEFAULT 'Pending',
  reject_reason          TEXT,
  date_submitted         VARCHAR(32),
  date_reviewed          VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS drivers (
  id                VARCHAR(64) PRIMARY KEY,
  user_id           VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(255),
  phone             VARCHAR(32),
  avatar            TEXT,
  rating            NUMERIC(3,2),
  car_model         VARCHAR(255),
  car_number        VARCHAR(32),
  car_color         VARCHAR(64),
  completed_rides   INTEGER NOT NULL DEFAULT 0,
  total_earned      INTEGER NOT NULL DEFAULT 0,
  verification_date VARCHAR(32),
  status            VARCHAR(16) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS rides (
  id             VARCHAR(64) PRIMARY KEY,
  driver_id      VARCHAR(64) REFERENCES drivers(id) ON DELETE SET NULL,
  driver_name    VARCHAR(255),
  driver_avatar  TEXT,
  from_city      VARCHAR(128),
  to_city        VARCHAR(128),
  date           VARCHAR(32),
  time           VARCHAR(16),
  price          INTEGER,
  total_seats    INTEGER,
  occupied_seats INTEGER,
  status         VARCHAR(16) NOT NULL DEFAULT 'Active',
  car_model      VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS ride_passengers (
  ride_id      VARCHAR(64) REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id VARCHAR(64),
  name         VARCHAR(255),
  phone        VARCHAR(32),
  PRIMARY KEY (ride_id, passenger_id)
);

CREATE TABLE IF NOT EXISTS complaints (
  id             VARCHAR(64) PRIMARY KEY,
  reporter_id    VARCHAR(64),
  reporter_name  VARCHAR(255),
  reported_id    VARCHAR(64),
  reported_name  VARCHAR(255),
  reported_role  VARCHAR(16),
  category       VARCHAR(32),
  text           TEXT,
  date           VARCHAR(32),
  status         VARCHAR(16) NOT NULL DEFAULT 'Pending',
  decision       TEXT
);

CREATE TABLE IF NOT EXISTS cities (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(128) NOT NULL,
  status      VARCHAR(16) NOT NULL DEFAULT 'active',
  rides_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id         VARCHAR(64) PRIMARY KEY,
  amount     INTEGER NOT NULL,
  commission INTEGER NOT NULL DEFAULT 0,
  date       VARCHAR(32),
  status     VARCHAR(16) NOT NULL,
  type       VARCHAR(16) NOT NULL,
  sender     VARCHAR(255),
  recipient  VARCHAR(255),
  ride_id    VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS payouts (
  id          VARCHAR(64) PRIMARY KEY,
  driver_id   VARCHAR(64) REFERENCES drivers(id) ON DELETE SET NULL,
  driver_name VARCHAR(255),
  amount      INTEGER NOT NULL,
  bank_card   VARCHAR(32),
  date        VARCHAR(32),
  status      VARCHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS refunds (
  id             VARCHAR(64) PRIMARY KEY,
  ride_id        VARCHAR(64),
  passenger_id   VARCHAR(64),
  passenger_name VARCHAR(255),
  amount         INTEGER NOT NULL,
  date           VARCHAR(32),
  status         VARCHAR(16) NOT NULL,
  reason         TEXT
);

CREATE TABLE IF NOT EXISTS faq (
  id       VARCHAR(64) PRIMARY KEY,
  question TEXT NOT NULL,
  answer   TEXT NOT NULL,
  category VARCHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id          VARCHAR(64) PRIMARY KEY,
  admin_name  VARCHAR(255) NOT NULL,
  action      VARCHAR(255) NOT NULL,
  target_type VARCHAR(32)  NOT NULL,
  target_id   VARCHAR(64)  NOT NULL,
  date        VARCHAR(32)  NOT NULL,
  details     TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
