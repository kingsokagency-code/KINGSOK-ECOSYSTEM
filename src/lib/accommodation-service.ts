/**
 * ==============================================================================
 * KINGSOK ACCOMMODATION SECTOR: UNIFIED SERVICE & DATA STORE
 * ==============================================================================
 * Comprehensive data model supporting:
 * - Active Campaign Goals & Core Principles
 * - Multi-Role Worker Management (Area Controller, Hotliner, Customer Rep, Admin)
 * - Lodge & Asset Database (Caretaker, Lodge President, Final Year Students, Vacancies)
 * - Hotliner Client Leads & WhatsApp Blast Tracker
 * - Customer Rep Quality Verification & Issue Resolution
 * - Points, Performance Ratings & Earnings Calculation (e.g. 1 pt = ₦1,000)
 * ==============================================================================
 */

export type WorkerRole = 'area_controller' | 'hotliner' | 'customer_rep' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: WorkerRole[];
  total_points: number;
  cash_value_earned: number; // e.g. points * 1000
  rating_average: number; // 1 to 5
  joined_at: string;
}

export interface CampaignGoal {
  title: string;
  target_accommodated: number;
  current_accommodated: number;
  target_freshers_reach: number;
  current_freshers_reach: number;
  deadline_text: string;
}

export interface Principle {
  id: number;
  title: string;
  description: string;
}

export interface Strategy {
  id: string;
  title: string;
  category: 'area_controller' | 'hotliner' | 'customer_rep' | 'general';
  summary: string;
  action_steps: string[];
}

export interface LodgeAsset {
  id: string;
  name: string;
  area: string;
  address: string;
  caretaker_name: string;
  caretaker_phone: string;
  lodge_president_name?: string;
  lodge_president_phone?: string;
  shop_owner_contact?: string;
  is_vacant_now: boolean;
  vacancy_count: number;
  expected_vacancy_date?: string;
  has_final_year_students: boolean;
  final_year_details?: string; // e.g. "3 students graduating in July with fridges and beds to sell"
  room_types: string; // e.g. "Self-contained, Single room"
  rent_per_session: string; // e.g. "₦250,000 - ₦320,000"
  water_reliability: 'Reliable Borehole' | 'Occasional' | 'Public Tap Only';
  light_reliability: 'Regular Grid' | 'Generator Supported' | 'Poor';
  security_features: string;
  is_verified: boolean;
  recorded_by_id: string;
  recorded_by_name: string;
  created_at: string;
  admin_points_awarded?: number;
  admin_feedback?: string;
}

export interface ClientLead {
  id: string;
  fresher_name: string;
  phone: string;
  preferred_area: string;
  budget_range: string;
  desired_room_type: string;
  status: 'new_inquiry' | 'options_sent' | 'inspection_scheduled' | 'payment_completed' | 'cancelled';
  assigned_controller_name?: string;
  notes?: string;
  hotliner_id: string;
  hotliner_name: string;
  created_at: string;
  admin_points_awarded?: number;
}

export interface WhatsAppBlastLog {
  id: string;
  group_name: string;
  broadcast_type: 'New Vacancies List' | 'Fresher Orientation' | 'Urgent Flat Offer';
  freshers_reached_estimate: number;
  hotliner_name: string;
  created_at: string;
}

export interface CustomerRepLog {
  id: string;
  category: 'Lodge Verification' | 'Fresher Feedback' | 'Issue Resolution' | 'Caretaker Dispute';
  target_reference: string; // e.g. "Peace Haven Lodge" or "Chioma (Fresher)"
  findings: string;
  action_taken: string;
  status: 'resolved' | 'pending_supervisor';
  rep_name: string;
  created_at: string;
  admin_points_awarded?: number;
}

