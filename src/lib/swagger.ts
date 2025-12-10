import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // Tells the library where to look for your route.ts files
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Wallet Service API Documentation',
        version: '1.0',
        description: 'API for Wallet, Transfers, Deposits, and Auth (JWT/API Key).',
      },
      // IMPORTANT: Define the security schemes here
      components: {
        securitySchemes: {
          BearerAuth: { // For JWT access
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          ApiKeyAuth: { // For Service-to-Service API Key access
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
      // Apply security globally (can be overridden per endpoint)
      security: [
        { BearerAuth: [] },
        { ApiKeyAuth: [] },
      ],
      tags: [ // Define tags for grouping your endpoints
        { name: 'Auth', description: 'Authentication and JWT generation' },
        { name: 'API Keys', description: 'API Key management for services' },
        { name: 'Wallet', description: 'Balance, Transfers, and Transactions' },
        { name: 'Paystack', description: 'Deposit initialization and Webhooks' },
      ],
    },
  });
  return spec;
};