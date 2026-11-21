import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  computeStats,
  readDatabase,
  toPublicSettings,
  writeDatabase,
} from './server/store.ts';
import type { ContactRequest, MatrimonialProfile } from './src/types.ts';

dotenv.config();

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(process.cwd() + ':noor-rishta-bureau').digest('hex');
const COOKIE_NAME = 'noor_rishta_admin';

function signToken(issuedAt: number): string {
  const payload = String(issuedAt);
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > 7 * 24 * 60 * 60 * 1000) return false;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    out[key] = val;
  }
  return out;
}

function extractAdminToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME] || null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractAdminToken(req);
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}

function cleanStr(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function cleanInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function buildWhatsAppUrl(whatsappIntl: string, message: string): string {
  const digits = whatsappIntl.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/public/bootstrap', (_req, res) => {
  const db = readDatabase();
  const approvedProfiles = db.profiles
    .filter((p) => p.status === 'approved')
    .map((p) => (p.hidePhoto ? { ...p, photoUrl: '' } : p));
  const stats = computeStats(db);
  res.json({
    settings: toPublicSettings(db.settings),
    profiles: approvedProfiles,
    stats,
  });
});

app.post('/api/public/profiles', (req, res) => {
  const body = req.body || {};
  const fullName = cleanStr(body.fullName, 100);
  const gender = body.gender === 'Groom' ? 'Groom' : body.gender === 'Bride' ? 'Bride' : null;
  const age = cleanInt(body.age, 18, 70, 0);
  const city = cleanStr(body.city, 60);
  const education = cleanStr(body.education, 120);
  const profession = cleanStr(body.profession, 120);
  const guardianName = cleanStr(body.guardianName, 100);
  const guardianPhone = cleanStr(body.guardianPhone, 30);

  if (!fullName || !gender || age < 18 || !city || !education || !profession || !guardianName || !guardianPhone) {
    res.status(400).json({
      error: 'Please complete all required fields: Full Name, Gender, Age (18+), City, Education, Profession, Guardian Name, and Phone Number.',
    });
    return;
  }

  const db = readDatabase();
  const seq = db.nextProfileSeq;
  db.nextProfileSeq += 1;
  const refCode = `NR-${seq}`;
  const now = new Date().toISOString();

  const maritalStatus =
    body.maritalStatus === 'Divorced' ||
    body.maritalStatus === 'Widowed' ||
    body.maritalStatus === 'Khula'
      ? body.maritalStatus
      : 'Never Married';

  const photoUrlRaw = cleanStr(body.photoUrl, 150000);
  const safePhotoUrl =
    photoUrlRaw.startsWith('/src/assets/images/') || photoUrlRaw.startsWith('data:image/')
      ? photoUrlRaw
      : '';

  const profile: MatrimonialProfile = {
    id: `prof-${seq}`,
    refCode,
    fullName,
    gender,
    age,
    height: cleanStr(body.height, 30) || '5 ft 6 in',
    maritalStatus,
    city,
    country: cleanStr(body.country, 60) || 'Pakistan',
    education,
    profession,
    monthlyIncome: cleanStr(body.monthlyIncome, 60) || 'On Inquiry',
    sect: cleanStr(body.sect, 40) || 'Sunni',
    caste: cleanStr(body.caste, 50) || 'Prefer not to specify',
    familyType: body.familyType === 'Joint' ? 'Joint' : 'Nuclear',
    fatherProfession: cleanStr(body.fatherProfession, 100) || 'Respected Family',
    siblings: cleanStr(body.siblings, 120) || 'Details shared with matched family',
    bio: cleanStr(body.bio, 600) || 'Respectable family seeking a compatible life partner.',
    partnerPreference: cleanStr(body.partnerPreference, 400) || 'Educated and family-oriented match.',
    photoUrl: safePhotoUrl,
    hidePhoto: Boolean(body.hidePhoto),
    guardianName,
    guardianPhone,
    status: 'pending_whatsapp',
    paymentConfirmed: false,
    feeAmount: db.settings.feePerProfile,
    featured: false,
    createdAt: now,
    updatedAt: now,
  };

  db.profiles.unshift(profile);
  writeDatabase(db);

  const waMessage = `Assalam-o-Alaikum ${db.settings.bureauName}, I submitted a matrimonial profile.\nReference ID: ${refCode}\nName: ${fullName} (${gender}, ${age} yrs, ${city})\nFee: ${db.settings.currency} ${db.settings.feePerProfile}\nPlease confirm my Rs. ${db.settings.feePerProfile} profile payment.`;
  const whatsappUrl = buildWhatsAppUrl(db.settings.whatsappIntl, waMessage);

  res.status(201).json({
    profile,
    whatsappUrl,
    whatsappMessage: waMessage,
  });
});

