# 📦 Ezap Bulk Sender

![Coverage](./coverage/badge.svg)

<p align="center">
  <img src="./docs/logo-ezap-bulk-sender.webp" alt="EZap Bulk Sender Logo" width="100"/>
</p>

Scalable system for sending automated WhatsApp messages using a decoupled architecture, asynchronous queues, messaging, and orchestration with **Nx** in a monorepo.

---

## ✨ Technologies

- **Monorepo with Nx**
- Node.js + Express
- BullMQ + Redis
- RabbitMQ
- Drizzle
- PostgreSQL + Drizzle ORM
- WhatsApp (via Baileys)
- Sentry + Pino (Logs and observability)
- Artillery (Load testing)
- Vitest (Unit and integration tests)
- Docker Compose

---

## 🧱 Nx Structure

The project is structured as a monorepo with Nx, containing:

| Project                  | Description                              |
|--------------------------|------------------------------------------|
| `ezap-bulk-sender-api`   | Backend for sending messages via queues |
| `ezap-bulk-sender-front` | Frontend with CSV upload and sending visualization |

---

### 🧱 Project Architecture

```mermaid
flowchart TD
  %% --- API Entrypoints ---
  A1["POST /send-message"] --> USECASE1["UseCase: Enqueue + Publish"]
  A2["GET /qrcode"] --> USECASE2["UseCase: Create QRCode"]

  %% --- Redis: para Auth, BullMQ e RateLimit ---
  USECASE1 --> REDIS1["Redis: RateLimit/Auth"]
  USECASE2 --> REDIS3["Redis: WhatsApp Session"]

  %% --- BullMQ Worker ---
  USECASE1 --> BULL1["BullMQ: Add to Queue"]
  BULL1 --> WORKER["Worker: Process Job"]
  WORKER --> MQ1["Publish to RabbitMQ (message.ready)"]

  %% --- RabbitMQ + Consumer ---
  MQ1 --> CONSUMER["Consumer: Handle message.ready"]
  CONSUMER --> SENDMSG["Send Message to WhatsApp"]
  CONSUMER --> LOG1["Save Log in PostgreSQL"]
  CONSUMER --> REDIS3

  %% --- Error handling ---
  CONSUMER --> SENTRY["Capture Error (Sentry)"]

  %% --- Infraestrutura extra ---
  LOG1 --> POSTGRES["PostgreSQL"]
  REDIS1 & REDIS3 --> REDIS["Redis"]
  BULL1 --> REDIS

  %% Estilos
  style A1 fill:#E3F2FD,stroke:#2196F3
  style A2 fill:#E1F5FE,stroke:#0288D1
  style USECASE1 fill:#BBDEFB,stroke:#1976D2
  style USECASE2 fill:#B3E5FC,stroke:#039BE5
  style REDIS1 fill:#DCEDC8,stroke:#689F38
  style REDIS3 fill:#F0F4C3,stroke:#AFB42B
  style REDIS fill:#F1F8E9,stroke:#558B2F
  style BULL1 fill:#FFF3E0,stroke:#FB8C00
  style WORKER fill:#FFE0B2,stroke:#F57C00
  style MQ1 fill:#F3E5F5,stroke:#8E24AA
  style CONSUMER fill:#FCE4EC,stroke:#D81B60
  style SENDMSG fill:#E8F5E9,stroke:#43A047
  style LOG1 fill:#E1F5FE,stroke:#0288D1
  style POSTGRES fill:#B3E5FC,stroke:#0277BD
  style SENTRY fill:#FFEBEE,stroke:#D32F2F
```

---

## ⚙️ How to run locally

### 1. Clone the project

```
git clone https://github.com/EliseuSantos/ezap-bulk-sender.git
cd ezap-bulk-sender
```

### 2. Configure the environment

```
cp apps/backend/.env.example .env
```

```
cp apps/frontend/.env.example .env
```

### 3. Start the infrastructure with Docker Compose

```
docker-compose up --build
```

The application will be available at:

| Service          | URL                                      |
|------------------|------------------------------------------|
| API (Express)    | `http://localhost:3000`                  |
| Frontend (Next)  | `http://localhost:3001`                  |
| RabbitMQ UI      | `http://localhost:15672` (`guest/guest`) |
| Redis Commander  | `http://localhost:8081`                  |
| Drizzle Studio   | `https://local.drizzle.studio`           |
| PostgreSQL       | `localhost:5432`                         |

---

## 🚀 Useful Scripts (via Nx)

| Command                          | Description                                     |
|----------------------------------|-------------------------------------------------|
| `npx nx run ezap-bulk-sender-api:dev`                       | Starts the backend and frontend in dev mode     |
| `npx nx run ezap-bulk-sender-api:studio`                    | Opens Drizzle Studio                            |
| `npx nx run-many --target=serve --projects=ezap-bulk-sender-api,ezap-bulk-sender-front --parallel`| Starts multiple projects in parallel            |

---

## 📩 Message Sending Flow

1. `POST /send-message` request
2. Message is queued with BullMQ
3. Event is published to RabbitMQ
4. Worker consumes the event and sends it via WhatsApp
5. In case of an error:
   - Retry with exponential backoff
   - Logs in Sentry and via Pino
   - Sending log is persisted in PostgreSQL

---

## 🧪 Tests

Organized into:

- `__tests__/unit` – Business rules and services
- `__tests__/integration` – Flow and infrastructure integration tests
- `__tests__/load` – Load tests

---

## 🛡️ Security

- Helmet, CORS, and XSS protection
- Rate limiting by IP
- Validation with Zod + zod-express-middleware

---

## ✅ License

Creative Commons Attribution-NonCommercial 4.0 International Public License
