import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent browser and proxy response caching so reloads always fetch fresh data
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// -------------------------------------------------------------
// DATA INTERFACES
// -------------------------------------------------------------

// 1. Inquiries: 5 Core Parameters
// Your name, Phone number, Email address, What can we help with?, Your message
export interface Inquiry {
  id: string;
  ticket_number: string;
  your_name: string;
  phone?: string;
  email: string;
  what_can_we_help_with: string;
  your_message?: string;

  // Compatibility aliases
  name: string;
  message?: string;
  source: string;
  status: 'Pending' | 'Contacted' | 'In Review' | 'Resolved' | 'Archived';
  dealt: boolean;
  starred?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// 2. Enrollments: Full Daycare Registration
// Parent/Guardian name, Phone, Email, Child's name, Child's age, Preferred program, Start date, Message
export interface Enrollment {
  id: string;
  enrollment_number: string;
  parent_name: string;
  phone?: string;
  email: string;
  child_name?: string;
  child_age?: string;
  preferred_program: string;
  preferred_start_date?: string;
  message?: string;

  // Compatibility aliases
  name: string;
  source: string;
  status: 'Pending' | 'Contacted' | 'In Review' | 'Confirmed' | 'Waitlisted' | 'Enrolled' | 'Archived';
  dealt: boolean;
  starred?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const DATA_DIR = process.env.VERCEL ? path.resolve('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.resolve(DATA_DIR, 'inquiries.json');
const ENROLLMENTS_FILE = path.resolve(DATA_DIR, 'enrollments.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data if files are completely missing
const DEFAULT_INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: "inq_1790701759955_0i761",
    ticket_number: "INQ-9568",
    your_name: "Emma Watson",
    name: "Emma Watson",
    phone: "5550192",
    email: "emma@example.com",
    what_can_we_help_with: "Toddler Care",
    your_message: "Interested in infant & toddler room transition programs.",
    message: "Interested in infant & toddler room transition programs.",
    source: "inquiry-form",
    status: "Pending",
    dealt: false,
    starred: false,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  {
    id: "inq_1790701000002_m9c4b",
    ticket_number: "INQ-1002",
    your_name: "Michael Chang",
    name: "Michael Chang",
    phone: "+1 (555) 432-9081",
    email: "m.chang@example.com",
    what_can_we_help_with: "Tuition & Fee Structure",
    your_message: "Looking for full-time preschool tuition details for our 3-year-old starting this November. Please send the fee schedule.",
    source: "inquiry-form",
    status: "Pending",
    dealt: false,
    starred: false,
    notes: "",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString().slice(0, 19).replace('T', ' ')
  },
  {
    id: "inq_1790701000001_d8k2a",
    ticket_number: "INQ-1001",
    your_name: "David & Emily Miller",
    name: "David & Emily Miller",
    phone: "+1 (555) 234-8901",
    email: "david.miller@example.com",
    what_can_we_help_with: "Schedule a Campus Tour",
    your_message: "We are relocating to the area next month and would like to visit the toddler classrooms next Tuesday morning.",
    source: "inquiry-form",
    status: "Pending",
    dealt: false,
    starred: false,
    notes: "",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString().slice(0, 19).replace('T', ' ')
  },
  {
    id: "inq_1790701000003_j7v1c",
    ticket_number: "INQ-1003",
    your_name: "Jessica Williams",
    name: "Jessica Williams",
    phone: "+1 (555) 876-1234",
    email: "jessica.w@example.com",
    what_can_we_help_with: "Infant Program Availability",
    your_message: "Expecting our first child soon and inquiring about infant room availability and student-to-teacher ratios.",
    source: "inquiry-form",
    status: "Resolved",
    dealt: true,
    starred: false,
    notes: "Sent infant program brochure and waitlist form.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString().slice(0, 19).replace('T', ' ')
  }
];

const DEFAULT_INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr_1790700268800_9spvi",
    enrollment_number: "ENR-8800",
    parent_name: "Amina Khan",
    name: "Amina Khan",
    phone: "+923001234567",
    email: "amina@example.com",
    child_name: "Zayd",
    child_age: "1-2 years",
    preferred_program: "Toddler Care",
    preferred_start_date: "2026-10-15",
    message: "Looking for admission",
    source: "enrollment-form",
    status: "Pending",
    dealt: false,
    starred: false,
    notes: "",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString().slice(0, 19).replace('T', ' ')
  },
  {
    id: "enr_1790700022083_6d6qs",
    enrollment_number: "ENR-5345",
    parent_name: "Sarah & David Miller",
    name: "Sarah & David Miller",
    phone: "+1 (555) 234-8901",
    email: "sarah.miller@example.com",
    child_name: "Oliver Miller",
    child_age: "2.5 years",
    preferred_program: "Toddler Program (Full-Day)",
    preferred_start_date: "2026-11-01",
    message: "Full-time enrollment. No dietary restrictions.",
    source: "enrollment-form",
    status: "Pending",
    dealt: false,
    starred: false,
    notes: "",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString().slice(0, 19).replace('T', ' ')
  }
];

function loadInquiries(): Inquiry[] {
  try {
    // If target file doesn't exist, try copying from root project data directory
    if (!fs.existsSync(INQUIRIES_FILE)) {
      const rootFallback = path.resolve(process.cwd(), 'data', 'inquiries.json');
      if (fs.existsSync(rootFallback)) {
        try {
          fs.copyFileSync(rootFallback, INQUIRIES_FILE);
        } catch {}
      } else {
        saveInquiries(DEFAULT_INITIAL_INQUIRIES);
        return DEFAULT_INITIAL_INQUIRIES;
      }
    }

    if (fs.existsSync(INQUIRIES_FILE)) {
      const content = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((i, idx) => ({
          ...i,
          ticket_number: i.ticket_number || `INQ-${1001 + idx}`,
          your_name: i.your_name || i.name || 'Visitor',
          name: i.your_name || i.name || 'Visitor',
          what_can_we_help_with: i.what_can_we_help_with || i.help_topic || i.country || i.interest || 'General Inquiry',
          your_message: i.your_message || i.message || i.region || '',
          dealt: Boolean(i.dealt),
          status: i.status || (i.dealt ? 'Resolved' : 'Pending'),
          timestamp: i.timestamp || (i.createdAt ? i.createdAt.slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' '))
        }));
      }
    }
  } catch (err) {
    console.error('Error reading inquiries.json:', err);
  }
  return [];
}

