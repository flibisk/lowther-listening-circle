// Simple in-memory rate limiter for admin login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if exceeded limit
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  // Increment count
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

export function getRemainingAttempts(ip: string, maxAttempts: number = 5): number {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return maxAttempts;
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    return maxAttempts;
  }
  
  return Math.max(0, maxAttempts - attempts.count);
}
