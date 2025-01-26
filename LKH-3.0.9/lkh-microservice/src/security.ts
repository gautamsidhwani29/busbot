import helmet from 'helmet';
import { RequestHandler } from 'express';

export const securityMiddleware = (): RequestHandler[] => [
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }),
  helmet.hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  }),
];