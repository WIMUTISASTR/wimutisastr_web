/**
 * Audit Logging System
 * Tracks sensitive operations for compliance and security
 */

import { createAdminClient } from '@/lib/supabase/server';
import logger from "@/lib/utils/logger";

const log = logger.child({ module: 'audit' });

export enum AuditAction {
  // User Management
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
  USER_PROFILE_UPDATED = 'USER_PROFILE_UPDATED',
  
  // Membership Management
  MEMBERSHIP_APPROVED = 'MEMBERSHIP_APPROVED',
  MEMBERSHIP_DENIED = 'MEMBERSHIP_DENIED',
  MEMBERSHIP_REVOKED = 'MEMBERSHIP_REVOKED',
  MEMBERSHIP_EXTENDED = 'MEMBERSHIP_EXTENDED',
  
  // Payment Management
  PAYMENT_PROOF_UPLOADED = 'PAYMENT_PROOF_UPLOADED',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  
  // Content Access
  BOOK_ACCESSED = 'BOOK_ACCESSED',
  BOOK_DOWNLOADED = 'BOOK_DOWNLOADED',
  VIDEO_ACCESSED = 'VIDEO_ACCESSED',
  
  // Admin Actions
  ADMIN_ACTION = 'ADMIN_ACTION',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  USER_DELETED = 'USER_DELETED',
  CONTENT_UPLOADED = 'CONTENT_UPLOADED',
  CONTENT_DELETED = 'CONTENT_DELETED',
}

interface AuditEntry {
  action: AuditAction;
  actorId: string; // User who performed the action
  actorEmail?: string;
  targetId?: string; // User/resource affected
  targetType?: string; // 'user', 'payment', 'book', etc.
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit entry to the database
 * This creates a permanent record for compliance
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('audit_logs').insert({
      action: entry.action,
      actor_id: entry.actorId,
      actor_email: entry.actorEmail,
      target_id: entry.targetId,
      target_type: entry.targetType,
      details: entry.details || {},
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      created_at: new Date().toISOString(),
    });

    if (error) {
      log.error('Failed to create audit log', error, {
        action: entry.action,
        actorId: entry.actorId,
      });
    } else {
      log.info('Audit log created', {
        action: entry.action,
        actorId: entry.actorId,
        targetId: entry.targetId,
      });
    }
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    log.error('Audit logging failed', error, { entry });
  }
}

/**
 * Query audit logs (admin only)
 */
export async function getAuditLogs(params: {
  actorId?: string;
  targetId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const supabase = createAdminClient();
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (params.actorId) {
    query = query.eq('actor_id', params.actorId);
  }

  if (params.targetId) {
    query = query.eq('target_id', params.targetId);
  }

  if (params.action) {
    query = query.eq('action', params.action);
  }

  if (params.startDate) {
    query = query.gte('created_at', params.startDate.toISOString());
  }

  if (params.endDate) {
    query = query.lte('created_at', params.endDate.toISOString());
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    log.error('Failed to query audit logs', error);
    throw error;
  }

  return data;
}

/**
 * Get audit summary for a user
 */
export async function getUserAuditSummary(userId: string) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('action')
    .or(`actor_id.eq.${userId},target_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    log.error('Failed to get user audit summary', error, { userId });
    return null;
  }

  // Count actions
  const summary: Record<string, number> = {};
  data.forEach((entry) => {
    summary[entry.action] = (summary[entry.action] || 0) + 1;
  });

  return {
    totalActions: data.length,
    actionCounts: summary,
    recentActions: data.slice(0, 10),
  };
}
