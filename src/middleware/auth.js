// src/middleware/auth.js - JWT Authentication Middleware

export async function authenticateToken(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      message: 'Unauthorized: Invalid or missing token',
      error: 'TOKEN_INVALID',
    });
  }
}

// Optional: Attach user context to request
export async function attachUser(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Non-fatal, route decides if auth is required
  }
}

// Check if user owns a resource (for delete/update)
export function checkOwnership(resourceUserId, requestUserId) {
  if (resourceUserId !== requestUserId) {
    return false;
  }
  return true;
}

// Get current user ID from JWT
export function getCurrentUserId(request) {
  return request.user.sub;
}

// Get current user from JWT
export function getCurrentUser(request) {
  return request.user;
}