function saveInquiries(inquiries: Inquiry[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing inquiries.json:', err);
  }
}

function loadEnrollments(): Enrollment[] {
  try {
    if (!fs.existsSync(ENROLLMENTS_FILE)) {
      const rootFallback = path.resolve(process.cwd(), 'data', 'enrollments.json');
      if (fs.existsSync(rootFallback)) {
        try {
          fs.copyFileSync(rootFallback, ENROLLMENTS_FILE);
        } catch {}
      } else {
        saveEnrollments(DEFAULT_INITIAL_ENROLLMENTS);
        return DEFAULT_INITIAL_ENROLLMENTS;
      }
    }

    if (fs.existsSync(ENROLLMENTS_FILE)) {
      const content = fs.readFileSync(ENROLLMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((e, idx) => ({
          ...e,
          enrollment_number: e.enrollment_number || `ENR-${5001 + idx}`,
          parent_name: e.parent_name || e.name || 'Parent / Guardian',
          name: e.parent_name || e.name || 'Parent / Guardian',
          preferred_program: e.preferred_program || 'Toddler Program',
          dealt: Boolean(e.dealt),
          status: e.status || (e.dealt ? 'Confirmed' : 'Pending'),
          timestamp: e.timestamp || (e.createdAt ? e.createdAt.slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' '))
        }));
      }
    }
  } catch (err) {
    console.error('Error reading enrollments.json:', err);
  }
  return [];
}

