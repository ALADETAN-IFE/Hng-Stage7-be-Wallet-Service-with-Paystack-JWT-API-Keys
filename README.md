# Wallet Service with Paystack, JWT & API Keys

> **HNG Stage 8 Backend Task Submission**  
> A production-ready wallet service with Paystack integration, Google OAuth, and API key authentication for service-to-service access.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Webhook Setup](#webhook-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 Overview

A backend wallet service that allows users to deposit money using Paystack, manage wallet balances, view transaction history, and transfer funds to other users. The service supports dual authentication: JWT tokens for user authentication via Google sign-in and API keys for service-to-service access.

**Key Highlights:**
- 🔐 Secure authentication with Google OAuth and API keys
- 💳 Seamless Paystack payment integration with webhook support
- 💰 Real-time wallet balance tracking
- 🔄 Wallet-to-wallet transfers with atomic transactions
- 📊 Complete transaction history and status tracking
- 🛡️ SHA-256 hashed API keys with permission-based access
- 🔒 Maximum 5 active API keys per user with expiry management

## ✨ Features

### Authentication & Security
- 🔐 **Google OAuth Authentication** - Secure JWT token-based user authentication
- 🔑 **API Key Management** - Service-to-service authentication with SHA-256 hashing
- 🛡️ **Permission-Based Access** - Granular control over API key permissions
- ⏰ **API Key Expiration** - Time-limited keys with rollover functionality
- 🔒 **Secure Wallet Numbers** - 13-digit unique wallet identifiers

### Wallet Operations
- 💰 **Deposit Money** - Integration with Paystack payment gateway
- 💸 **Transfer Funds** - Send money between wallet users with validation
- 📊 **Transaction History** - Complete audit trail of all transactions
- 💳 **Balance Inquiry** - Real-time wallet balance checking
- 🔔 **Webhook Support** - Automatic payment confirmation via Paystack webhooks

### Developer Experience
- 📖 **Swagger UI** - Interactive API documentation at `/api-doc`
- 🧪 **Comprehensive Validation** - Input validation for all endpoints
- 🔄 **Idempotent Operations** - Safe transaction handling
- ⚡ **MongoDB Transactions** - Atomic operations for data consistency
- 📝 **TypeScript** - Full type safety across the codebase

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.0.8 (App Router) with TypeScript |
| **Database** | MongoDB with Mongoose ODM |
| **Payment Gateway** | Paystack |
| **Authentication** | Google OAuth 2.0, JWT (jsonwebtoken) |
| **Documentation** | Swagger UI (next-swagger-doc) |
| **Security** | Node.js crypto module (SHA-256) |
| **Validation** | Zod |
| **Runtime** | Node.js 20+ |

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed ([Download](https://nodejs.org/))
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Paystack account and API keys ([Sign up](https://paystack.com/))
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/))
- pnpm package manager (recommended) or npm/yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys.git
cd hng-stage7-be-wallet-service-with-paystack-jwt-api-keys
```

2. **Install dependencies:**
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/wallet_service
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wallet_service

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server:**
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

5. **Access the application:**
- **Homepage**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: [http://localhost:3000/api-doc](http://localhost:3000/api-doc)

### Build for Production

```bash
pnpm build
pnpm start
```

## 📖 API Documentation

Interactive API documentation is available via Swagger UI at:
- **Development**: [http://localhost:3000/api-doc](http://localhost:3000/api-doc)
- **Production**: `https:/hng-8-be-battle-testers.vercel.app//api-doc`

The Swagger documentation includes:
- Complete endpoint specifications
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Try-it-out functionality for testing

## 🔐 Authentication

The service supports two authentication methods:

### 1. JWT Authentication (User Access)

**Flow:**
1. User visits `/api/auth/google` to initiate Google sign-in
2. After successful authentication, user is redirected to `/api/auth/google/callback`
3. Server generates a JWT token and returns it
4. User includes the token in subsequent requests

**Usage:**
```bash
# Include JWT in Authorization header
Authorization: Bearer your_jwt_token_here
```

### 2. API Key Authentication (Service-to-Service)

**Flow:**
1. User creates an API key via `/api/keys/create` with specific permissions
2. API key is hashed (SHA-256) and stored securely
3. Service includes the API key in requests

**Usage:**
```bash
# Include API key in X-API-Key header
X-API-Key: your_api_key_here
```

**API Key Features:**
- Maximum 5 active keys per user
- Custom permissions (wallet:read, wallet:write, transactions:read)
- Expiration dates
- Rollover capability to replace expired keys
- Secure SHA-256 hashing

## 📡 API Endpoints

### Authentication Endpoints

#### `GET /api/auth/google`
Initiates Google OAuth flow.

**Response:** Redirects to Google sign-in page

---

#### `GET /api/auth/google/callback`
Handles Google OAuth callback and generates JWT.

**Query Parameters:**
- `code` (string): OAuth authorization code

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "walletNumber": "4561234567890"
  }
}
```

---

### API Key Management

#### `POST /api/keys/create`
Creates a new API key with specified permissions.

**Authentication:** JWT required

**Request Body:**
```json
{
  "name": "Production API Key",
  "permissions": ["wallet:read", "wallet:write", "transactions:read"],
  "expiresInDays": 90
}
```

**Response:**
```json
{
  "apiKey": "wsk_live_1234567890abcdef",
  "keyId": "key_id",
  "expiresAt": "2025-03-10T00:00:00.000Z",
  "permissions": ["wallet:read", "wallet:write", "transactions:read"]
}
```

⚠️ **Important:** Save the `apiKey` immediately - it won't be shown again!

---

#### `POST /api/keys/rollover`
Rolls over an expired API key to a new one with the same permissions.

**Authentication:** JWT required

**Request Body:**
```json
{
  "keyId": "key_id_to_rollover"
}
```

**Response:**
```json
{
  "apiKey": "wsk_live_new1234567890abcdef",
  "keyId": "new_key_id",
  "expiresAt": "2025-06-10T00:00:00.000Z",
  "permissions": ["wallet:read", "wallet:write", "transactions:read"]
}
```

---

### Wallet Operations

#### `GET /api/wallet/balance`
Retrieves current wallet balance.

**Authentication:** JWT or API Key (requires `wallet:read` permission)

**Response:**
```json
{
  "walletNumber": "4561234567890",
  "balance": 15000.50,
  "currency": "NGN"
}
```

---

#### `POST /api/wallet/deposit`
Initializes a Paystack deposit transaction.

**Authentication:** JWT or API Key (requires `wallet:write` permission)

**Request Body:**
```json
{
  "amount": 5000,
  "email": "user@example.com",
  "currency": "NGN"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment initialized",
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123",
    "access_code": "abc123",
    "reference": "ref_1234567890"
  }
}
```

**Flow:**
1. User receives `authorization_url` to complete payment
2. User completes payment on Paystack
3. Paystack sends webhook to your server
4. Wallet balance is automatically updated

---

#### `GET /api/wallet/deposit/:reference/status`
Checks the status of a deposit transaction.

**Authentication:** JWT or API Key (requires `transactions:read` permission)

**Response:**
```json
{
  "reference": "ref_1234567890",
  "status": "success",
  "amount": 5000,
  "currency": "NGN",
  "paidAt": "2025-12-10T10:30:00.000Z"
}
```

**Possible statuses:** `pending`, `success`, `failed`

---

#### `POST /api/wallet/transfer`
Transfers funds from your wallet to another user's wallet.

**Authentication:** JWT or API Key (requires `wallet:write` permission)

**Request Body:**
```json
{
  "recipientWalletNumber": "4569876543210",
  "amount": 1000,
  "description": "Payment for services"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Transfer successful",
  "transaction": {
    "id": "txn_id",
    "amount": 1000,
    "recipientWalletNumber": "4569876543210",
    "description": "Payment for services",
    "timestamp": "2025-12-10T10:30:00.000Z"
  },
  "newBalance": 14000.50
}
```

**Validation:**
- Sufficient balance required
- Valid recipient wallet number (13 digits, not all zeros)
- Positive amount
- Cannot transfer to yourself

---

#### `GET /api/wallet/transactions`
Retrieves transaction history.

**Authentication:** JWT or API Key (requires `transactions:read` permission)

**Query Parameters:**
- `limit` (number, optional): Number of transactions to return (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `type` (string, optional): Filter by type (`deposit` or `transfer`)

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_1",
      "type": "deposit",
      "amount": 5000,
      "status": "success",
      "reference": "ref_1234567890",
      "timestamp": "2025-12-10T10:30:00.000Z"
    },
    {
      "id": "txn_2",
      "type": "transfer",
      "amount": 1000,
      "recipientWalletNumber": "4569876543210",
      "description": "Payment for services",
      "status": "success",
      "timestamp": "2025-12-10T10:35:00.000Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

---

#### `POST /api/wallet/paystack/webhook`
Handles Paystack webhook events for payment confirmation.

**Authentication:** Paystack signature verification

**Headers:**
- `x-paystack-signature`: Paystack webhook signature

**Request Body:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_1234567890",
    "amount": 500000,
    "status": "success"
  }
}
```

