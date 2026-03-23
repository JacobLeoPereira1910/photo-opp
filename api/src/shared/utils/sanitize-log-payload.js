const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'authorization',
  'cookie',
  'token',
  'accessToken',
  'refreshToken'
]);

function truncateString(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.length > 500 ? `${value.slice(0, 497)}...` : value;
}

export function sanitizeLogPayload(value, keyName = '') {
  if (Buffer.isBuffer(value)) {
    return `[buffer:${value.length}]`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogPayload(item, keyName));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [key, currentValue]) => {
      if (SENSITIVE_FIELDS.has(key)) {
        accumulator[key] = '[REDACTED]';
        return accumulator;
      }

      accumulator[key] = sanitizeLogPayload(currentValue, key);
      return accumulator;
    }, {});
  }

  if (
    keyName === 'file' ||
    keyName === 'image' ||
    keyName === 'buffer' ||
    keyName === 'binary'
  ) {
    return '[BINARY_CONTENT]';
  }

  return truncateString(value);
}