function saveEnrollments(enrollments: Enrollment[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(enrollments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing enrollments.json:', err);
  }
}

// Single authoritative source accessors directly connected to persistent storage
function getInquiries(): Inquiry[] {
  return loadInquiries();
}

function getEnrollments(): Enrollment[] {
  return loadEnrollments();
}

// Server-Sent Events subscribers
type SseClient = {
  id: string;
  res: Response;
};
let sseClients: SseClient[] = [];

function broadcastSse(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// -------------------------------------------------------------
// 1. INQUIRY INGESTION HANDLER (/inquiry)
// Parameters: Your name, Phone number, Email address, What can we help with?, Your message
// -------------------------------------------------------------
function extractInquiryPayload(sourceData: Record<string, any>) {
  // 1. Your name
  const your_name = String(
    sourceData['Your name'] ||
    sourceData.your_name ||
    sourceData.yourName ||
    sourceData.name ||
    sourceData.fullName ||
    sourceData.fullname ||
    sourceData.parent_name ||
    ''
  ).trim();

  // 2. Phone number
  const phone = String(
    sourceData['Phone number'] ||
    sourceData.phone_number ||
    sourceData.phoneNumber ||
    sourceData.phone ||
    sourceData.tel ||
    sourceData.mobile ||
    ''
  ).trim();

  // 3. Email address
  const email = String(
    sourceData['Email address'] ||
    sourceData.email_address ||
    sourceData.emailAddress ||
    sourceData.email ||
    ''
  ).trim();

  // 4. What can we help with?
  const what_can_we_help_with = String(
    sourceData['What can we help with?'] ||
    sourceData['what can we help with?'] ||
    sourceData['what can we help with'] ||
    sourceData.what_can_we_help_with ||
    sourceData.whatCanWeHelpWith ||
    sourceData.help_topic ||
    sourceData.helpTopic ||
    sourceData.subject ||
    sourceData.topic ||
    sourceData.interest ||
    sourceData.enquiryType ||
    'General Inquiry'
  ).trim();

  // 5. Your message
  const your_message = String(
    sourceData['Your message'] ||
    sourceData.your_message ||
    sourceData.yourMessage ||
    sourceData.message ||
    sourceData.comments ||
    sourceData.notes ||
    sourceData.body ||
    ''
  ).trim();

  const source = String(
    sourceData.source ||
    sourceData['modal-source'] ||
    'inquiry-form'
  ).trim();

  return { your_name, phone, email, what_can_we_help_with, your_message, source };
}

function handleInquiryIngestion(req: Request, res: Response) {
  const payloadSource = req.method === 'GET' ? req.query : { ...req.query, ...req.body };

  // Smart-routing: If request has child parameters and no inquiry topic, route to Enrollments!
  const hasChildInfo = Boolean(
    payloadSource.child_name || payloadSource.childName || payloadSource['child_name'] || payloadSource.child ||
    payloadSource.child_age || payloadSource.childAge || payloadSource['child_age'] || payloadSource.age
  );
  const hasInquiryTopic = Boolean(
    payloadSource['What can we help with?'] || payloadSource['what can we help with?'] || 
    payloadSource.what_can_we_help_with || payloadSource.help_topic
  );

  if (hasChildInfo && !hasInquiryTopic) {
    return handleEnrollmentIngestion(req, res);
  }

  const { your_name, phone, email, what_can_we_help_with, your_message, source } = extractInquiryPayload(payloadSource);

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email required',
      message: 'Please provide a valid email address.'
    });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  const ticketNumber = `INQ-${1000 + Math.floor(Math.random() * 9000)}`;
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

  const displayName = your_name || 'Visitor';

  const newInquiry: Inquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ticket_number: ticketNumber,
    your_name: displayName,
    name: displayName,
    phone: phone || undefined,
    email,
    what_can_we_help_with: what_can_we_help_with || 'General Inquiry',
    your_message: your_message || undefined,
    message: your_message || undefined,
    source: source || 'inquiry-form',
    status: 'Pending',
    dealt: false,
    starred: false,
    notes: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    timestamp,
    ip: clientIp,
    userAgent
  };

  const currentInquiries = getInquiries();
  const updatedInquiries = [newInquiry, ...currentInquiries.filter(i => (i.id || '').toLowerCase() !== newInquiry.id.toLowerCase() && (i.ticket_number || '').toLowerCase() !== newInquiry.ticket_number.toLowerCase())];
  saveInquiries(updatedInquiries);
  broadcastSse('inquiry_created', newInquiry);

  return res.status(200).json({
    success: true,
    message: 'Inquiry received successfully. Our daycare team will contact you shortly.',
    ticket_number: ticketNumber,
    id: newInquiry.id,
    inquiry: newInquiry
  });
}

