import fs from 'fs';
import path from 'path';
import type {
  BureauSettings,
  BureauStats,
  ContactRequest,
  MatrimonialProfile,
  PublicBureauSettings,
} from '../src/types.ts';

export interface BureauDatabase {
  settings: BureauSettings;
  profiles: MatrimonialProfile[];
  requests: ContactRequest[];
  nextProfileSeq: number;
  nextRequestSeq: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bureau-data.json');

const BRIDE_FIRST_NAMES = [
  'Ayesha', 'Zainab', 'Fatima', 'Hira', 'Maham', 'Sana', 'Amina', 'Iqra', 'Noor', 'Khadija',
  'Mariam', 'Sadia', 'Bushra', 'Rabia', 'Sumaira', 'Nimra', 'Hafsa', 'Anum', 'Kinza', 'Mehwish',
  'Sidra', 'Farah', 'Laiba', 'Yusra', 'Arooj',
];

const GROOM_FIRST_NAMES = [
  'Hamza', 'Usman', 'Bilal', 'Saad', 'Faisal', 'Omar', 'Zohaib', 'Taimoor', 'Salman', 'Waqas',
  'Haris', 'Danish', 'Kamran', 'Asad', 'Hassan', 'Shahzaib', 'Adnan', 'Farhan', 'Junaid', 'Talha',
  'Muneeb', 'Awais', 'Arslan', 'Imran', 'Nouman',
];

const LAST_NAMES = [
  'Siddiqui', 'Malik', 'Farooq', 'Tariq', 'Chaudhry', 'Qureshi', 'Raza', 'Sheikh', 'Javed',
  'Mehmood', 'Akram', 'Hussain', 'Nadeem', 'Ashraf', 'Butt', 'Cheema', 'Abbasi', 'Kiani',
];

const CITIES = [
  'Lahore', 'Islamabad', 'Karachi', 'Rawalpindi', 'Multan', 'Faisalabad',
  'Sialkot', 'Gujranwala', 'Peshawar', 'Bahawalpur', 'Abbottabad', 'Hyderabad',
];

const CASTES = ['Siddiqui', 'Malik', 'Sheikh', 'Arain', 'Jutt', 'Qureshi', 'Rajput', 'Awan', 'Syed', 'Butt'];

const BRIDE_CAREERS = [
  { edu: 'MBBS (King Edward Medical University)', prof: 'Medical Officer — Teaching Hospital', inc: 'Rs. 180,000 / month' },
  { edu: 'BS Accounting & Finance (IBA Karachi)', prof: 'Financial Analyst — Multinational Firm', inc: 'Rs. 165,000 / month' },
  { edu: 'M.Phil English Literature (BZU)', prof: 'University Lecturer', inc: 'Rs. 120,000 / month' },
  { edu: 'BDS (de Montmorency College)', prof: 'Dental Surgeon — Private Clinic', inc: 'Rs. 195,000 / month' },
  { edu: 'Pharm-D (Punjab University)', prof: 'Clinical Pharmacist', inc: 'Rs. 135,000 / month' },
  { edu: 'B.Arch (NCA Lahore)', prof: 'Interior & Spatial Architect', inc: 'Rs. 170,000 / month' },
  { edu: 'MS Data Science (LUMS)', prof: 'Analytics Specialist', inc: 'Rs. 220,000 / month' },
  { edu: 'ACCA Qualified', prof: 'Audit & Tax Manager', inc: 'Rs. 210,000 / month' },
  { edu: 'MA Islamic Studies & Education', prof: 'Senior College Educator', inc: 'Rs. 110,000 / month' },
];

const GROOM_CAREERS = [
  { edu: 'MS Computer Science (NUST Islamabad)', prof: 'Senior Cloud Architect', inc: 'Rs. 450,000 / month' },
  { edu: 'FCPS General Surgery', prof: 'Consultant General Surgeon', inc: 'Rs. 380,000 / month' },
  { edu: 'BE Mechanical Engineering (UET)', prof: 'Project Manager — Energy Sector', inc: 'Rs. 290,000 / month' },
  { edu: 'Chartered Accountant (ICAP)', prof: 'Finance Controller — Corporate Group', inc: 'Rs. 420,000 / month' },
  { edu: 'MBA (LUMS Lahore)', prof: 'Export & Textile Business Director', inc: 'Rs. 500,000 / month' },
  { edu: 'CSS Qualified — PMS Officer', prof: 'Assistant Commissioner (Govt Service)', inc: 'Rs. 210,000 / month' },
  { edu: 'MS Electrical Engineering (GIKI)', prof: 'Lead Embedded Systems Engineer', inc: 'Rs. 340,000 / month' },
  { edu: 'LLB (Hons) University of London', prof: 'Advocate High Court & Legal Advisor', inc: 'Rs. 310,000 / month' },
  { edu: 'BS Software Engineering (FAST)', prof: 'Principal Full-Stack Engineer', inc: 'Rs. 390,000 / month' },
];

const FATHER_PROFESSIONS = [
  'Retired Bank Senior Vice President',
  'Federal Civil Servant (Grade 20)',
  'Textile Export Business Owner',
  'Senior Advocate High Court',
  'Agricultural Landowner & Agro-Business',
  'Retired Army Colonel',
  'Industrial Manufacturing Proprietor',
  'Chief Engineer (WAPDA / Govt)',
  'Professor of Medicine',
];

function createSeedDatabase(): BureauDatabase {
  const baseDate = new Date('2026-11-18T12:00:00.000Z').getTime();

  const featuredProfiles: MatrimonialProfile[] = [
    {
      id: 'prof-1001',
      refCode: 'NR-1001',
      fullName: 'Ayesha Siddiqui',
      gender: 'Bride',
      age: 25,
      height: '5 ft 4 in',
      maritalStatus: 'Never Married',
      city: 'Lahore',
      country: 'Pakistan',
      education: 'MBBS (King Edward Medical University)',
      profession: 'Medical Officer — Teaching Hospital',
      monthlyIncome: 'Rs. 180,000 / month',
      sect: 'Sunni',
      caste: 'Siddiqui',
      familyType: 'Nuclear',
      fatherProfession: 'Retired Bank Senior Vice President',
      siblings: '1 Brother (Software Engineer), 1 Sister (Married)',
      bio: 'Well-educated, family-oriented medical doctor raised in DHA Lahore. Values kindness, honesty, and mutual respect between families.',
      partnerPreference: 'Well-settled MBBS, Engineer, or CSP officer aged 27–32 from a respected educated family in Lahore or Islamabad.',
      photoUrl: '/src/assets/images/profile_bride_ayesha_1795159529319.jpg',
      guardianName: 'Tariq Siddiqui (Father)',
      guardianPhone: '0300-4419283',
      status: 'approved',
      paymentConfirmed: true,
      feeAmount: 100,
      featured: true,
      createdAt: '2026-11-10T09:15:00.000Z',
      updatedAt: '2026-11-10T11:30:00.000Z',
    },
    {
      id: 'prof-1002',
      refCode: 'NR-1002',
      fullName: 'Hamza Raza Malik',
      gender: 'Groom',
      age: 28,
      height: '5 ft 11 in',
      maritalStatus: 'Never Married',
      city: 'Islamabad',
      country: 'Pakistan',
      education: 'MS Computer Science (NUST Islamabad)',
      profession: 'Senior Cloud Architect — Islamabad',
      monthlyIncome: 'Rs. 450,000 / month',
      sect: 'Sunni',
      caste: 'Malik',
      familyType: 'Nuclear',
      fatherProfession: 'Federal Civil Servant (Grade 20)',
      siblings: '2 Sisters (Both Married)',
      bio: 'Practicing, soft-spoken software architect owning residence in F-11 Islamabad. Enjoys reading, family travel, and balanced modern-traditional values.',
      partnerPreference: 'Educated, graceful bride aged 22–26 from a cultured family in Islamabad, Rawalpindi, or Lahore.',
      photoUrl: '/src/assets/images/profile_groom_hamza_1795159529196.jpg',
      guardianName: 'Mrs. Nasreen Malik (Mother)',
      guardianPhone: '0321-5528190',
      status: 'approved',
      paymentConfirmed: true,
      feeAmount: 100,
      featured: true,
      createdAt: '2026-11-12T14:20:00.000Z',
      updatedAt: '2026-11-12T16:00:00.000Z',
    },
    {
      id: 'prof-1003',
      refCode: 'NR-1003',
      fullName: 'Zainab Farooq',
      gender: 'Bride',
      age: 24,
      height: '5 ft 5 in',
      maritalStatus: 'Never Married',
      city: 'Karachi',
      country: 'Pakistan',
      education: 'BS Accounting & Finance (IBA Karachi)',
      profession: 'Financial Analyst — Multinational Firm',
      monthlyIncome: 'Rs. 165,000 / month',
      sect: 'Sunni',
      caste: 'Sheikh',
      familyType: 'Joint',
      fatherProfession: 'Textile Export Business Owner',
      siblings: '2 Brothers (1 Business, 1 University)',
      bio: 'Warm, articulate IBA graduate living in Clifton Karachi. Close-knit business family with strong moral values and emphasis on education.',
      partnerPreference: 'Qualified professional or established businessman aged 26–31 from Karachi, Lahore, or overseas Pakistani family.',
      photoUrl: '/src/assets/images/profile_bride_zainab_1795159529203.jpg',
      guardianName: 'Farooq Ahmed (Father)',
      guardianPhone: '0333-2190482',
      status: 'approved',
      paymentConfirmed: true,
      feeAmount: 100,
      featured: true,
      createdAt: '2026-11-14T10:00:00.000Z',
      updatedAt: '2026-11-14T12:15:00.000Z',
    },
    {
      id: 'prof-1004',
      refCode: 'NR-1004',
      fullName: 'Dr. Usman Tariq',
      gender: 'Groom',
      age: 30,
      height: '5 ft 10 in',
      maritalStatus: 'Never Married',
      city: 'Lahore',
      country: 'Pakistan',
      education: 'FCPS Surgery (Aga Khan / Services Hospital)',
      profession: 'Consultant General Surgeon',
      monthlyIncome: 'Rs. 380,000 / month',
      sect: 'Sunni',
      caste: 'Arain',
      familyType: 'Nuclear',
      fatherProfession: 'Senior Advocate High Court',
      siblings: '1 Brother (Doctor in UK), 1 Sister (Architect)',
      bio: 'Dedicated surgeon settled in Model Town Lahore. Calm temperament, financially independent, seeking a compassionate life partner.',
      partnerPreference: 'Doctor, pharmacist, or post-graduate bride aged 23–28 from an educated, respectable family.',
      photoUrl: '/src/assets/images/profile_groom_usman_1795159528459.jpg',
      guardianName: 'Adv. Tariq Mahmood (Father)',
      guardianPhone: '0301-8432109',
      status: 'approved',
      paymentConfirmed: true,
      feeAmount: 100,
      featured: true,
      createdAt: '2026-11-15T08:40:00.000Z',
      updatedAt: '2026-11-15T09:10:00.000Z',
    },
  ];

  // Generate 86 more approved profiles (90 total = 10 full pages of 9 profiles) + 3 pending profiles
  const profiles: MatrimonialProfile[] = [...featuredProfiles];
  let seq = 1005;

  for (let i = 0; i < 86; i++) {
    const isBride = i % 2 === 0;
    const gender = isBride ? 'Bride' : 'Groom';
    const firstList = isBride ? BRIDE_FIRST_NAMES : GROOM_FIRST_NAMES;
    const firstName = firstList[(i + 3) % firstList.length];
    const lastName = LAST_NAMES[(i * 5 + 2) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const city = CITIES[i % CITIES.length];
    const caste = CASTES[(i + 1) % CASTES.length];
    const careerList = isBride ? BRIDE_CAREERS : GROOM_CAREERS;
    const career = careerList[i % careerList.length];
    const age = isBride ? 22 + (i % 9) : 26 + (i % 9);
    const height = isBride ? `5 ft ${2 + (i % 5)} in` : `5 ft ${8 + (i % 5)} in`;
    const maritalStatus = i % 17 === 0 ? 'Divorced' : i % 29 === 0 ? 'Khula' : 'Never Married';
    const familyType = i % 3 === 0 ? 'Joint' : 'Nuclear';
    const fatherProfession = FATHER_PROFESSIONS[i % FATHER_PROFESSIONS.length];
    const phoneSuffix = String(1000000 + ((i * 7919) % 8999999)).padStart(7, '0');
    const createdAt = new Date(baseDate - (i + 1) * 3600 * 1000 * 5).toISOString();

    profiles.push({
      id: `prof-${seq}`,
      refCode: `NR-${seq}`,
      fullName,
      gender,
      age,
      height,
      maritalStatus,
      city,
      country: 'Pakistan',
      education: career.edu,
      profession: career.prof,
      monthlyIncome: career.inc,
      sect: i % 11 === 0 ? 'Shia' : 'Sunni',
      caste,
      familyType,
      fatherProfession,
      siblings: `${1 + (i % 2)} Brother(s), ${1 + ((i + 1) % 2)} Sister(s)`,
      bio: `Educated, well-mannered ${gender.toLowerCase()} from a respected ${caste} family residing in ${city}. Committed to strong family values and mutual respect.`,
      partnerPreference: isBride
        ? `Well-settled educated groom aged ${age + 2}–${age + 7} from a cultured family.`
        : `Educated, graceful bride aged ${Math.max(20, age - 6)}–${age - 1} from a respectable family.`,
      photoUrl: '',
      guardianName: `${lastName} Family (Guardian)`,
      guardianPhone: `030${i % 5}-${phoneSuffix}`,
      status: 'approved',
      paymentConfirmed: true,
      feeAmount: 100,
      featured: false,
      createdAt,
      updatedAt: createdAt,
    });
    seq += 1;
  }

  // Add 3 pending WhatsApp profiles for Admin queue demonstration
  for (let j = 0; j < 3; j++) {
    const isBride = j % 2 === 1;
    const createdAt = new Date(baseDate - j * 1800 * 1000).toISOString();
    profiles.unshift({
      id: `prof-${seq}`,
      refCode: `NR-${seq}`,
      fullName: isBride ? 'Sana Javed Abbasi' : j === 0 ? 'Bilal Ahmed Qureshi' : 'Saadullah Khan',
      gender: isBride ? 'Bride' : 'Groom',
      age: isBride ? 25 : 29 + j,
      height: isBride ? '5 ft 4 in' : '5 ft 11 in',
      maritalStatus: 'Never Married',
      city: ['Rawalpindi', 'Lahore', 'Islamabad'][j],
      country: 'Pakistan',
      education: isBride ? 'MS Clinical Psychology' : 'BE Mechanical Engineering (UET Taxila)',
      profession: isBride ? 'Clinical Psychologist' : 'Project Manager — Energy Sector',
      monthlyIncome: isBride ? 'Rs. 140,000 / month' : 'Rs. 290,000 / month',
      sect: 'Sunni',
      caste: ['Qureshi', 'Abbasi', 'Kiani'][j],
      familyType: 'Nuclear',
      fatherProfession: 'Retired Army Colonel',
      siblings: '1 Brother, 1 Sister',
      bio: 'Waiting for final WhatsApp Rs. 100 confirmation screenshot review.',
      partnerPreference: 'Educated, family-oriented match from respected household.',
      photoUrl: '',
      guardianName: `Guardian of ${isBride ? 'Sana' : 'Candidate'}`,
      guardianPhone: `0315-994012${j}`,
      status: 'pending_whatsapp',
      paymentConfirmed: false,
      feeAmount: 100,
      featured: false,
      createdAt,
      updatedAt: createdAt,
    });
    seq += 1;
  }

  // Generate 85 Contact Inquiries (supports 10 pages at 9 client requests per page, free direct contact)
  const requests: ContactRequest[] = [];
  let reqSeq = 5001;
  const approvedPool = profiles.filter((p) => p.status === 'approved');

  for (let k = 0; k < 85; k++) {
    const target = approvedPool[k % approvedPool.length];
    const reqLast = LAST_NAMES[(k * 3 + 1) % LAST_NAMES.length];
    const reqFirst = k % 2 === 0 ? `Mrs. ${BRIDE_FIRST_NAMES[(k + 4) % BRIDE_FIRST_NAMES.length]}` : `Mr. ${GROOM_FIRST_NAMES[(k + 2) % GROOM_FIRST_NAMES.length]}`;
    const city = CITIES[(k + 2) % CITIES.length];
    const status = k < 18 ? 'direct_sent' : 'reviewed';
    const createdAt = new Date(baseDate - k * 3600 * 1000 * 2).toISOString();
    const phoneSuffix = String(2000000 + ((k * 6131) % 7999999)).padStart(7, '0');

    requests.push({
      id: `req-${reqSeq}`,
      requestCode: `REQ-${reqSeq}`,
      profileId: target.id,
      profileRefCode: target.refCode,
      profileName: target.fullName,
      requesterName: `${reqFirst} ${reqLast}`,
      requesterCity: city,
      requesterPhone: `033${k % 5}-${phoneSuffix}`,
      relationToCandidate: k % 2 === 0 ? 'Mother / Father' : 'Elder Brother',
      message: `Sent direct introduction inquiry to ${target.refCode} (${target.city}).`,
      feeAmount: 0,
      status,
      createdAt,
      updatedAt: createdAt,
    });
    reqSeq += 1;
  }

  return {
    settings: {
      bureauName: 'Noor Rishta Bureau',
      whatsappNumber: '03096102719',
      whatsappIntl: '923096102719',
      feePerProfile: 100,
      currency: 'Rs.',
      paymentAccountTitle: 'Noor Rishta Marriage Bureau',
      paymentChannel: 'EasyPaisa / JazzCash — 03096102719',
      paymentInstructions:
        'Uploading a profile carries a one-time fee of Rs. 100 only (confirmed on WhatsApp 03096102719). Once your profile is uploaded and approved, families can view all profiles and contact each other directly with no additional charges.',
      officeCity: 'Lahore & Nationwide Pakistan',
      adminPassword: process.env.ADMIN_PASSWORD || 'admin100',
    },
    nextProfileSeq: seq,
    nextRequestSeq: reqSeq,
    profiles,
    requests,
  };
}

function ensureDatabase(): BureauDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw) as BureauDatabase;
}

export function readDatabase(): BureauDatabase {
  return ensureDatabase();
}

export function writeDatabase(db: BureauDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempFile, DATA_FILE);
}

export function toPublicSettings(settings: BureauSettings): PublicBureauSettings {
  const { adminPassword: _omit, ...publicFields } = settings;
  return publicFields;
}

export function computeStats(db: BureauDatabase): BureauStats {
  const approvedProfiles = db.profiles.filter((p) => p.status === 'approved').length;
  const pendingProfiles = db.profiles.filter((p) => p.status === 'pending_whatsapp').length;
  const archivedProfiles = db.profiles.filter((p) => p.status === 'archived').length;
  const reviewedRequests = db.requests.filter((r) => r.status === 'reviewed').length;
  const newRequests = db.requests.filter((r) => r.status === 'direct_sent').length;

  const profileRevenue = db.profiles
    .filter((p) => p.paymentConfirmed)
    .reduce((sum, p) => sum + (p.feeAmount || db.settings.feePerProfile), 0);

  return {
    totalProfiles: db.profiles.length,
    approvedProfiles,
    pendingProfiles,
    archivedProfiles,
    totalRequests: db.requests.length,
    reviewedRequests,
    newRequests,
    confirmedRevenueRs: profileRevenue,
  };
}
