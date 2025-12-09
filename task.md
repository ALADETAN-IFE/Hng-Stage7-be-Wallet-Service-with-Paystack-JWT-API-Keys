# Wallet Service with Paystack, JWT & API Keys: Backend Stage 8 Task Submission Requirements

Hello, Battle-tested engineers, you may not rest 🔥

Please review the task requirements carefully and ensure your Stage 9 submission meets all criteria.

The goal is to test your ability to build simple backend endpoints, work with payments, authentication, service-to-service access, and basic wallet operations.

---

## Aim

Build a backend wallet service that allows users to deposit money using Paystack, manage wallet balances, view transaction history, and transfer funds to other users.

All wallet actions must be accessible using JWT authentication (from Google sign-in) or API keys (for service-to-service access).

---

## Objectives

- Understand how wallet systems work at a basic level.
- Implement Paystack deposits into a wallet.
- Allow users to view wallet balance and transaction history.
- Enable wallet-to-wallet transfers between users.
- Implement authentication using:
  - JWT (from Google sign-in)
  - API keys (for services)
- Enforce permissions, limits, and expiry on API keys.

---

## Scope (In-Scope)

- Google sign-in to generate JWT for users.
- Wallet creation per user.
- Wallet deposits using Paystack.
- Wallet balance, transaction history, and transaction status.
- Transfers between users' wallets.
- API key system for service-to-service wallet access.
- Permission-based API key access.
- Maximum of 5 active API keys per user at a time.
- API key expiration and rollover.
- Mandatory Paystack webhook handling.

---

## Out of Scope

- Frontend / UI.
- Manual bank transfers.
- Other payment providers outside Paystack.
- Advanced fraud detection.

---

## High-Level Flow (Easy Description)

### Authentication

- Users sign in using Google.
- After successful login, they receive a JWT.
- Services can generate API keys for wallet access.

### Wallet Deposit (Paystack)

- User or service hits the deposit endpoint.
- Server calls Paystack to initialize a transaction.
- Paystack returns a **payment link**.
- User completes payment on Paystack.
- Paystack sends a webhook to your server.
- Your server verifies the webhook and updates:
  - transaction status
  - wallet balance

✅ **Webhook implementation is mandatory.**

Paystack's verify endpoint can still be used as a fallback for manual checks.

### Wallet Transfer

- User sends money from their wallet to another user's wallet.
- System checks:
  - sender balance
  - valid recipient
- Wallet balances are updated.
- Transaction is recorded.

### API Keys (Service-to-Service)

- A user can generate API keys with specific permissions.
- API keys can access wallet endpoints instead of JWT.
- Only 5 active API keys are allowed per user.
- API keys:
  - must expire
  - can be revoked
  - can be rolled over into a new key using the same permissions.

---

## API Endpoints (Specification)

### 1. Google Authentication (JWT)

#### `GET /auth/google`
Triggers Google sign-in.

#### `GET /auth/google/callback`
- Logs in the user.
- Creates the user if not existing.
- Returns a **JWT token**.

---

### 2. API Key Management

#### a. Create API Key

**`POST /keys/create`**

**Example Request:**
```json
{
  "name": "wallet-service",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1D"
}
```

**Rules:**
- `expiry` accepts only: `1H`, `1D`, `1M`, `1Y` - Hour, Day, Month, Year
- The backend must convert expiry into a real datetime and store it as `expires_at`.
- Maximum 5 active keys per user.
- Permissions must be explicitly assigned.

**Example Response:**
```json
{
  "api_key": "sk_live_xxxxx",
  "expires_at": "2025-01-01T12:00:00Z"
}
```

#### b. Rollover Expired API Key

**`POST /keys/rollover`**

**Purpose:** Create a new API key using the same permissions as an expired key.

**Example Request:**
```json
{
  "expired_key_id": "FGH2485K6KK79GKG9GKGK",
  "expiry": "1M"
}
```

**Rules:**
- The expired key must truly be expired.
- The new key must reuse the same permissions.
- `expiry` must again be converted to a new `expires_at` value.

---

### 3. Wallet Deposit (Paystack)

**`POST /wallet/deposit`**

**Auth:**
- JWT
- API Key with `deposit` permission.

**Request:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "reference": "...",
  "authorization_url": "https://paystack.co/checkout/..."
}
```

---

### 4. Paystack Webhook (Mandatory)

**`POST /wallet/paystack/webhook`**

**Purpose:**
- Receive transaction updates from Paystack.
- Credit wallet only after webhook confirms success.

**Security:**
- Validate Paystack signature.

**Actions:**
- Verify signature.
- Find transaction by reference.
- Update:
  - transaction status
  - wallet balance

**Response:**
```json
{ "status": true }
```

---

### 5. Verify Deposit Status (Optional Manual Check)

**`GET /wallet/deposit/{reference}/status`**

**Response:**
```json
{
  "reference": "...",
  "status": "success|failed|pending",
  "amount": 5000
}
```

⚠️ **This endpoint must not credit wallets.**

Only the webhook is allowed to credit wallets.

---

### 6. Get Wallet Balance

**`GET /wallet/balance`**

**Auth:**
- JWT or API key with `read` permission.

**Response:**
```json
{
  "balance": 15000
}
```

---

### 7. Wallet Transfer

**`POST /wallet/transfer`**

**Auth:**
- JWT or API key with `transfer` permission.

**Request:**
```json
{
  "wallet_number": "4566678954356",
  "amount": 3000
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Transfer completed"
}
```

---

### 8. Transaction History

**`GET /wallet/transactions`**

**Auth:**
- JWT or API key with `read` permission.

**Example Response:**
```json
[
  {
    "type": "deposit",
    "amount": 5000,
    "status": "success"
  },
  {
    "type": "transfer",
    "amount": 3000,
    "status": "success"
  }
]
```

---

## Access Rules (JWT vs API Keys)

If request has:
- `Authorization: Bearer <token>` → treat as user
- `x-api-key: <key>` → treat as service

API keys must:
- Have valid permissions
- Not be expired or revoked

JWT users can perform all wallet actions.

---

## Security Considerations (Simple)

- Do not expose secret keys.
- Validate Paystack webhooks.
- Do not allow transfers with insufficient balance.
- Do not allow API keys without correct permissions.
- Do not allow more than 5 active API keys per user.
- Expired API keys must be rejected automatically.

---

## Error Handling & Idempotency

- Paystack reference must be unique.
- Webhooks must be idempotent (no double-credit).
- Transfers must be atomic (no partial deductions).
- Return clear errors for:
  - insufficient balance
  - invalid API key
  - expired API key
  - missing permissions

---

## Deadline

**Dec 10, Wednesday 11:59pm**

## Submission Link

https://forms.gle/sFH7SDgfoX8AYbPj8