// Ingestion Routes for Inquiries
app.get('/inquiry', handleInquiryIngestion);
app.post('/inquiry', handleInquiryIngestion);
app.get('/inquiries', handleInquiryIngestion);
app.post('/inquiries', handleInquiryIngestion);
app.get('/api/inquiry', handleInquiryIngestion);
app.post('/api/inquiry', handleInquiryIngestion);

// -------------------------------------------------------------
// 2. ENROLLMENT INGESTION HANDLER (/enroll & /enool)
// Parameters: Parent/Guardian name, Phone, Email, Child's name, Child's age, Preferred program, Start date, Message
// -------------------------------------------------------------
function extractEnrollmentPayload(sourceData: Record<string, any>) {
  const parent_name = String(
    sourceData.parent_name ||
    sourceData.parentName ||
    sourceData['parent-name'] ||
    sourceData.guardian_name ||
    sourceData.name ||
    sourceData.fullName ||
    ''
  ).trim();

  const phone = String(
    sourceData.phone ||
    sourceData.phone_number ||
    sourceData.phoneNumber ||
    sourceData.tel ||
    sourceData.mobile ||
    ''
  ).trim();

  const email = String(
    sourceData.email ||
    sourceData.Email ||
    sourceData.email_address ||
    sourceData.emailAddress ||
    sourceData['Email address'] ||
    sourceData['email address'] ||
    ''
  ).trim();

  const child_name = String(
    sourceData.child_name ||
    sourceData.childName ||
    sourceData["child's_name"] ||
    sourceData['child_name'] ||
    sourceData.child ||
    sourceData.student_name ||
    ''
  ).trim();

  const child_age = String(
    sourceData.child_age ||
    sourceData.childAge ||
    sourceData["child's_age"] ||
    sourceData.age ||
    sourceData.child_dob ||
    sourceData.dob ||
    ''
  ).trim();

  const preferred_program = String(
    sourceData.preferred_program ||
    sourceData.preferredProgram ||
    sourceData['preferred-program'] ||
    sourceData.program ||
    sourceData.interest ||
    sourceData.enquiryType ||
    'Toddler Program'
  ).trim();

  const preferred_start_date = String(
    sourceData.preferred_start_date ||
    sourceData.preferredStartDate ||
    sourceData['preferred-start-date'] ||
    sourceData.start_date ||
    sourceData.startDate ||
    sourceData.date ||
    ''
  ).trim();

  const message = String(
    sourceData.message ||
    sourceData.notes ||
    sourceData.comments ||
    sourceData.special_needs ||
    ''
  ).trim();

  const source = String(
    sourceData.source ||
    'enrollment-form'
  ).trim();

  const effectiveEmail = email || (phone ? `${phone.replace(/\D/g, '') || 'parent'}@phone-contact.local` : 'parent-enquiry@daycare.local');

  return {
    parent_name,
    phone,
    email: effectiveEmail,
    child_name,
    child_age,
    preferred_program,
    preferred_start_date,
    message,
    source
  };
}

function handleEnrollmentIngestion(req: Request, res: Response) {
  const payloadSource = req.method === 'GET' ? req.query : { ...req.query, ...req.body };
  const {
    parent_name,
    phone,
    email,
    child_name,
    child_age,
    preferred_program,
    preferred_start_date,
    message,
    source
  } = extractEnrollmentPayload(payloadSource);

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  const enrollmentNumber = `ENR-${5000 + Math.floor(Math.random() * 9000)}`;
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

  const displayName = parent_name || 'Parent / Guardian';

  const newEnrollment: Enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    enrollment_number: enrollmentNumber,
    parent_name: displayName,
    name: displayName,
    phone: phone || undefined,
    email,
    child_name: child_name || undefined,
    child_age: child_age || undefined,
    preferred_program: preferred_program || 'Toddler Program',
    preferred_start_date: preferred_start_date || undefined,
    message: message || undefined,
    source: source || 'enrollment-form',
    status: 'Pending',
    dealt: false,
    starred: false,
    notes: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    timestamp,
    ip: clientIp,
    userAgent
  };

  const currentEnrollments = getEnrollments();
  const updatedEnrollments = [newEnrollment, ...currentEnrollments.filter(e => (e.id || '').toLowerCase() !== newEnrollment.id.toLowerCase() && (e.enrollment_number || '').toLowerCase() !== newEnrollment.enrollment_number.toLowerCase())];
  saveEnrollments(updatedEnrollments);
  broadcastSse('enrollment_created', newEnrollment);

  return res.status(200).json({
    success: true,
    message: 'Enrollment registration received successfully. Our daycare admissions team will contact you shortly.',
    enrollment_number: enrollmentNumber,
    id: newEnrollment.id,
    enrollment: newEnrollment
  });
}

