// src/app.js - Fastify Application Setup
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import 'dotenv/config';

// Import routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import followRoutes from './routes/follows.js';
import notificationRoutes from './routes/notifications.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// ============================================
// PLUGINS
// ============================================

// CORS
app.register(cors, {
  origin: true, // 👈 Updated to dynamically allow your Vercel frontend
  credentials: true,
});

// JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  },
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.setErrorHandler(errorHandler);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date() };
});

// ============================================
// REGISTER ROUTES
// ============================================

app.register(authRoutes, { prefix: '/api/auth' });
app.register(postRoutes, { prefix: '/api/posts' });
app.register(messageRoutes, { prefix: '/api/messages' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(followRoutes, { prefix: '/api/follows' });
app.register(notificationRoutes, { prefix: '/api/notifications' });

// ============================================
// 404 HANDLER
// ============================================

app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    statusCode: 404,
    message: 'Route not found',
    path: request.url,
  });
});

export default app;