app.post('/api/public/contact-requests', (req, res) => {
  const body = req.body || {};
  const profileId = cleanStr(body.profileId, 50);
  const requesterName = cleanStr(body.requesterName, 100);
  const requesterCity = cleanStr(body.requesterCity, 60);
  const requesterPhone = cleanStr(body.requesterPhone, 30);
  const relationToCandidate = cleanStr(body.relationToCandidate, 60) || 'Family Member';
  const message = cleanStr(body.message, 400);

  if (!profileId || !requesterName || !requesterCity || !requesterPhone) {
    res.status(400).json({ error: 'Please fill in your name, city, and WhatsApp phone number.' });
    return;
  }

  const db = readDatabase();
  const target = db.profiles.find((p) => p.id === profileId && p.status === 'approved');
  if (!target) {
    res.status(404).json({ error: 'Selected profile was not found.' });
    return;
  }

  const seq = db.nextRequestSeq;
  db.nextRequestSeq += 1;
  const requestCode = `REQ-${seq}`;
  const now = new Date().toISOString();

  const contactReq: ContactRequest = {
    id: `req-${seq}`,
    requestCode,
    profileId: target.id,
    profileRefCode: target.refCode,
    profileName: target.fullName,
    requesterName,
    requesterCity,
    requesterPhone,
    relationToCandidate,
    message: message || 'Interested in direct family introduction.',
    feeAmount: 0,
    status: 'direct_sent',
    createdAt: now,
    updatedAt: now,
  };

  db.requests.unshift(contactReq);
  writeDatabase(db);

  const rawDigits = (target.guardianPhone || db.settings.whatsappIntl).replace(/[^\d]/g, '');
  const targetIntl = rawDigits.startsWith('0') ? `92${rawDigits.slice(1)}` : rawDigits;
  const waMessage = `Assalam-o-Alaikum ${target.guardianName}, we saw profile ${target.refCode} (${target.fullName}) on ${db.settings.bureauName}.\nFrom: ${requesterName} (${relationToCandidate}, ${requesterCity})\nContact: ${requesterPhone}\nNote: ${contactReq.message}`;
  const whatsappUrl = buildWhatsAppUrl(targetIntl, waMessage);

  res.status(201).json({
    request: contactReq,
    whatsappUrl,
    whatsappMessage: waMessage,
  });
});