// Ingestion Routes for Enrollments (Accepts both /enroll and user's /enool)
app.get('/enroll', handleEnrollmentIngestion);
app.post('/enroll', handleEnrollmentIngestion);
app.get('/enool', handleEnrollmentIngestion);
app.post('/enool', handleEnrollmentIngestion);
app.get('/enrollment', handleEnrollmentIngestion);
app.post('/enrollment', handleEnrollmentIngestion);
app.get('/enrollments', handleEnrollmentIngestion);
app.post('/enrollments', handleEnrollmentIngestion);
app.get('/api/enroll', handleEnrollmentIngestion);
app.post('/api/enroll', handleEnrollmentIngestion);

// -------------------------------------------------------------
// SSE STREAM FOR REAL-TIME UPDATES
// -------------------------------------------------------------
app.get('/api/inquiries/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newClient: SseClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`);

  // Send periodic keepalive to prevent proxies from dropping SSE connections
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// -------------------------------------------------------------
// REST APIS: INQUIRIES
// -------------------------------------------------------------
app.get('/api/inquiries', (req: Request, res: Response) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const allInquiries = getInquiries();
  const allEnrollments = getEnrollments();
  let list = [...allInquiries];

  if (search) {
    list = list.filter(i =>
      i.your_name.toLowerCase().includes(search) ||
      i.email.toLowerCase().includes(search) ||
      (i.phone && i.phone.toLowerCase().includes(search)) ||
      i.what_can_we_help_with.toLowerCase().includes(search) ||
      (i.your_message && i.your_message.toLowerCase().includes(search)) ||
      i.ticket_number.toLowerCase().includes(search)
    );
  }

  const pendingCount = allInquiries.filter(i => !i.dealt).length;
  const dealtCount = allInquiries.filter(i => i.dealt).length;

  res.json({
    success: true,
    total_inquiries: allInquiries.length,
    pending_count: pendingCount,
    dealt_count: dealtCount,
    inquiries: list,
    // Aliases for backward compatibility
    tickets: list,
    total_tickets: allInquiries.length,
    waiting_list: allEnrollments,
    total_waiting: allEnrollments.length
  });
});

app.patch('/api/inquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const searchTarget = decodeURIComponent(String(id)).trim().toLowerCase();
  const current = getInquiries();

  const index = current.findIndex(i =>
    (i.id || '').toLowerCase() === searchTarget ||
    (i.ticket_number || '').toLowerCase() === searchTarget
  );

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  const item = current[index];
  if (req.body.dealt !== undefined) {
    item.dealt = Boolean(req.body.dealt);
    item.status = item.dealt ? 'Resolved' : 'Pending';
  }
  if (req.body.status) {
    item.status = req.body.status;
  }
  item.updatedAt = new Date().toISOString();

  current[index] = item;
  saveInquiries(current);
  broadcastSse('inquiry_updated', item);

  res.json({ success: true, inquiry: item });
});

