# Proof of Shipping

## Что это

Proof of Shipping — это hackathon MVP для milestone-based funding.

Идея простая: деньги не должны выдаваться только потому, что кто-то пообещал что-то сделать. Деньги должны двигаться тогда, когда есть реальный результат.

В этом продукте команда загружает доказательства прогресса, AI оценивает, действительно ли milestone выполнен, и после одобрения можно разблокировать следующий tranche funding-а.

## Как это работает

Flow максимально простой:

1. Пользователи или contributors вносят деньги в общий vault.
2. Builder работает над milestone.
3. Builder отправляет progress и evidence.
4. AI проверяет, есть ли реальный результат.
5. Если milestone одобрен, следующий tranche можно unlock.

Идея продукта: funding должен зависеть от результата, а не от обещаний.

## Архитектура

### Frontend
- Next.js App Router
- TypeScript
- Переиспользуемые UI-компоненты
- Основные страницы:
  - `/` — overview и список vaults
  - `/create-vault` — создание vault
  - `/submit-progress` — отправка evidence
  - `/vault/[id]` — review milestone, verdict и unlock flow

### Backend / API
- Используются route handlers внутри Next.js.
- Основные endpoint-ы:
  - `POST /api/submit-evidence`
  - `POST /api/judge-milestone`

`/api/judge-milestone`:
- получает `vaultId` и `milestoneId`
- достает milestone из store
- берет последнее evidence submission
- отправляет данные в OpenAI
- получает structured verdict
- сохраняет verdict в store

### AI Layer
- Используется OpenAI API через `OPENAI_API_KEY`
- AI получает:
  - title milestone
  - description milestone
  - summary progress
  - PR title
  - diff summary
  - changelog
  - demo notes
- В ответ AI возвращает verdict:
  - `APPROVE`
  - `REJECT`
  - `NEED_MORE_EVIDENCE`
- Также возвращаются:
  - confidence
  - explanation
  - matchedSignals
  - missingSignals

### Data Layer
- Сейчас используется in-memory store
- Это сделано специально для hackathon speed
- В store лежат:
  - vaults
  - milestones
  - evidence submissions
  - verdicts
  - release state

### Solana Layer
Сейчас on-chain логика в проекте mock-овая.

Но продукт уже моделирует нужный flow:
- shared vault
- deposit
- milestone gating
- unlock tranche

В следующей версии сюда можно подключить реальный Solana smart contract.

## Структура проекта

```text
app/
  api/
    judge-milestone/
    submit-evidence/
  create-vault/
  submit-progress/
  vault/[id]/
  layout.tsx
  page.tsx

components/
  layout/
  ui/
  vault/

lib/
  domain/
  store/
  utils.ts
```

## Установка и запуск

1. Клонируй репозиторий.
2. Установи зависимости:

```bash
npm install
```

3. Создай `.env` файл:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Запусти проект:

```bash
npm run dev
```

5. Открой в браузере:

```text
http://localhost:3000
```

## Как протестировать demo

Быстрый demo flow:

1. Открой homepage.
2. Перейди на `/submit-progress`.
3. Выбери seeded vault и milestone.
4. Отправь evidence.
5. Перейди на страницу vault.
6. Нажми `Review with AI`.
7. Посмотри verdict.
8. Если milestone одобрен, нажми `Unlock Tranche`.
9. Убедись, что UI обновился:
  - milestone стал unlocked
  - released capital увеличился
  - remaining capital уменьшился
  - activity log пополнился

## Ограничения MVP

Это hackathon MVP, поэтому ограничения честные и ожидаемые:

- используется in-memory storage вместо базы данных
- нет полноценного on-chain исполнения транзакций
- AI judging пока упрощенный
- нет auth и role management
- нет постоянного audit trail

## Будущее развитие

Что можно сделать дальше:
- подключить реальную базу данных
- добавить реальный smart contract на Solana
- добавить настоящие on-chain deposits и tranche release
- подключить GitHub integration для PR verification
- добавить oracle / attestation layer
- добавить wallet auth и роли
- расширить AI review за счет commit history, dashboards, Loom и project artifacts

## Зачем этот проект нужен

Proof of Shipping показывает очень понятную идею:

Капитал должен двигаться не потому, что кто-то красиво рассказывает про прогресс, а потому что прогресс можно проверить.

Это делает funding более прозрачным, более честным и более автоматизированным.
