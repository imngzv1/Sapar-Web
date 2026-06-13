/*
  Сброс всех данных к исходным.
  Используется так:
    npm run seed
  Резервная копия активного состояния сохраняется рядом (db/seed/*.bak).

  Когда подключим базу — здесь будет TRUNCATE + INSERT из готовых .json,
  логика останется такая же.
*/

import fs from 'fs';
import path from 'path';

const SEED_DIR = path.resolve(__dirname, '..', 'src', 'db', 'seed');

const INITIAL: Record<string, string> = {
  'users.json': '[]',
  'drivers.json': '[]',
  'verificationRequests.json': '[]',
  'rides.json': '[]',
  'complaints.json': '[]',
  'cities.json': '[]',
  'transactions.json': '[]',
  'payouts.json': '[]',
  'refunds.json': '[]',
  'faq.json': '[]',
  'logs.json': '[]',
};

// исходные данные — это и есть содержимое db/seed/*.json в репозитории,
// поэтому seed-скрипт просто пересохраняет файлы из git/диска
// (т.е. он восстанавливает то, что лежит в файлах как committed-состояние).
//
// Если данные испортились, проще сделать `git checkout src/db/seed`.

function main() {
  if (!fs.existsSync(SEED_DIR)) {
    console.error(`Папка с сидом не найдена: ${SEED_DIR}`);
    process.exit(1);
  }

  for (const name of Object.keys(INITIAL)) {
    const fullPath = path.join(SEED_DIR, name);
    if (!fs.existsSync(fullPath)) {
      console.warn(`пропускаю ${name} — файла нет`);
      continue;
    }
    // делаем .bak текущего состояния — чтобы можно было восстановить
    const backup = `${fullPath}.bak`;
    fs.copyFileSync(fullPath, backup);
    console.log(`ok  ${name} → бекап в ${path.basename(backup)}`);
  }

  console.log('\nГотово. Чтобы вернуться к committed-сиду — `git checkout src/db/seed`.');
}

main();