function handleInquiryDelete(req: Request, res: Response) {
  const rawId = req.params.id || req.params.ticket_number;
  if (!rawId) {
    return res.status(400).json({ success: false, error: 'No ID provided' });
  }

  const searchTarget = decodeURIComponent(String(rawId)).trim().toLowerCase();
  const current = getInquiries();
  const index = current.findIndex(i =>
    (i.id || '').toLowerCase() === searchTarget ||
    (i.ticket_number || '').toLowerCase() === searchTarget
  );

  if (index === -1) {
    return res.json({ success: true, message: 'Inquiry already removed', id: rawId });
  }

  const [deleted] = current.splice(index, 1);
  saveInquiries(current);
  broadcastSse('inquiry_deleted', { id: deleted.id, ticket_number: deleted.ticket_number });

  return res.json({
    success: true,
    message: 'Inquiry deleted successfully',
    id: deleted.id,
    ticket_number: deleted.ticket_number
  });
}

app.delete('/api/inquiries/:id', handleInquiryDelete);
app.post('/api/inquiries/:id/delete', handleInquiryDelete);

// Move Inquiry -> Enrollment
app.post('/api/inquiries/:id/move_to_enrollments', (req: Request, res: Response) => {
  const { id } = req.params;
  const searchTarget = decodeURIComponent(String(id)).trim().toLowerCase();
  const currentInquiries = getInquiries();
  const idx = currentInquiries.findIndex(i => (i.id || '').toLowerCase() === searchTarget || (i.ticket_number || '').toLowerCase() === searchTarget);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  const [inq] = currentInquiries.splice(idx, 1);
  saveInquiries(currentInquiries);
  broadcastSse('inquiry_deleted', { id: inq.id, ticket_number: inq.ticket_number });

  const enr: Enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    enrollment_number: `ENR-${5000 + Math.floor(Math.random() * 9000)}`,
    parent_name: inq.your_name,
    name: inq.your_name,
    phone: inq.phone,
    email: inq.email,
    child_name: undefined,
    child_age: undefined,
    preferred_program: inq.what_can_we_help_with || 'Toddler Program',
    preferred_start_date: undefined,
    message: inq.your_message,
    source: inq.source || 'moved-from-inquiry',
    status: inq.dealt ? 'Confirmed' : 'Pending',
    dealt: inq.dealt,
    createdAt: inq.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timestamp: inq.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  const currentEnrollments = getEnrollments();
  const updatedEnrollments = [enr, ...currentEnrollments];
  saveEnrollments(updatedEnrollments);
  broadcastSse('enrollment_created', enr);

  return res.json({ success: true, message: 'Moved to Enrollments', enrollment: enr });
});

// -------------------------------------------------------------
// REST APIS: ENROLLMENTS
// -------------------------------------------------------------
app.get('/api/enrollments', (req: Request, res: Response) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const allEnrollments = getEnrollments();
  let list = [...allEnrollments];

  if (search) {
    list = list.filter(e =>
      e.parent_name.toLowerCase().includes(search) ||
      e.email.toLowerCase().includes(search) ||
      (e.phone && e.phone.toLowerCase().includes(search)) ||
      (e.child_name && e.child_name.toLowerCase().includes(search)) ||
      (e.child_age && e.child_age.toLowerCase().includes(search)) ||
      e.preferred_program.toLowerCase().includes(search) ||
      e.enrollment_number.toLowerCase().includes(search)
    );
  }

  const pendingCount = allEnrollments.filter(e => !e.dealt).length;
  const dealtCount = allEnrollments.filter(e => e.dealt).length;

  res.json({
    success: true,
    total_enrollments: allEnrollments.length,
    pending_count: pendingCount,
    dealt_count: dealtCount,
    enrollments: list
  });
});

app.patch('/api/enrollments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const searchTarget = decodeURIComponent(String(id)).trim().toLowerCase();
  const current = getEnrollments();

  const index = current.findIndex(e =>
    (e.id || '').toLowerCase() === searchTarget ||
    (e.enrollment_number || '').toLowerCase() === searchTarget
  );

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Enrollment not found' });
  }

  const item = current[index];
  if (req.body.dealt !== undefined) {
    item.dealt = Boolean(req.body.dealt);
    item.status = item.dealt ? 'Confirmed' : 'Pending';
  }
  if (req.body.status) {
    item.status = req.body.status;
  }
  item.updatedAt = new Date().toISOString();

  current[index] = item;
  saveEnrollments(current);
  broadcastSse('enrollment_updated', item);

  res.json({ success: true, enrollment: item });
});

