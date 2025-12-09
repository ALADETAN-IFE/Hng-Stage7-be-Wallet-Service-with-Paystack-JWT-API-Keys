# Wallet Service with Paystack, JWT & API Keys

A backend wallet service that allows users to deposit money using Paystack, manage wallet balances, view transaction history, and transfer funds to other users. The service supports both JWT authentication (Google sign-in) and API keys for service-to-service access.

## Features

- 🔐 **Google OAuth Authentication** - JWT token-based user authentication
- 🔑 **API Key Management** - Service-to-service authentication with permissions
- 💰 **Wallet Deposits** - Integration with Paystack payment gateway
- 📊 **Transaction History** - Track all deposits and transfers
- 💸 **Wallet Transfers** - Send funds between users
- 🔔 **Webhook Support** - Real-time payment confirmations
- 🛡️ **Security** - Permission-based access control and API key expiration

## Tech Stack

- **Framework**: Next.js (TypeScript)
- **Payment Gateway**: Paystack
- **Authentication**: Google OAuth, JWT, API Keys
- **Database**: [Your database choice]

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google sign-in
- `GET /auth/google/callback` - Handle Google OAuth callback

### API Key Management
- `POST /keys/create` - Create new API key with permissions
- `POST /keys/rollover` - Rollover expired API key

### Wallet Operations
- `POST /wallet/deposit` - Initialize Paystack deposit
- `POST /wallet/paystack/webhook` - Handle Paystack webhooks (mandatory)
- `GET /wallet/deposit/{reference}/status` - Check deposit status
- `GET /wallet/balance` - Get wallet balance
- `POST /wallet/transfer` - Transfer funds to another wallet
- `GET /wallet/transactions` - Get transaction history

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Paystack account and API keys
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys.git
cd hng-stage7-be-wallet-service-with-paystack-jwt-api-keys
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=your_database_url

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Authentication Methods

### JWT (User Authentication)
```bash
Authorization: Bearer <jwt_token>
```

### API Key (Service Authentication)
```bash
x-api-key: <api_key>
```

## API Key Permissions

API keys support the following permissions:
- `read` - View wallet balance and transactions
- `deposit` - Initialize deposits
- `transfer` - Transfer funds between wallets

**Rules:**
- Maximum 5 active API keys per user
- Expiry options: `1H`, `1D`, `1M`, `1Y` (Hour, Day, Month, Year)
- Expired keys can be rolled over with same permissions

## Paystack Integration

### Webhook Setup

Configure your Paystack webhook URL:
```
https://your-domain.com/wallet/paystack/webhook
```

The webhook is **mandatory** for crediting wallets after successful payments.

### Webhook Security

All webhooks are validated using Paystack signature verification to ensure authenticity.

## Security Features

- ✅ Paystack webhook signature validation
- ✅ JWT token verification
- ✅ API key permission checking
- ✅ API key expiration enforcement
- ✅ Balance validation before transfers
- ✅ Idempotent webhook handling
- ✅ Atomic transfer operations

## Error Handling

The API returns clear error messages for:
- Insufficient balance
- Invalid or expired API keys
- Missing permissions
- Duplicate transactions
- Invalid webhook signatures

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── keys/
│   │   └── wallet/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
├── models/
└── types/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

- Repository: [GitHub](https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys)
- Issues: [GitHub Issues](https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys/issues)

## Acknowledgments

- [Paystack](https://paystack.com) for payment processing
- [Next.js](https://nextjs.org) for the framework
- HNG Internship Program