app.get('/api/public/track/:refCode', (req, res) => {
  const code = cleanStr(req.params.refCode, 30).toUpperCase();
  if (!code) {
    res.status(400).json({ error: 'Please enter a valid Reference ID (e.g. NR-1001 or REQ-5001).' });
    return;
  }
  const db = readDatabase();
  const profile = db.profiles.find((p) => p.refCode.toUpperCase() === code);
  if (profile) {
    res.json({
      kind: 'profile',
      refCode: profile.refCode,
      title: profile.fullName,
      subtitle: `${profile.gender} · ${profile.age} yrs · ${profile.city}`,
      status: profile.status,
      paymentConfirmed: profile.paymentConfirmed,
      feeAmount: profile.feeAmount,
      createdAt: profile.createdAt,
    });
    return;
  }

  const request = db.requests.find((r) => r.requestCode.toUpperCase() === code);
  if (request) {
    const targetProfile = db.profiles.find((p) => p.id === request.profileId);
    res.json({
      kind: 'request',
      refCode: request.requestCode,
      title: `Family Inquiry for ${request.profileName}`,
      subtitle: `Profile ${request.profileRefCode} · Sent by ${request.requesterName}`,
      status: request.status,
      paymentConfirmed: true,
      feeAmount: 0,
      createdAt: request.createdAt,
      unlockedContact:
        targetProfile && targetProfile.status === 'approved'
          ? {
              guardianName: targetProfile.guardianName,
              guardianPhone: targetProfile.guardianPhone || 'Contact via Bureau',
              profileName: targetProfile.fullName,
              profileRefCode: targetProfile.refCode,
            }
          : undefined,
    });
    return;
  }

  res.status(404).json({ error: `No profile or request found with code "${code}".` });
});

app.post('/api/admin/login', (req, res) => {
  const password = cleanStr(req.body?.password, 100);
  const db = readDatabase();
  if (!password || password !== db.settings.adminPassword) {
    res.status(401).json({ error: 'Incorrect admin password.' });
    return;
  }
  const token = signToken(Date.now());
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ authenticated: true, token });
});

app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ authenticated: false });
});

app.get('/api/admin/session', (req, res) => {
  const token = extractAdminToken(req);
  res.json({ authenticated: verifyToken(token) });
});

app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
  const db = readDatabase();
  res.json({
    settings: db.settings,
    profiles: db.profiles,
    requests: db.requests,
    stats: computeStats(db),
  });
});

app.post('/api/admin/profiles', requireAdmin, (req, res) => {
  const body = req.body || {};
  const fullName = cleanStr(body.fullName, 100);
  const gender = body.gender === 'Groom' ? 'Groom' : body.gender === 'Bride' ? 'Bride' : null;
  const age = cleanInt(body.age, 18, 70, 0);
  const city = cleanStr(body.city, 60);
  const education = cleanStr(body.education, 120);
  const profession = cleanStr(body.profession, 120);
  const guardianName = cleanStr(body.guardianName, 100);
  const guardianPhone = cleanStr(body.guardianPhone, 30);

  if (!fullName || !gender || age < 18 || !city || !education || !profession || !guardianName || !guardianPhone) {
    res.status(400).json({ error: 'Required profile fields are missing.' });
    return;
  }

  const db = readDatabase();
  const seq = db.nextProfileSeq;
  db.nextProfileSeq += 1;
  const now = new Date().toISOString();

  const status =
    body.status === 'approved' || body.status === 'archived' ? body.status : 'pending_whatsapp';

  const photoUrlRaw = cleanStr(body.photoUrl, 150000);
  const safePhotoUrl =
    photoUrlRaw.startsWith('/src/assets/images/') || photoUrlRaw.startsWith('data:image/')
      ? photoUrlRaw
      : '';

  const profile: MatrimonialProfile = {
    id: `prof-${seq}`,
    refCode: `NR-${seq}`,
    fullName,
    gender,
    age,
    height: cleanStr(body.height, 30) || '5 ft 6 in',
    maritalStatus:
      body.maritalStatus === 'Divorced' ||
      body.maritalStatus === 'Widowed' ||
      body.maritalStatus === 'Khula'
        ? body.maritalStatus
        : 'Never Married',
    city,
    country: cleanStr(body.country, 60) || 'Pakistan',
    education,
    profession,
    monthlyIncome: cleanStr(body.monthlyIncome, 60) || 'On Inquiry',
    sect: cleanStr(body.sect, 40) || 'Sunni',
    caste: cleanStr(body.caste, 50) || 'Prefer not to specify',
    familyType: body.familyType === 'Joint' ? 'Joint' : 'Nuclear',
    fatherProfession: cleanStr(body.fatherProfession, 100) || 'Respected Family',
    siblings: cleanStr(body.siblings, 120) || 'Details available',
    bio: cleanStr(body.bio, 600) || '',
    partnerPreference: cleanStr(body.partnerPreference, 400) || '',
    photoUrl: safePhotoUrl,
    hidePhoto: Boolean(body.hidePhoto),
    guardianName,
    guardianPhone,
    status,
    paymentConfirmed: Boolean(body.paymentConfirmed),
    feeAmount: cleanInt(body.feeAmount, 0, 50000, db.settings.feePerProfile),
    featured: Boolean(body.featured),
    createdAt: now,
    updatedAt: now,
  };

  db.profiles.unshift(profile);
  writeDatabase(db);
  res.status(201).json({ profile, stats: computeStats(db) });
});