**Response:**
```json
{
  "status": "success"
}
```

⚠️ **Important:** This endpoint is called automatically by Paystack. You must configure your webhook URL in your Paystack dashboard.

---

## 🔔 Webhook Setup

To receive payment confirmations automatically, configure your webhook in Paystack:

1. **Login to Paystack Dashboard**: [https://dashboard.paystack.com/](https://dashboard.paystack.com/)
2. **Navigate to**: Settings → Webhooks
3. **Add Webhook URL**: `https://your-domain.com/api/wallet/paystack/webhook`
4. **Copy Webhook Secret**: Save it to your `.env.local` as `PAYSTACK_WEBHOOK_SECRET`

**Supported Events:**
- `charge.success` - Payment completed successfully

**Security:**
- Webhook signature verification is mandatory
- Only verified requests from Paystack are processed
- Invalid signatures are rejected with 401 Unauthorized

---

## 🧪 Testing

### Manual API Testing

Use the Swagger UI at `/api-doc` for interactive testing, or use curl/Postman:

**Example: Get Wallet Balance**
```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example: Create API Key**
```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API Key",
    "permissions": ["wallet:read", "wallet:write"],
    "expiresInDays": 30
  }'
```

**Example: Transfer Funds**
```bash
curl -X POST http://localhost:3000/api/wallet/transfer \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientWalletNumber": "4569876543210",
    "amount": 1000,
    "description": "Test transfer"
  }'
