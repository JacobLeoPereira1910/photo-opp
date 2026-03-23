export function toLogOutput(log) {
  return {
    id: log.id,
    requestId: log.requestId,
    userId: log.userId,
    emailAttempted: log.emailAttempted,
    action: log.action,
    method: log.method,
    route: log.route,
    ip: log.ip,
    requestBody: log.requestBody,
    responseStatus: log.responseStatus,
    metadata: log.metadata,
    createdAt: log.createdAt?.toISOString?.() || log.createdAt
  };
}

export function toLogCsvRow(log) {
  return {
    id: log.id,
    requestId: log.requestId || '',
    userId: log.userId || '',
    emailAttempted: log.emailAttempted || '',
    action: log.action,
    method: log.method,
    route: log.route,
    ip: log.ip,
    responseStatus: log.responseStatus,
    requestBody: JSON.stringify(log.requestBody || {}),
    metadata: JSON.stringify(log.metadata || {}),
    createdAt: log.createdAt?.toISOString?.() || log.createdAt
  };
}