app.patch('/api/admin/profiles/:id', requireAdmin, (req, res) => {
  const id = cleanStr(req.params.id, 50);
  const db = readDatabase();
  const idx = db.profiles.findIndex((p) => p.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  const existing = db.profiles[idx];
  const body = req.body || {};

  const updated: MatrimonialProfile = {
    ...existing,
    fullName: body.fullName !== undefined ? cleanStr(body.fullName, 100) || existing.fullName : existing.fullName,
    gender: body.gender === 'Groom' || body.gender === 'Bride' ? body.gender : existing.gender,
    age: body.age !== undefined ? cleanInt(body.age, 18, 70, existing.age) : existing.age,
    height: body.height !== undefined ? cleanStr(body.height, 30) : existing.height,
    maritalStatus:
      body.maritalStatus === 'Never Married' ||
      body.maritalStatus === 'Divorced' ||
      body.maritalStatus === 'Widowed' ||
      body.maritalStatus === 'Khula'
        ? body.maritalStatus
        : existing.maritalStatus,
    city: body.city !== undefined ? cleanStr(body.city, 60) || existing.city : existing.city,
    country: body.country !== undefined ? cleanStr(body.country, 60) || existing.country : existing.country,
    education: body.education !== undefined ? cleanStr(body.education, 120) : existing.education,
    profession: body.profession !== undefined ? cleanStr(body.profession, 120) : existing.profession,
    monthlyIncome: body.monthlyIncome !== undefined ? cleanStr(body.monthlyIncome, 60) : existing.monthlyIncome,
    sect: body.sect !== undefined ? cleanStr(body.sect, 40) : existing.sect,
    caste: body.caste !== undefined ? cleanStr(body.caste, 50) : existing.caste,
    familyType: body.familyType === 'Joint' || body.familyType === 'Nuclear' ? body.familyType : existing.familyType,
    fatherProfession:
      body.fatherProfession !== undefined ? cleanStr(body.fatherProfession, 100) : existing.fatherProfession,
    siblings: body.siblings !== undefined ? cleanStr(body.siblings, 120) : existing.siblings,
    bio: body.bio !== undefined ? cleanStr(body.bio, 600) : existing.bio,
    partnerPreference:
      body.partnerPreference !== undefined ? cleanStr(body.partnerPreference, 400) : existing.partnerPreference,
    guardianName: body.guardianName !== undefined ? cleanStr(body.guardianName, 100) : existing.guardianName,
    guardianPhone: body.guardianPhone !== undefined ? cleanStr(body.guardianPhone, 30) : existing.guardianPhone,
    status:
      body.status === 'approved' || body.status === 'pending_whatsapp' || body.status === 'archived'
        ? body.status
        : existing.status,
    paymentConfirmed:
      body.paymentConfirmed !== undefined ? Boolean(body.paymentConfirmed) : existing.paymentConfirmed,
    feeAmount:
      body.feeAmount !== undefined
        ? cleanInt(body.feeAmount, 0, 50000, existing.feeAmount)
        : existing.feeAmount,
    featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
    hidePhoto: body.hidePhoto !== undefined ? Boolean(body.hidePhoto) : Boolean(existing.hidePhoto),
    updatedAt: new Date().toISOString(),
  };

  if (typeof body.photoUrl === 'string') {
    const trimmed = body.photoUrl.trim().slice(0, 150000);
    if (trimmed === '' || trimmed.startsWith('/src/assets/images/') || trimmed.startsWith('data:image/')) {
      updated.photoUrl = trimmed;
    }
  }

  db.profiles[idx] = updated;
  writeDatabase(db);
  res.json({ profile: updated, stats: computeStats(db) });
});

app.delete('/api/admin/profiles/:id', requireAdmin, (req, res) => {
  const id = cleanStr(req.params.id, 50);
  const db = readDatabase();
  const prevLen = db.profiles.length;
  db.profiles = db.profiles.filter((p) => p.id !== id);
  if (db.profiles.length === prevLen) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }
  writeDatabase(db);
  res.json({ deleted: true, stats: computeStats(db) });
});