function handleEnrollmentDelete(req: Request, res: Response) {
  const rawId = req.params.id || req.params.enrollment_number;
  if (!rawId) {
    return res.status(400).json({ success: false, error: 'No ID provided' });
  }

  const searchTarget = decodeURIComponent(String(rawId)).trim().toLowerCase();
  const current = getEnrollments();
  const index = current.findIndex(e =>
    (e.id || '').toLowerCase() === searchTarget ||
    (e.enrollment_number || '').toLowerCase() === searchTarget
  );

  if (index === -1) {
    return res.json({ success: true, message: 'Enrollment already removed', id: rawId });
  }

  const [deleted] = current.splice(index, 1);
  saveEnrollments(current);
  broadcastSse('enrollment_deleted', { id: deleted.id, enrollment_number: deleted.enrollment_number });

  return res.json({
    success: true,
    message: 'Enrollment deleted successfully',
    id: deleted.id,
    enrollment_number: deleted.enrollment_number
  });
}

app.delete('/api/enrollments/:id', handleEnrollmentDelete);
app.post('/api/enrollments/:id/delete', handleEnrollmentDelete);

// Move Enrollment -> Inquiry
app.post('/api/enrollments/:id/move_to_inquiries', (req: Request, res: Response) => {
  const { id } = req.params;
  const searchTarget = decodeURIComponent(String(id)).trim().toLowerCase();
  const currentEnrollments = getEnrollments();
  const idx = currentEnrollments.findIndex(e => (e.id || '').toLowerCase() === searchTarget || (e.enrollment_number || '').toLowerCase() === searchTarget);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Enrollment not found' });
  }

  const [enr] = currentEnrollments.splice(idx, 1);
  saveEnrollments(currentEnrollments);
  broadcastSse('enrollment_deleted', { id: enr.id, enrollment_number: enr.enrollment_number });

  const inq: Inquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ticket_number: `INQ-${1000 + Math.floor(Math.random() * 9000)}`,
    your_name: enr.parent_name,
    name: enr.parent_name,
    phone: enr.phone,
    email: enr.email,
    what_can_we_help_with: enr.preferred_program || 'General Inquiry',
    your_message: [
      enr.child_name ? `Child: ${enr.child_name} (${enr.child_age || 'Age not specified'})` : '',
      enr.preferred_start_date ? `Start date: ${enr.preferred_start_date}` : '',
      enr.message || ''
    ].filter(Boolean).join('\n'),
    message: enr.message,
    source: enr.source || 'moved-from-enrollment',
    status: enr.dealt ? 'Resolved' : 'Pending',
    dealt: enr.dealt,
    createdAt: enr.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timestamp: enr.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  const currentInquiries = getInquiries();
  const updatedInquiries = [inq, ...currentInquiries];
  saveInquiries(updatedInquiries);
  broadcastSse('inquiry_created', inq);

  return res.json({ success: true, message: 'Moved to Inquiries', inquiry: inq });
});

// Legacy waiting list aliases mapped to enrollments
app.get('/api/waiting', (req: Request, res: Response) => {
  const allEnrollments = getEnrollments();
  res.json({
    success: true,
    total_waiting: allEnrollments.length,
    waiting_list: allEnrollments
  });
});
app.delete('/api/waiting/:id', handleEnrollmentDelete);

// Bi-directional synchronization for robust offline & multi-instance client support
app.post('/api/sync', (req: Request, res: Response) => {
  const { clientInquiries, clientEnrollments } = req.body || {};

  let diskInquiries = getInquiries();
  let diskEnrollments = getEnrollments();
  let updatedInquiries = false;
  let updatedEnrollments = false;

  if (Array.isArray(clientInquiries)) {
    clientInquiries.forEach((item: Inquiry) => {
      const key = (item.id || item.ticket_number || '').toLowerCase();
      if (key) {
        const existingIdx = diskInquiries.findIndex(i => (i.id || '').toLowerCase() === key || (i.ticket_number || '').toLowerCase() === key);
        if (existingIdx === -1) {
          diskInquiries.push(item);
          updatedInquiries = true;
        }
      }
    });
  }

  if (Array.isArray(clientEnrollments)) {
    clientEnrollments.forEach((item: Enrollment) => {
      const key = (item.id || item.enrollment_number || '').toLowerCase();
      if (key) {
        const existingIdx = diskEnrollments.findIndex(e => (e.id || '').toLowerCase() === key || (e.enrollment_number || '').toLowerCase() === key);
        if (existingIdx === -1) {
          diskEnrollments.push(item);
          updatedEnrollments = true;
        }
      }
    });
  }

  if (updatedInquiries) saveInquiries(diskInquiries);
  if (updatedEnrollments) saveEnrollments(diskEnrollments);

  return res.json({
    success: true,
    inquiries: getInquiries(),
    enrollments: getEnrollments()
  });
});