export interface WorkerRatingEvent {
  id: string;
  worker_id: string;
  worker_name: string;
  role: WorkerRole;
  task_reference: string;
  points_awarded: number;
  rating_stars: number; // 1 to 5
  coaching_comment: string;
  awarded_by: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// INITIAL SEED DATA
// ------------------------------------------------------------------------------

export const INITIAL_GOAL: CampaignGoal = {
  title: "Accommodate 500 Students with Speed, Truth & Excellence",
  target_accommodated: 500,
  current_accommodated: 42,
  target_freshers_reach: 5000,
  current_freshers_reach: 840,
  deadline_text: "Intake 2026/2027 Academic Session",
};

export const INITIAL_PRINCIPLES: Principle[] = [
  {
    id: 1,
    title: "Make it easy for people to trust you",
    description:
      "When people can trust you, resistance disappears. Reliability and a calm, capable posture break down doubt and win caretakers and students immediately.",
  },
  {
    id: 2,
    title: "The client is the king and our employer",
    description:
      "Customer satisfaction is our sacred duty. We do not treat students as transactions; we serve them as family finding their footing in a new environment.",
  },
  {
    id: 3,
    title: "Don't hide details. Be truthful always",
    description:
      "Never cut corners. Tell the student all they need to know—water reliability, power reality, distance to campus, and true lodge condition. Truth builds long-term authority.",
  },
];

export const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: "strat-1",
    title: "Ground-Level Caretaker & President Intel",
    category: "area_controller",
    summary:
      "Strike direct relationships with lodge caretakers and lodge presidents. Caretakers know the prices; lodge presidents know who is about to graduate and leave.",
    action_steps: [
      "Visit 5 lodges daily in your assigned area.",
      "Get caretaker's personal phone number and discuss official representation.",
      "Ask lodge president: 'Which final year students are graduating and vacating their rooms?'",
      "Get graduating students' contacts to help them sell their household property and secure their rooms for freshers early.",
    ],
  },
  {
    id: "strat-2",
    title: "WhatsApp Fresher Community Engagement & Fast Response",
    category: "hotliner",
    summary:
      "Engage freshers in verified university WhatsApp communities. Provide helpful orientation advice, then direct them to vetted lodge options.",
    action_steps: [
      "Broadcast curated daily vacancy lists to 4 assigned student groups.",
      "Respond to incoming inquiries in under 5 minutes.",
      "Collect budget, room preference, and move-in date.",
      "Immediately link qualified freshers with Area Controllers on the ground for physical inspection.",
    ],
  },
  {
    id: "strat-3",
    title: "Truth-Checking & Quality Assurance",
    category: "customer_rep",
    summary:
      "Verify that lodge descriptions match reality. Follow up with students after inspections to ensure no area controller cut corners.",
    action_steps: [
      "Conduct spot-check calls with caretakers on newly logged lodges.",
      "Call every student within 2 hours after a physical inspection.",
      "Flag any discrepancies in water, light, or rent fees immediately to Okoye.",
    ],
  },
];