app.patch('/api/admin/requests/:id', requireAdmin, (req, res) => {
  const id = cleanStr(req.params.id, 50);
  const db = readDatabase();
  const idx = db.requests.findIndex((r) => r.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Contact request not found.' });
    return;
  }
  const status = req.body?.status;
  if (status !== 'direct_sent' && status !== 'reviewed' && status !== 'declined') {
    res.status(400).json({ error: 'Invalid request status.' });
    return;
  }
  db.requests[idx] = {
    ...db.requests[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeDatabase(db);
  res.json({ request: db.requests[idx], stats: computeStats(db) });
});

app.delete('/api/admin/requests/:id', requireAdmin, (req, res) => {
  const id = cleanStr(req.params.id, 50);
  const db = readDatabase();
  const prevLen = db.requests.length;
  db.requests = db.requests.filter((r) => r.id !== id);
  if (db.requests.length === prevLen) {
    res.status(404).json({ error: 'Contact request not found.' });
    return;
  }
  writeDatabase(db);
  res.json({ deleted: true, stats: computeStats(db) });
});

app.patch('/api/admin/settings', requireAdmin, (req, res) => {
  const body = req.body || {};
  const db = readDatabase();
  const nextWhatsapp = cleanStr(body.whatsappNumber, 25) || db.settings.whatsappNumber;
  const digitsOnly = nextWhatsapp.replace(/[^\d]/g, '');
  const computedIntl =
    cleanStr(body.whatsappIntl, 25) ||
    (digitsOnly.startsWith('0') ? `92${digitsOnly.slice(1)}` : digitsOnly);

  db.settings = {
    ...db.settings,
    bureauName: cleanStr(body.bureauName, 80) || db.settings.bureauName,
    whatsappNumber: nextWhatsapp,
    whatsappIntl: computedIntl,
    feePerProfile:
      body.feePerProfile !== undefined
        ? cleanInt(body.feePerProfile, 0, 50000, db.settings.feePerProfile)
        : db.settings.feePerProfile,
    currency: cleanStr(body.currency, 10) || db.settings.currency,
    paymentAccountTitle: cleanStr(body.paymentAccountTitle, 80) || db.settings.paymentAccountTitle,
    paymentChannel: cleanStr(body.paymentChannel, 100) || db.settings.paymentChannel,
    paymentInstructions: cleanStr(body.paymentInstructions, 500) || db.settings.paymentInstructions,
    officeCity: cleanStr(body.officeCity, 80) || db.settings.officeCity,
    adminPassword:
      typeof body.newAdminPassword === 'string' && body.newAdminPassword.trim().length >= 4
        ? body.newAdminPassword.trim().slice(0, 60)
        : db.settings.adminPassword,
  };

  writeDatabase(db);
  res.json({ settings: db.settings, stats: computeStats(db) });
});

// Export the Express app for Vercel Serverless
export default app;