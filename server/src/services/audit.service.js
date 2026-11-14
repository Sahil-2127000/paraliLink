import { AuditLog } from '../models/auditLog.model.js'

export function audit(user, action, summary, extra = {}) {
  return AuditLog.create({ actor: user?._id, actorName: user?.name ?? 'System', action, summary, ...extra })
}
