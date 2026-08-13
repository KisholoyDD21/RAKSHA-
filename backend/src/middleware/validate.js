// Small hand-rolled request validation helpers. No schema library — the
// surface area here is small enough that explicit checks stay more
// readable than a DSL, and it keeps the dependency list short.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length > 0) {
    throw new ValidationError(`Missing required field(s): ${missing.join(', ')}`);
  }
}

export function requireLatLng(value, label = 'location') {
  if (
    !value ||
    typeof value.lat !== 'number' ||
    typeof value.lng !== 'number' ||
    Number.isNaN(value.lat) ||
    Number.isNaN(value.lng) ||
    value.lat < -90 || value.lat > 90 ||
    value.lng < -180 || value.lng > 180
  ) {
    throw new ValidationError(`${label} must include valid numeric lat (-90..90) and lng (-180..180)`);
  }
}

export function clampString(value, maxLength, label = 'field') {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new ValidationError(`${label} must be a string`);
  return value.slice(0, maxLength);
}

export function requireOneOf(value, allowed, label = 'field') {
  if (!allowed.includes(value)) {
    throw new ValidationError(`${label} must be one of: ${allowed.join(', ')}`);
  }
}

export function requireSeverity(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new ValidationError('severity must be an integer from 1 to 5');
  }
  return n;
}

/** Wraps an async route handler so thrown errors reach the error middleware instead of crashing the process. */
export function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