// -------------------------------------------------------------
// CLEAR ALL (Reset all to 0)
// -------------------------------------------------------------
function handleClearAll(_req: Request, res: Response) {
  saveInquiries([]);
  saveEnrollments([]);
  broadcastSse('data_cleared', {});
  return res.json({ success: true, message: 'All inquiries and enrollments cleared to 0' });
}

app.post('/api/inquiries/clear_all', handleClearAll);
app.post('/api/inquiries/clear-all', handleClearAll);
app.post('/api/clear-all', handleClearAll);
app.delete('/api/inquiries', handleClearAll);
app.delete('/api/enrollments', handleClearAll);

// -------------------------------------------------------------
// EXPORT EXCEL / CSV
// -------------------------------------------------------------
app.get('/export_inquiries', (req: Request, res: Response) => {
  const headers = [
    'Status (Dealt)',
    'Ticket ID',
    'Your Name',
    'Phone Number',
    'Email Address',
    'What Can We Help With?',
    'Your Message',
    'Date Received'
  ];

  const currentInquiries = getInquiries();
  const rows = currentInquiries.map(i => [
    i.dealt ? 'DEALT / DONE' : 'PENDING',
    i.ticket_number || i.id,
    `"${(i.your_name || '').replace(/"/g, '""')}"`,
    `"${(i.phone || '').replace(/"/g, '""')}"`,
    `"${(i.email || '').replace(/"/g, '""')}"`,
    `"${(i.what_can_we_help_with || '').replace(/"/g, '""')}"`,
    `"${(i.your_message || '').replace(/"/g, '""')}"`,
    i.timestamp
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="daycare_inquiries.csv"');
  res.send(csv);
});

app.get('/export_enrollments', (req: Request, res: Response) => {
  const headers = [
    'Status (Confirmed/Dealt)',
    'Enrollment ID',
    'Parent/Guardian Name',
    'Phone Number',
    'Email Address',
    'Child Name',
    'Child Age',
    'Preferred Program',
    'Preferred Start Date',
    'Message / Special Notes',
    'Date Received'
  ];

  const currentEnrollments = getEnrollments();
  const rows = currentEnrollments.map(e => [
    e.dealt ? 'CONFIRMED / DEALT' : 'PENDING',
    e.enrollment_number || e.id,
    `"${(e.parent_name || '').replace(/"/g, '""')}"`,
    `"${(e.phone || '').replace(/"/g, '""')}"`,
    `"${(e.email || '').replace(/"/g, '""')}"`,
    `"${(e.child_name || '').replace(/"/g, '""')}"`,
    `"${(e.child_age || '').replace(/"/g, '""')}"`,
    `"${(e.preferred_program || '').replace(/"/g, '""')}"`,
    `"${(e.preferred_start_date || '').replace(/"/g, '""')}"`,
    `"${(e.message || '').replace(/"/g, '""')}"`,
    e.timestamp
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="daycare_enrollments.csv"');
  res.send(csv);
});

app.get('/export_excel', (req: Request, res: Response) => {
  const type = String(req.query.type || 'all');
  if (type === 'enrollments') {
    return res.redirect('/export_enrollments');
  }
  return res.redirect('/export_inquiries');
});

// -------------------------------------------------------------
// VITE SPA DEV & PROD SERVING
// -------------------------------------------------------------
async function setupViteOrStatic() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Little Stars Daycare Admin server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  setupViteOrStatic();
}

export default app;