const SEED_USERS: UserProfile[] = [
  {
    id: "u-okoye",
    name: "Okoye (Admin)",
    email: "okoye@kingsok.com",
    phone: "+234 800 000 0001",
    roles: ["admin", "area_controller", "hotliner", "customer_rep"],
    total_points: 150,
    cash_value_earned: 150000,
    rating_average: 5.0,
    joined_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "u-emeka",
    name: "Emeka Obi",
    email: "emeka@kingsok.com",
    phone: "+234 803 111 2233",
    roles: ["area_controller", "hotliner"], // Multi-role!
    total_points: 24,
    cash_value_earned: 24000,
    rating_average: 4.8,
    joined_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "u-chioma",
    name: "Chioma Nwosu",
    email: "chioma@kingsok.com",
    phone: "+234 814 222 3344",
    roles: ["hotliner"],
    total_points: 18,
    cash_value_earned: 18000,
    rating_average: 4.9,
    joined_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "u-kalu",
    name: "Kalu Eze",
    email: "kalu@kingsok.com",
    phone: "+234 705 333 4455",
    roles: ["customer_rep"],
    total_points: 12,
    cash_value_earned: 12000,
    rating_average: 4.7,
    joined_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

const SEED_LODGES: LodgeAsset[] = [
  {
    id: "lodge-101",
    name: "Peace Haven Lodge",
    area: "Hilltop Phase 1",
    address: "12 University Road, Behind Faculty of Arts",
    caretaker_name: "Elder Samuel",
    caretaker_phone: "+234 803 456 7890",
    lodge_president_name: "Chukwudi (Final Year Pol Sci)",
    lodge_president_phone: "+234 812 345 6789",
    shop_owner_contact: "Mama Joy Provisions (+234 802 111 0000)",
    is_vacant_now: true,
    vacancy_count: 3,
    expected_vacancy_date: "Immediate (3 rooms ready)",
    has_final_year_students: true,
    final_year_details: "4 graduating students vacating in 3 weeks. Room 8 has a double mattress and reading desk for sale.",
    room_types: "Self-contain, Tiled, Kitchenette",
    rent_per_session: "₦280,000 / year",
    water_reliability: "Reliable Borehole",
    light_reliability: "Regular Grid",
    security_features: "Gated compound with night security watchman",
    is_verified: true,
    recorded_by_id: "u-emeka",
    recorded_by_name: "Emeka Obi",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    admin_points_awarded: 2,
    admin_feedback: "Excellent detailed submission with lodge president contact included.",
  },
  {
    id: "lodge-102",
    name: "Apex Villa Royale",
    area: "Odim Gate Area",
    address: "5 Odim Crescent, 3 mins walk to Campus Gate",
    caretaker_name: "Mr. Boniface",
    caretaker_phone: "+234 805 987 6543",
    lodge_president_name: "Sarah (Pharmacy)",
    lodge_president_phone: "+234 816 789 0123",
    is_vacant_now: false,
    vacancy_count: 0,
    expected_vacancy_date: "End of month (2 rooms opening)",
    has_final_year_students: true,
    final_year_details: "2 final year pharmacy students leaving end of July.",
    room_types: "1-Bedroom Flat, Self-contain",
    rent_per_session: "₦350,000 / year",
    water_reliability: "Reliable Borehole",
    light_reliability: "Generator Supported",
    security_features: "Perimeter fence, razor wire, CCTV at entrance",
    is_verified: true,
    recorded_by_id: "u-emeka",
    recorded_by_name: "Emeka Obi",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    admin_points_awarded: 1,
    admin_feedback: "Good lodge. Keep in touch with Mr. Boniface for the 2 upcoming vacancies.",
  },
  {
    id: "lodge-103",
    name: "St. Jude Student Suites",
    area: "Ofulonu Zone",
    address: "18 Ofulonu Extension",
    caretaker_name: "Pa Patrick",
    caretaker_phone: "+234 703 123 4567",
    is_vacant_now: true,
    vacancy_count: 5,
    expected_vacancy_date: "Immediate (New building annex)",
    has_final_year_students: false,
    room_types: "Single rooms with private baths",
    rent_per_session: "₦200,000 / year",
    water_reliability: "Reliable Borehole",
    light_reliability: "Regular Grid",
    security_features: "Security gate, fenced",
    is_verified: true,
    recorded_by_id: "u-okoye",
    recorded_by_name: "Okoye (Admin)",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    admin_points_awarded: 3,
  },
];

const SEED_LEADS: ClientLead[] = [
  {
    id: "lead-1",
    fresher_name: "Ibrahim Musa",
    phone: "+234 809 112 3344",
    preferred_area: "Hilltop Phase 1",
    budget_range: "₦250k - ₦300k",
    desired_room_type: "Self-contain",
    status: "inspection_scheduled",
    assigned_controller_name: "Emeka Obi",
    notes: "Coming with his guardian on Saturday morning. Prefers Peace Haven Lodge.",
    hotliner_id: "u-chioma",
    hotliner_name: "Chioma Nwosu",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    admin_points_awarded: 2,
  },
  {
    id: "lead-2",
    fresher_name: "Blessing Adebayo",
    phone: "+234 902 334 5566",
    preferred_area: "Odim Gate Area",
    budget_range: "₦300k - ₦380k",
    desired_room_type: "Executive self-contain with generator",
    status: "options_sent",
    notes: "Sent Apex Villa Royale and St. Jude photos. Awaiting her father's review.",
    hotliner_id: "u-chioma",
    hotliner_name: "Chioma Nwosu",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const SEED_BLASTS: WhatsAppBlastLog[] = [
  {
    id: "blast-1",
    group_name: "UNN 2026/2027 Freshers General",
    broadcast_type: "New Vacancies List",
    freshers_reached_estimate: 480,
    hotliner_name: "Chioma Nwosu",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "blast-2",
    group_name: "Faculty of Engineering Freshers",
    broadcast_type: "Fresher Orientation",
    freshers_reached_estimate: 210,
    hotliner_name: "Chioma Nwosu",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const SEED_REP_LOGS: CustomerRepLog[] = [
  {
    id: "rep-1",
    category: "Lodge Verification",
    target_reference: "Peace Haven Lodge",
    findings: "Called Elder Samuel (caretaker). Confirmed 3 rooms are vacant. Verified water pump is working. Price is exactly ₦280k as recorded by Emeka.",
    action_taken: "Approved lodge as verified in directory.",
    status: "resolved",
    rep_name: "Kalu Eze",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    admin_points_awarded: 1,
  },
];

const SEED_RATINGS: WorkerRatingEvent[] = [
  {
    id: "rate-1",
    worker_id: "u-emeka",
    worker_name: "Emeka Obi",
    role: "area_controller",
    task_reference: "Lodge Entry: Peace Haven Lodge",
    points_awarded: 2,
    rating_stars: 5,
    coaching_comment: "Outstanding work getting the lodge president's contact and final year student graduating details.",
    awarded_by: "Okoye",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

// ------------------------------------------------------------------------------
// LOCAL STORAGE HELPERS
// ------------------------------------------------------------------------------

const KEYS = {
  GOAL: "kingsok_acc_goal",
  PRINCIPLES: "kingsok_acc_principles",
  STRATEGIES: "kingsok_acc_strategies",
  USERS: "kingsok_acc_users",
  CURRENT_USER: "kingsok_current_user",
  LODGES: "kingsok_acc_lodges",
  LEADS: "kingsok_acc_leads",
  BLASTS: "kingsok_acc_blasts",
  REP_LOGS: "kingsok_acc_rep_logs",
  RATINGS: "kingsok_acc_ratings",
};

function readData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errs
  }
}

// ------------------------------------------------------------------------------
// PUBLIC API METHODS
// ------------------------------------------------------------------------------

export async function getCampaignGoal(): Promise<CampaignGoal> {
  return readData<CampaignGoal>(KEYS.GOAL, INITIAL_GOAL);
}

export async function updateCampaignGoal(goal: Partial<CampaignGoal>): Promise<CampaignGoal> {
  const current = await getCampaignGoal();
  const updated = { ...current, ...goal };
  writeData(KEYS.GOAL, updated);
  return updated;
}

export async function getPrinciples(): Promise<Principle[]> {
  return readData<Principle[]>(KEYS.PRINCIPLES, INITIAL_PRINCIPLES);
}

export async function getStrategies(): Promise<Strategy[]> {
  return readData<Strategy[]>(KEYS.STRATEGIES, INITIAL_STRATEGIES);
}

export async function saveStrategy(strategy: Strategy): Promise<void> {
  const list = await getStrategies();
  const exists = list.findIndex((s) => s.id === strategy.id);
  if (exists >= 0) {
    list[exists] = strategy;
  } else {
    list.push(strategy);
  }
  writeData(KEYS.STRATEGIES, list);
}

// User & Role Management
export async function getUsers(): Promise<UserProfile[]> {
  return readData<UserProfile[]>(KEYS.USERS, SEED_USERS);
}

export async function getCurrentUser(): Promise<UserProfile> {
  const users = await getUsers();
  const storedId = typeof window !== "undefined" ? localStorage.getItem(KEYS.CURRENT_USER) : null;
  const user = users.find((u) => u.id === storedId) || users[0]; // defaults to Okoye (Admin)
  return user;
}

export async function switchCurrentUser(userId: string): Promise<UserProfile> {
  const users = await getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.CURRENT_USER, user.id);
  }
  return user;
}

export async function registerOrUpdateUser(profile: Partial<UserProfile> & { name: string; email: string }): Promise<UserProfile> {
  const users = await getUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === profile.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...profile };
    writeData(KEYS.USERS, users);
    return users[existingIndex];
  } else {
    const newUser: UserProfile = {
      id: "u-" + Date.now().toString(36),
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      roles: profile.roles && profile.roles.length > 0 ? profile.roles : ["area_controller"],
      total_points: 0,
      cash_value_earned: 0,
      rating_average: 5.0,
      joined_at: new Date().toISOString(),
    };
    users.push(newUser);
    writeData(KEYS.USERS, users);
    return newUser;
  }
}

export async function updateUserRoles(userId: string, newRoles: WorkerRole[]): Promise<UserProfile> {
  const users = await getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  user.roles = newRoles;
  writeData(KEYS.USERS, users);
  return user;
}

// Lodges (Area Controller)
export async function getLodges(): Promise<LodgeAsset[]> {
  return readData<LodgeAsset[]>(KEYS.LODGES, SEED_LODGES);
}

export async function createLodge(data: Omit<LodgeAsset, "id" | "created_at">): Promise<LodgeAsset> {
  const lodges = await getLodges();
  const newLodge: LodgeAsset = {
    ...data,
    id: "lodge-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  const updated = [newLodge, ...lodges];
  writeData(KEYS.LODGES, updated);

  // Update current goal progress if vacancies were found
  if (newLodge.vacancy_count > 0) {
    const goal = await getCampaignGoal();
    writeData(KEYS.GOAL, {
      ...goal,
      current_accommodated: goal.current_accommodated + 1,
    });
  }

  return newLodge;
}

// Client Leads (Hotliners)
export async function getClientLeads(): Promise<ClientLead[]> {
  return readData<ClientLead[]>(KEYS.LEADS, SEED_LEADS);
}

export async function createClientLead(data: Omit<ClientLead, "id" | "created_at">): Promise<ClientLead> {
  const leads = await getClientLeads();
  const newLead: ClientLead = {
    ...data,
    id: "lead-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.LEADS, [newLead, ...leads]);

  // Update reach in campaign goal
  const goal = await getCampaignGoal();
  writeData(KEYS.GOAL, {
    ...goal,
    current_freshers_reach: goal.current_freshers_reach + 1,
  });

  return newLead;
}

export async function updateLeadStatus(leadId: string, status: ClientLead["status"]): Promise<ClientLead> {
  const leads = await getClientLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) throw new Error("Lead not found");
  lead.status = status;
  writeData(KEYS.LEADS, leads);
  return lead;
}

// Blasts (Hotliners)
export async function getWhatsAppBlasts(): Promise<WhatsAppBlastLog[]> {
  return readData<WhatsAppBlastLog[]>(KEYS.BLASTS, SEED_BLASTS);
}

export async function recordWhatsAppBlast(data: Omit<WhatsAppBlastLog, "id" | "created_at">): Promise<WhatsAppBlastLog> {
  const blasts = await getWhatsAppBlasts();
  const newBlast: WhatsAppBlastLog = {
    ...data,
    id: "blast-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.BLASTS, [newBlast, ...blasts]);

  const goal = await getCampaignGoal();
  writeData(KEYS.GOAL, {
    ...goal,
    current_freshers_reach: goal.current_freshers_reach + data.freshers_reached_estimate,
  });

  return newBlast;
}

// Customer Rep Logs
export async function getCustomerRepLogs(): Promise<CustomerRepLog[]> {
  return readData<CustomerRepLog[]>(KEYS.REP_LOGS, SEED_REP_LOGS);
}

export async function createCustomerRepLog(data: Omit<CustomerRepLog, "id" | "created_at">): Promise<CustomerRepLog> {
  const logs = await getCustomerRepLogs();
  const newLog: CustomerRepLog = {
    ...data,
    id: "rep-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.REP_LOGS, [newLog, ...logs]);
  return newLog;
}

// Rating & Points Engine (Admin Review)
export async function getWorkerRatings(): Promise<WorkerRatingEvent[]> {
  return readData<WorkerRatingEvent[]>(KEYS.RATINGS, SEED_RATINGS);
}

export async function awardWorkerRatingAndPoints(params: {
  worker_id: string;
  worker_name: string;
  role: WorkerRole;
  task_reference: string;
  points_awarded: number;
  rating_stars: number;
  coaching_comment: string;
  submission_type: "lodge" | "lead" | "rep";
  submission_id: string;
}): Promise<WorkerRatingEvent> {
  const ratings = await getWorkerRatings();
  const newRating: WorkerRatingEvent = {
    id: "rate-" + Date.now().toString(36),
    worker_id: params.worker_id,
    worker_name: params.worker_name,
    role: params.role,
    task_reference: params.task_reference,
    points_awarded: params.points_awarded,
    rating_stars: params.rating_stars,
    coaching_comment: params.coaching_comment,
    awarded_by: "Okoye",
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.RATINGS, [newRating, ...ratings]);

  // Update worker profile points & cash value (1 Point = ₦1,000)
  const users = await getUsers();
  const worker = users.find((u) => u.id === params.worker_id);
  if (worker) {
    worker.total_points = (worker.total_points || 0) + params.points_awarded;
    worker.cash_value_earned = worker.total_points * 1000;

    // Recalculate average rating
    const workerRatings = [newRating, ...ratings].filter((r) => r.worker_id === params.worker_id);
    const avg = workerRatings.reduce((acc, curr) => acc + curr.rating_stars, 0) / workerRatings.length;
    worker.rating_average = Math.round(avg * 10) / 10;
    writeData(KEYS.USERS, users);
  }

  // Update points tag on the submission itself
  if (params.submission_type === "lodge") {
    const lodges = await getLodges();
    const target = lodges.find((l) => l.id === params.submission_id);
    if (target) {
      target.admin_points_awarded = params.points_awarded;
      target.admin_feedback = params.coaching_comment;
      writeData(KEYS.LODGES, lodges);
    }
  } else if (params.submission_type === "lead") {
    const leads = await getClientLeads();
    const target = leads.find((l) => l.id === params.submission_id);
    if (target) {
      target.admin_points_awarded = params.points_awarded;
      writeData(KEYS.LEADS, leads);
    }
  } else if (params.submission_type === "rep") {
    const logs = await getCustomerRepLogs();
    const target = logs.find((l) => l.id === params.submission_id);
    if (target) {
      target.admin_points_awarded = params.points_awarded;
      writeData(KEYS.REP_LOGS, logs);
    }
  }

  return newRating;
}

export async function verifyLodge(lodgeId: string, is_verified: boolean): Promise<LodgeAsset> {
  const lodges = await getLodges();
  const lodge = lodges.find((l) => l.id === lodgeId);
  if (!lodge) throw new Error("Lodge not found");
  lodge.is_verified = is_verified;
  writeData(KEYS.LODGES, lodges);
  return lodge;
}

export async function updateCustomerRepLogStatus(logId: string, status: CustomerRepLog["status"]): Promise<CustomerRepLog> {
  const logs = await getCustomerRepLogs();
  const log = logs.find((l) => l.id === logId);
  if (!log) throw new Error("Log not found");
  log.status = status;
  writeData(KEYS.REP_LOGS, logs);
  return log;
}