```

### Testing Paystack Webhooks Locally

Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

Then configure the ngrok URL in your Paystack webhook settings:
```
https://your-ngrok-url.ngrok.io/api/wallet/paystack/webhook
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com/)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Set Environment Variables** in Vercel Dashboard:
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - `PAYSTACK_WEBHOOK_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`
   - `MONGODB_URI`
   - `NEXT_PUBLIC_APP_URL`

4. **Update Webhook URL** in Paystack Dashboard to your Vercel deployment URL

### Other Platforms

The application can also be deployed to:
- **Railway**: [railway.app](https://railway.app/)
- **Render**: [render.com](https://render.com/)
- **AWS/Azure/GCP**: Using Docker containers
- **DigitalOcean App Platform**: [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)

---

## 📁 Project Structure

```
hng-stage7-be-wallet-service-with-paystack-jwt-api-keys/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── google/
│   │   │   │       ├── route.ts           # Google OAuth initiation
│   │   │   │       └── callback/
│   │   │   │           └── route.ts       # Google OAuth callback
│   │   │   ├── keys/
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts           # Create API key
│   │   │   │   └── rollover/
│   │   │   │       └── route.ts           # Rollover API key
│   │   │   ├── wallet/
│   │   │   │   ├── balance/
│   │   │   │   │   └── route.ts           # Get wallet balance
│   │   │   │   ├── deposit/
│   │   │   │   │   ├── route.ts           # Initialize deposit
│   │   │   │   │   └── [reference]/
│   │   │   │   │       └── status/
│   │   │   │   │           └── route.ts   # Check deposit status
│   │   │   │   ├── transfer/
│   │   │   │   │   └── route.ts           # Transfer funds
│   │   │   │   ├── transactions/
│   │   │   │   │   └── route.ts           # Get transaction history
│   │   │   │   └── paystack/
│   │   │   │       └── webhook/
│   │   │   │           └── route.ts       # Paystack webhook handler
│   │   │   └── api-doc/
│   │   │       └── route.ts               # Swagger documentation
│   │   ├── globals.css                     # Global styles
│   │   ├── layout.tsx                      # Root layout
│   │   ├── page.tsx                        # Landing page
│   │   └── page.module.css                 # Landing page styles
│   ├── lib/
│   │   ├── db.ts                           # MongoDB connection
│   │   ├── auth.ts                         # Authentication middleware
│   │   ├── authUtils.ts                    # Auth helper functions
│   │   └── walletUtils.ts                  # Wallet number generation
│   └── models/
│       ├── User.ts                         # User schema
│       ├── Wallet.ts                       # Wallet schema
│       ├── Transaction.ts                  # Transaction schema
│       └── ApiKey.ts                       # API Key schema
├── public/                                 # Static assets
├── .env.local                              # Environment variables (create this)
├── .gitignore                              # Git ignore rules
├── eslint.config.mjs                       # ESLint configuration
├── next.config.ts                          # Next.js configuration
├── package.json                            # Dependencies
├── README.md                               # This file
├── task.md                                 # Task requirements
└── tsconfig.json                           # TypeScript configuration
```

---

## 🔒 Security Best Practices

- ✅ **API Keys** are hashed using SHA-256 before storage
- ✅ **Wallet Numbers** are cryptographically secure (13 digits)
- ✅ **JWT Tokens** have expiration and are signed with secrets
- ✅ **Webhook Signatures** are verified for all Paystack events
- ✅ **Environment Variables** store all sensitive credentials
- ✅ **Input Validation** on all endpoints prevents malicious data
- ✅ **MongoDB Transactions** ensure atomic wallet operations
- ✅ **Permission Checks** enforce least privilege access

**Recommendations:**
- Never commit `.env.local` to version control
- Use strong, unique secrets for JWT_SECRET
- Rotate API keys regularly
- Monitor webhook logs for suspicious activity
- Use HTTPS in production
- Enable MongoDB authentication in production

---

## 💡 Usage Examples

### Complete User Flow

1. **User signs in with Google:**
```
Visit: http://localhost:3000/api/auth/google
Callback returns JWT token
```

2. **User deposits money:**
```bash
POST /api/wallet/deposit
Body: { "amount": 10000, "email": "user@example.com" }
Response: { "authorization_url": "https://checkout.paystack.com/..." }
```

3. **User completes payment on Paystack**

4. **Webhook confirms payment:**
```
Paystack → POST /api/wallet/paystack/webhook
Wallet balance updated automatically
```

5. **User transfers to another wallet:**
```bash
POST /api/wallet/transfer
Body: {
  "recipientWalletNumber": "4569876543210",
  "amount": 5000,
  "description": "Payment"
}
```

6. **User checks transaction history:**
```bash
GET /api/wallet/transactions?limit=10
```

### Service-to-Service Integration

1. **Create API key:**
```bash
POST /api/keys/create
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  "name": "Integration API Key",
  "permissions": ["wallet:read", "transactions:read"],
  "expiresInDays": 90
}
```

2. **Use API key for wallet operations:**
```bash
GET /api/wallet/balance
Headers: { "X-API-Key": "wsk_live_1234567890abcdef" }
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: MongoDB connection failed**
```
Solution: Verify MONGODB_URI in .env.local
Check MongoDB is running (local) or accessible (Atlas)
```

**Issue: Google OAuth redirect error**
```
Solution: Add http://localhost:3000/api/auth/google/callback 
to authorized redirect URIs in Google Cloud Console
```

**Issue: Paystack webhook not working**
```
Solution: 
1. Verify PAYSTACK_WEBHOOK_SECRET matches Paystack dashboard
2. Check webhook URL is publicly accessible (use ngrok for local)
3. Review webhook logs in Paystack dashboard
```

**Issue: JWT token expired**
```
Solution: Re-authenticate via /api/auth/google
Tokens expire after 24 hours by default
```

**Issue: API key not working**
```
Solution:
1. Check key hasn't expired
2. Verify permissions match endpoint requirements
3. Ensure X-API-Key header is properly formatted
```

---

## 📝 API Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Internal Server Error | Server-side error |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Guidelines:**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

---

## 📄 License

This project is created as part of the HNG Stage 8 Backend Task.

---

## 👥 Author

**ALADETAN-IFE**
- GitHub: [@ALADETAN-IFE](https://github.com/ALADETAN-IFE)
- Repository: [Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys](https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys)

---

## 🔗 Related Resources

- [Paystack Documentation](https://paystack.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [JWT Introduction](https://jwt.io/introduction)

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API Documentation](#-api-documentation)
3. Open an issue on [GitHub](https://github.com/ALADETAN-IFE/Hng-Stage7-be-Wallet-Service-with-Paystack-JWT-API-Keys/issues)

---

**Built with ❤️ for HNG Stage 8 Backend Task**

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
