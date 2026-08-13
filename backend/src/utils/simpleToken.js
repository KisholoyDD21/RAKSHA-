// A minimal, dependency-free stand-in for a JWT: header.payload.signature,
// HMAC-SHA256 signed, base64url encoded. Deliberately small in scope
// (sign + verify, nothing else) — for a real multi-admin production
// system, replace with a proper auth provider or the `jsonwebtoken`
// package plus per-user credentials. See README "Production Roadmap".

import crypto from 'crypto';

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}
function b64urlDecode(input) {
  return Buffer.from(input, 'base64url').toString('utf-8');
}

function sign(payload, secret, expiresInSeconds) {
  const header = { alg: 'HS256', typ: 'RAKSHA' };
  const body = { ...payload, exp: Date.now() + expiresInSeconds * 1000 };
  const headerPart = b64url(JSON.stringify(header));
  const bodyPart = b64url(JSON.stringify(body));
  const signature = crypto.createHmac('sha256', secret).update(`${headerPart}.${bodyPart}`).digest('base64url');
  return `${headerPart}.${bodyPart}.${signature}`;
}

function verify(token, secret) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerPart, bodyPart, signature] = parts;

  const expectedSig = crypto.createHmac('sha256', secret).update(`${headerPart}.${bodyPart}`).digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const body = JSON.parse(b64urlDecode(bodyPart));
    if (body.exp && Date.now() > body.exp) return null;
    return body;
  } catch {
    return null;
  }
}

export default { sign, verify };
