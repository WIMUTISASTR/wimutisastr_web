/**
 * Security Event Monitoring
 * Logs security-related events for analysis and alerting
 */

import logger from "@/lib/utils/logger";

const secLog = logger.child({ module: 'security' });

export enum SecurityEvent {
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUCCESSFUL_LOGIN = 'SUCCESSFUL_LOGIN',
  RATE_LIMIT_HIT = 'RATE_LIMIT_HIT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_FILE_UPLOAD = 'SUSPICIOUS_FILE_UPLOAD',
  FILE_VALIDATION_FAILED = 'FILE_VALIDATION_FAILED',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  AUTH_LOCKOUT = 'AUTH_LOCKOUT',
  PRIVILEGE_ESCALATION_ATTEMPT = 'PRIVILEGE_ESCALATION_ATTEMPT',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface SecurityEventData {
  event: SecurityEvent;
  severity?: SecuritySeverity;
  ip: string;
  userId?: string;
  path: string;
  method?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Log a security event
 * In production, this should also send to external monitoring services
 */
export function logSecurityEvent(data: SecurityEventData): void {
  const severity = data.severity || getSeverity(data.event);
  
  const logData = {
    ...data,
    severity,
    timestamp: new Date().toISOString(),
  };

  // Log based on severity
  switch (severity) {
    case SecuritySeverity.CRITICAL:
      secLog.error('Critical security event', undefined, logData);
      // In production: sendToAlertingSystem(logData);
      break;
    case SecuritySeverity.HIGH:
      secLog.error('High severity security event', undefined, logData);
      break;
    case SecuritySeverity.MEDIUM:
      secLog.warn('Medium severity security event', logData);
      break;
    case SecuritySeverity.LOW:
      secLog.info('Low severity security event', logData);
      break;
  }

  // In production, send to external services
  // sendToDatadog(logData);
  // sendToSentry(logData);
  // sendToSlack(logData); // For critical events
}

/**
 * Determine severity based on event type
 */
function getSeverity(event: SecurityEvent): SecuritySeverity {
  switch (event) {
    case SecurityEvent.PRIVILEGE_ESCALATION_ATTEMPT:
    case SecurityEvent.SQL_INJECTION_ATTEMPT:
      return SecuritySeverity.CRITICAL;

    case SecurityEvent.AUTH_LOCKOUT:
    case SecurityEvent.UNAUTHORIZED_ACCESS:
    case SecurityEvent.PATH_TRAVERSAL_ATTEMPT:
    case SecurityEvent.XSS_ATTEMPT:
      return SecuritySeverity.HIGH;

    case SecurityEvent.FAILED_LOGIN:
    case SecurityEvent.CSRF_VIOLATION:
    case SecurityEvent.INVALID_TOKEN:
    case SecurityEvent.FILE_VALIDATION_FAILED:
    case SecurityEvent.SUSPICIOUS_FILE_UPLOAD:
      return SecuritySeverity.MEDIUM;

    case SecurityEvent.RATE_LIMIT_HIT:
    case SecurityEvent.SUCCESSFUL_LOGIN:
      return SecuritySeverity.LOW;

    default:
      return SecuritySeverity.MEDIUM;
  }
}

/**
 * Helper to extract IP from request
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Create security context from request
 */
export function createSecurityContext(request: Request): {
  ip: string;
  path: string;
  method: string;
  userAgent: string;
} {
  return {
    ip: getClientIp(request),
    path: new URL(request.url).pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}
