import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Wallet Service API Documentation',
        version: '1.0',
        description: 'API for Wallet, Transfers, Deposits, and Auth (JWT/API Key).',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          ApiKeyAuth: { 
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
      security: [
        { BearerAuth: [] },
        { ApiKeyAuth: [] },
      ],
      tags: [
        { name: 'Auth', description: 'Authentication and JWT generation' },
        { name: 'API Keys', description: 'API Key management for services' },
        { name: 'Wallet', description: 'Balance, Transfers, and Transactions' },
        { name: 'Paystack', description: 'Deposit initialization and Webhooks' },
      ],
    },
  });
  return spec;
};