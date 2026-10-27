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

import { getSupabaseClient } from "./supabase/client";

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

export type StudentIntelType = 'final_year' | 'transition';

export interface StudentIntelRecord {
  id: string;
  student_type: StudentIntelType; // 'final_year' (graduating/vacating) | 'transition' (moving to another lodge)
  student_name: string;
  phone: string;
  current_lodge_name: string;
  area: string;
  room_number_or_type: string;
  expected_move_date: string; // e.g., "August 2026" or "Next Session"
  // Final-Year specific fields:
  room_opening_up?: boolean;
  items_for_sale?: string; // e.g., "Bed frame, 6kg gas cylinder, table fridge"
  // Transition student specific fields:
  reason_for_moving?: string; // e.g., "Water issue, wants closer to gate"
  preferred_new_area?: string;
  target_budget?: string;
  desired_new_room_type?: string;
  // Meta & Admin review:
  notes?: string;
  recorded_by_id: string;
  recorded_by_name: string;
  created_at: string;
  admin_points_awarded?: number;
  admin_feedback?: string;
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
  admin_feedback?: string;
}

export interface WhatsAppBlastLog {
  id: string;
  group_name: string;
  broadcast_type: 'New Vacancies List' | 'Fresher Orientation' | 'Urgent Flat Offer';
  freshers_reached_estimate: number;
  hotliner_name: string;
  created_at: string;
}

export type KingsokSector = 'Accommodation' | 'Properties' | 'Rentals' | 'Food';

export interface RegisteredClientRecord {
  id: string;
  sector: KingsokSector;
  client_name: string;
  phone: string;
  whatsapp_phone?: string;
  email?: string;
  client_category: string; // e.g., "100L Fresher", "Transition Student", "Final Year", "Property Buyer", "General Client"
  department_or_occupation?: string;
  service_or_lodge_acquired: string; // e.g., "Peace Haven Lodge - Room 12" or service name
  area_or_location: string;
  amount_paid?: string;
  payment_status: 'paid_in_full' | 'part_payment' | 'inspection_only' | 'pending';
  assigned_staff_name?: string; // Controller or Hotliner who handled them
  emergency_or_parent_contact?: string;
  notes?: string;
  registered_by_id: string;
  registered_by_name: string;
  created_at: string;
  admin_points_awarded?: number;
  admin_feedback?: string;
}

export interface CustomerRepLog {
  id: string;
  sector?: KingsokSector;
  category: 'Lodge Verification' | 'Fresher Feedback' | 'Issue Resolution' | 'Caretaker Dispute' | 'Client Feedback';
  target_reference: string; // e.g. "Peace Haven Lodge" or "Chioma (Fresher)"
  findings: string;
  action_taken: string;
  satisfaction_rating?: number; // 1 to 5 stars
  status: 'resolved' | 'pending_supervisor';
  rep_name: string;
  created_at: string;
  admin_points_awarded?: number;
  admin_feedback?: string;
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

export interface DailyDutyTask {
  id: string;
  worker_id: string;
  worker_name: string;
  role: WorkerRole;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  target_count: number;
  completed_count: number;
  unit_label: string; // e.g. "Lodges", "Contacts", "Applications", "Inspections"
  is_completed: boolean;
  assigned_by: "system_ai" | "admin";
  admin_note?: string;
  created_at: string;
}

export interface LodgeAgencyApplication {
  id: string;
  lodge_name: string;
  area: string;
  caretaker_name: string;
  caretaker_phone: string;
  controller_id: string;
  controller_name: string;
  commission_terms: string; // e.g. "10% Agency fee, 0 cost to caretaker, 100% vetted students"
  status: "applied" | "in_discussion" | "accepted" | "declined";
  notes?: string;
  created_at: string;
}

export interface TerritoryZone {
  id: string;
  name: string;
  estimated_total_lodges: number;
  lodges_scouted: number;
  vacancies_found: number;
  agency_agreements_won: number;
  assigned_controller_name: string;
}

export interface ClientApproachGuide {
  title: string;
  core_rule: string;
  rules: { title: string; instruction: string; badge: string }[];
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
  {
    id: "u-okonkwo",
    name: "Okonkwo Chukwuma",
    email: "okonkwo@kingsok.com",
    phone: "+234 806 777 8899",
    roles: ["area_controller"],
    total_points: 30,
    cash_value_earned: 30000,
    rating_average: 4.9,
    joined_at: new Date(Date.now() - 86400000 * 5).toISOString(),
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

export const INITIAL_ZONES: TerritoryZone[] = [
  {
    id: "zone-hilltop",
    name: "Hilltop Zone",
    estimated_total_lodges: 500,
    lodges_scouted: 74,
    vacancies_found: 18,
    agency_agreements_won: 6,
    assigned_controller_name: "Okonkwo Chukwuma",
  },
  {
    id: "zone-odim",
    name: "Odim Gate Zone",
    estimated_total_lodges: 350,
    lodges_scouted: 48,
    vacancies_found: 9,
    agency_agreements_won: 4,
    assigned_controller_name: "Emeka Obi",
  },
  {
    id: "zone-ofulonu",
    name: "Ofulonu Zone",
    estimated_total_lodges: 400,
    lodges_scouted: 32,
    vacancies_found: 11,
    agency_agreements_won: 3,
    assigned_controller_name: "Okonkwo Chukwuma",
  },
  {
    id: "zone-greenhouse",
    name: "Green House Zone",
    estimated_total_lodges: 250,
    lodges_scouted: 22,
    vacancies_found: 5,
    agency_agreements_won: 2,
    assigned_controller_name: "Emeka Obi",
  },
];

export const CLIENT_APPROACH_GUIDE: ClientApproachGuide = {
  title: "KINGSOK Client Inspection & Approach Etiquette",
  core_rule: "Never rush, never deceive, never cut corners. Represent KINGSOK with calm authority and absolute truth.",
  rules: [
    {
      title: "1. Prompt & Presentable Arrival",
      badge: "Punctuality",
      instruction: "Be at the designated campus meeting point 10 minutes before the student arrives. Dress cleanly and professionally as a trusted KINGSOK representative.",
    },
    {
      title: "2. Warm Dignified Greeting",
      badge: "Respect",
      instruction: "Welcome both the fresher and their accompanying parent or guardian with genuine warmth. Address them by name and set them at ease.",
    },
    {
      title: "3. Truthful Pre-Briefing Before Unlocking",
      badge: "Honesty",
      instruction: "Before opening the room door, state the ground truth clearly: water reliability, generator frequency, distance to lecture halls, and the exact rent plus caution fees.",
    },
    {
      title: "4. Unrushed Room Inspection",
      badge: "Patience",
      instruction: "Give the student and parent ample time to examine the room, bathroom, tap flow, ceiling, and security locks without hovering or applying sales pressure.",
    },
    {
      title: "5. Alternative Offerings If Unsuited",
      badge: "Care",
      instruction: "If the room does not feel like home to them, never force it. Immediately offer 2 alternative vetted lodges in your zone to inspect next.",
    },
  ],
};

const SEED_APPLICATIONS: LodgeAgencyApplication[] = [
  {
    id: "app-1",
    lodge_name: "Peace Haven Lodge",
    area: "Hilltop Phase 1",
    caretaker_name: "Elder Samuel",
    caretaker_phone: "+234 803 456 7890",
    controller_id: "u-okonkwo",
    controller_name: "Okonkwo Chukwuma",
    commission_terms: "10% Agency commission, zero upfront fee to landlord, all freshers verified",
    status: "accepted",
    notes: "Elder Samuel agreed. KINGSOK is now exclusive agent for the 3 vacant self-contain rooms.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "app-2",
    lodge_name: "Apex Villa Royale",
    area: "Odim Gate Area",
    caretaker_name: "Mr. Boniface",
    caretaker_phone: "+234 805 987 6543",
    controller_id: "u-emeka",
    controller_name: "Emeka Obi",
    commission_terms: "10% Agency fee, priority listing to incoming fresher database",
    status: "in_discussion",
    notes: "Meeting on Saturday to finalize agreement for the 2 upcoming rooms.",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const SEED_STUDENT_INTEL: StudentIntelRecord[] = [
  {
    id: "intel-fy-1",
    student_type: "final_year",
    student_name: "Chinedu Eze",
    phone: "+234 802 987 6543",
    current_lodge_name: "Peace Haven Lodge",
    area: "Hilltop Phase 1",
    room_number_or_type: "Room 14 (Self-contain)",
    expected_move_date: "July 2026",
    room_opening_up: true,
    items_for_sale: "Haier Thermocool small fridge, 4.5ft Vitafoam mattress, gas cooker + 6kg cylinder, wooden reading table",
    notes: "Top-floor corner room with good ventilation. Student wants to sell items as a package or separately to incoming fresher.",
    recorded_by_id: "u-okonkwo",
    recorded_by_name: "Okonkwo Chukwuma",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    admin_points_awarded: 2,
    admin_feedback: "High-value intel. Room secured for incoming fresher intake.",
  },
  {
    id: "intel-fy-2",
    student_type: "final_year",
    student_name: "Fatima Abubakar",
    phone: "+234 813 555 7890",
    current_lodge_name: "Apex Villa Royale",
    area: "Odim Gate Area",
    room_number_or_type: "Block B, Room 4",
    expected_move_date: "End of Session (August)",
    room_opening_up: true,
    items_for_sale: "Executive study desk and swivel chair, rechargeable standing fan, wardrobe rack",
    notes: "Lodge is 3 mins from campus gate. Caretaker confirmed room can be reserved immediately upon deposit.",
    recorded_by_id: "u-emeka",
    recorded_by_name: "Emeka Obi",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    admin_points_awarded: 2,
  },
  {
    id: "intel-tr-1",
    student_type: "transition",
    student_name: "Somtochukwu Okafor",
    phone: "+234 703 111 8899",
    current_lodge_name: "Green Ridge Lodge",
    area: "Ofulonu Zone",
    room_number_or_type: "Room 3 (Single Room)",
    expected_move_date: "Next Session Intake",
    reason_for_moving: "Water pumping irregularity and distant walking distance to faculty",
    preferred_new_area: "Hilltop Phase 1",
    target_budget: "₦260,000 - ₦300,000",
    desired_new_room_type: "Standard Self-contain with steady borehole water",
    notes: "Ready to inspect lodges anytime this weekend with an Area Controller.",
    recorded_by_id: "u-okonkwo",
    recorded_by_name: "Okonkwo Chukwuma",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    admin_points_awarded: 1,
  },
  {
    id: "intel-tr-2",
    student_type: "transition",
    student_name: "David Adeleke",
    phone: "+234 815 444 2211",
    current_lodge_name: "St. Jude Executive Villa",
    area: "Hilltop Zone",
    room_number_or_type: "Flat 2A",
    expected_move_date: "Immediate (within 2 weeks)",
    reason_for_moving: "Landlord excessive utility surcharge increase without regular light",
    preferred_new_area: "Odim Gate Area",
    target_budget: "₦220,000 - ₦250,000",
    desired_new_room_type: "Self-contain or 1-bedroom flat",
    notes: "Has paid advance notice to current caretaker. Wants a verified quiet compound.",
    recorded_by_id: "u-okonkwo",
    recorded_by_name: "Okonkwo Chukwuma",
    created_at: new Date().toISOString(),
  },
];

const SEED_REGISTERED_CLIENTS: RegisteredClientRecord[] = [
  {
    id: "client-acc-1",
    sector: "Accommodation",
    client_name: "Blessing Udoh",
    phone: "+234 814 555 1234",
    whatsapp_phone: "+234 814 555 1234",
    email: "blessing.udoh@uni.edu.ng",
    client_category: "100L Fresher (Pharmacy)",
    department_or_occupation: "Faculty of Pharmaceutical Sciences",
    service_or_lodge_acquired: "Peace Haven Lodge - Room 8",
    area_or_location: "Hilltop Phase 1",
    amount_paid: "₦280,000",
    payment_status: "paid_in_full",
    assigned_staff_name: "Emeka Obi",
    emergency_or_parent_contact: "Dr. Udoh (Father) - +234 802 333 4444",
    notes: "Accommodated with zero stress. Keys received from caretaker Elder Samuel.",
    registered_by_id: "u-kalu",
    registered_by_name: "Kalu Eze",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    admin_points_awarded: 2,
    admin_feedback: "Fully documented client registration with parent contact verified.",
  },
  {
    id: "client-acc-2",
    sector: "Accommodation",
    client_name: "Ibrahim Musa",
    phone: "+234 809 333 4455",
    whatsapp_phone: "+234 809 333 4455",
    email: "ibrahim.m@uni.edu.ng",
    client_category: "100L Fresher (Computer Science)",
    department_or_occupation: "Faculty of Physical Sciences",
    service_or_lodge_acquired: "Apex Villa Royale - Room B2",
    area_or_location: "Odim Gate Area",
    amount_paid: "₦350,000",
    payment_status: "paid_in_full",
    assigned_staff_name: "Chioma Nwosu",
    emergency_or_parent_contact: "Alhaji Musa - +234 803 111 9988",
    notes: "Requires generator connectivity for developer workstation setup.",
    registered_by_id: "u-kalu",
    registered_by_name: "Kalu Eze",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    admin_points_awarded: 2,
  },
  {
    id: "client-prop-1",
    sector: "Properties",
    client_name: "Engr. Kenneth Alabi",
    phone: "+234 802 777 9900",
    whatsapp_phone: "+234 802 777 9900",
    email: "k.alabi@apexconsult.com",
    client_category: "Property Buyer / Commercial Investor",
    department_or_occupation: "Civil Engineering Consultant",
    service_or_lodge_acquired: "Hilltop Commercial Development Plot 4B",
    area_or_location: "Hilltop Extension Area",
    amount_paid: "₦4,500,000 (Initial Trench)",
    payment_status: "part_payment",
    assigned_staff_name: "Okoye (Admin)",
    emergency_or_parent_contact: "Barr. Chike (Legal Rep) - +234 803 888 7766",
    notes: "Site coordinates surveyed. Title documentation in progress.",
    registered_by_id: "u-kalu",
    registered_by_name: "Kalu Eze",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    admin_points_awarded: 3,
  },
  {
    id: "client-rent-1",
    sector: "Rentals",
    client_name: "Campus Gospel Fellowship",
    phone: "+234 816 444 7788",
    whatsapp_phone: "+234 816 444 7788",
    email: "cgf.chapter@gmail.com",
    client_category: "Institutional / Event Client",
    department_or_occupation: "Student Union Association",
    service_or_lodge_acquired: "500-Capacity Canopy, 300 Chairs & Sound System Set",
    area_or_location: "Main University Gate Pavilion",
    amount_paid: "₦180,000",
    payment_status: "paid_in_full",
    assigned_staff_name: "Kalu Eze",
    emergency_or_parent_contact: "Bro. Emmanuel (President) - +234 811 222 3344",
    notes: "Weekend orientation summit logistics setup booked.",
    registered_by_id: "u-kalu",
    registered_by_name: "Kalu Eze",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "client-food-1",
    sector: "Food",
    client_name: "Heritage Hostel Students Association",
    phone: "+234 701 888 3322",
    whatsapp_phone: "+234 701 888 3322",
    email: "heritage.hall@uni.edu.ng",
    client_category: "Hostel Meal Plan Group",
    department_or_occupation: "Hall Government",
    service_or_lodge_acquired: "Weekly Dinner Supply & Nutritional Plan (25 Subscribers)",
    area_or_location: "Ofulonu Zone",
    amount_paid: "₦150,000",
    payment_status: "paid_in_full",
    assigned_staff_name: "Kalu Eze",
    emergency_or_parent_contact: "Hall Warden Office - +234 805 000 1122",
    notes: "Delivery starts this Monday at 7:00 PM daily.",
    registered_by_id: "u-kalu",
    registered_by_name: "Kalu Eze",
    created_at: new Date().toISOString(),
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
  TASKS: "kingsok_acc_tasks",
  APPLICATIONS: "kingsok_acc_applications",
  ZONES: "kingsok_acc_zones",
  STUDENT_INTEL: "kingsok_acc_student_intel",
  CLIENTS: "kingsok_registered_clients",
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
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("lodges")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        writeData(KEYS.LODGES, data);
        return data as LodgeAsset[];
      }
    } catch (err) {
      console.warn("Supabase fetch lodges failed, using local cache", err);
    }
  }
  return readData<LodgeAsset[]>(KEYS.LODGES, SEED_LODGES);
}

export async function createLodge(data: Omit<LodgeAsset, "id" | "created_at">): Promise<LodgeAsset> {
  const lodges = readData<LodgeAsset[]>(KEYS.LODGES, SEED_LODGES);
  const newLodge: LodgeAsset = {
    ...data,
    id: "lodge-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  const updated = [newLodge, ...lodges];
  writeData(KEYS.LODGES, updated);

  // Update current goal progress if vacancies were found
  if (newLodge.vacancy_count > 0) {
    try {
      const goal = await getCampaignGoal();
      writeData(KEYS.GOAL, {
        ...goal,
        current_accommodated: goal.current_accommodated + 1,
      });
    } catch {}
  }

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("lodges").insert([newLodge]);
    } catch (err) {
      console.warn("Supabase insert lodge error (persisted locally):", err);
    }
  }

  return newLodge;
}

export const createLodgeAsset = createLodge;
export const addLodgeAsset = createLodge;

export async function updateLodgeAsset(id: string, updates: Partial<LodgeAsset>): Promise<LodgeAsset> {
  const lodges = readData<LodgeAsset[]>(KEYS.LODGES, SEED_LODGES);
  const index = lodges.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Lodge not found");

  const updatedLodge: LodgeAsset = {
    ...lodges[index],
    ...updates,
  };
  lodges[index] = updatedLodge;
  writeData(KEYS.LODGES, lodges);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("lodges").update(updates).eq("id", id);
    } catch (err) {
      console.warn("Supabase update lodge error (persisted locally):", err);
    }
  }

  return updatedLodge;
}

export async function deleteLodgeAsset(id: string): Promise<boolean> {
  const lodges = readData<LodgeAsset[]>(KEYS.LODGES, SEED_LODGES);
  const filtered = lodges.filter((l) => l.id !== id);
  if (filtered.length === lodges.length) return false;
  writeData(KEYS.LODGES, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("lodges").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete lodge error:", err);
    }
  }

  return true;
}

// ------------------------------------------------------------------------------
// STUDENT INTEL (FINAL-YEAR GRADUATING & TRANSITION STUDENTS)
// ------------------------------------------------------------------------------

export async function getStudentIntelRecords(): Promise<StudentIntelRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("student_intel")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        writeData(KEYS.STUDENT_INTEL, data);
        return data as StudentIntelRecord[];
      }
    } catch (err) {
      console.warn("Supabase fetch student_intel failed, using local cache", err);
    }
  }
  return readData<StudentIntelRecord[]>(KEYS.STUDENT_INTEL, SEED_STUDENT_INTEL);
}

export async function createStudentIntelRecord(
  data: Omit<StudentIntelRecord, "id" | "created_at">
): Promise<StudentIntelRecord> {
  const records = readData<StudentIntelRecord[]>(KEYS.STUDENT_INTEL, SEED_STUDENT_INTEL);
  const newRecord: StudentIntelRecord = {
    ...data,
    id: "intel-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.STUDENT_INTEL, [newRecord, ...records]);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("student_intel").insert([newRecord]);
    } catch (err) {
      console.warn("Supabase insert student_intel error (persisted locally):", err);
    }
  }

  return newRecord;
}

export const addStudentIntelRecord = createStudentIntelRecord;

export async function updateStudentIntelRecord(
  id: string,
  updates: Partial<StudentIntelRecord>
): Promise<StudentIntelRecord> {
  const records = readData<StudentIntelRecord[]>(KEYS.STUDENT_INTEL, SEED_STUDENT_INTEL);
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Student intel record not found");

  const updated: StudentIntelRecord = {
    ...records[index],
    ...updates,
  };
  records[index] = updated;
  writeData(KEYS.STUDENT_INTEL, records);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("student_intel").update(updates).eq("id", id);
    } catch (err) {
      console.warn("Supabase update student_intel error (persisted locally):", err);
    }
  }

  return updated;
}

export async function deleteStudentIntelRecord(id: string): Promise<boolean> {
  const records = readData<StudentIntelRecord[]>(KEYS.STUDENT_INTEL, SEED_STUDENT_INTEL);
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) return false;
  writeData(KEYS.STUDENT_INTEL, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("student_intel").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete student_intel error:", err);
    }
  }

  return true;
}

// Client Leads (Hotliners)
export async function getClientLeads(): Promise<ClientLead[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("client_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        writeData(KEYS.LEADS, data);
        return data as ClientLead[];
      }
    } catch (err) {
      console.warn("Supabase fetch client_leads failed, using local cache", err);
    }
  }
  return readData<ClientLead[]>(KEYS.LEADS, SEED_LEADS);
}

export async function createClientLead(data: Omit<ClientLead, "id" | "created_at">): Promise<ClientLead> {
  const leads = readData<ClientLead[]>(KEYS.LEADS, SEED_LEADS);
  const newLead: ClientLead = {
    ...data,
    id: "lead-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.LEADS, [newLead, ...leads]);

  // Update reach in campaign goal
  try {
    const goal = await getCampaignGoal();
    writeData(KEYS.GOAL, {
      ...goal,
      current_freshers_reach: goal.current_freshers_reach + 1,
    });
  } catch {}

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("client_leads").insert([newLead]);
    } catch (err) {
      console.warn("Supabase insert client_leads error (persisted locally):", err);
    }
  }

  return newLead;
}

export const addClientLead = createClientLead;

export async function updateLeadStatus(leadId: string, status: ClientLead["status"]): Promise<ClientLead> {
  const leads = readData<ClientLead[]>(KEYS.LEADS, SEED_LEADS);
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) throw new Error("Lead not found");
  lead.status = status;
  writeData(KEYS.LEADS, leads);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("client_leads").update({ status }).eq("id", leadId);
    } catch (err) {
      console.warn("Supabase update lead status error:", err);
    }
  }

  return lead;
}

export async function updateClientLead(id: string, updates: Partial<ClientLead>): Promise<ClientLead> {
  const leads = readData<ClientLead[]>(KEYS.LEADS, SEED_LEADS);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Lead not found");
  leads[idx] = { ...leads[idx], ...updates };
  writeData(KEYS.LEADS, leads);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("client_leads").update(updates).eq("id", id);
    } catch (err) {
      console.warn("Supabase update client_lead error:", err);
    }
  }

  return leads[idx];
}

export async function deleteClientLead(id: string): Promise<boolean> {
  const leads = readData<ClientLead[]>(KEYS.LEADS, SEED_LEADS);
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;
  writeData(KEYS.LEADS, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("client_leads").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete client_lead error:", err);
    }
  }

  return true;
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

  try {
    const goal = await getCampaignGoal();
    writeData(KEYS.GOAL, {
      ...goal,
      current_freshers_reach: goal.current_freshers_reach + data.freshers_reached_estimate,
    });
  } catch {}

  return newBlast;
}

export async function deleteWhatsAppBlast(id: string): Promise<boolean> {
  const blasts = await getWhatsAppBlasts();
  const filtered = blasts.filter((b) => b.id !== id);
  if (filtered.length === blasts.length) return false;
  writeData(KEYS.BLASTS, filtered);
  return true;
}

// Customer Rep Logs
export async function getCustomerRepLogs(): Promise<CustomerRepLog[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("customer_rep_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        writeData(KEYS.REP_LOGS, data);
        return data as CustomerRepLog[];
      }
    } catch (err) {
      console.warn("Supabase fetch customer_rep_logs failed, using local cache", err);
    }
  }
  return readData<CustomerRepLog[]>(KEYS.REP_LOGS, SEED_REP_LOGS);
}

export async function createCustomerRepLog(data: Omit<CustomerRepLog, "id" | "created_at">): Promise<CustomerRepLog> {
  const logs = readData<CustomerRepLog[]>(KEYS.REP_LOGS, SEED_REP_LOGS);
  const newLog: CustomerRepLog = {
    ...data,
    id: "rep-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.REP_LOGS, [newLog, ...logs]);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("customer_rep_logs").insert([newLog]);
    } catch (err) {
      console.warn("Supabase insert customer_rep_logs error (persisted locally):", err);
    }
  }

  return newLog;
}

export const addCustomerRepLog = createCustomerRepLog;

export async function deleteCustomerRepLog(id: string): Promise<boolean> {
  const logs = readData<CustomerRepLog[]>(KEYS.REP_LOGS, SEED_REP_LOGS);
  const filtered = logs.filter((l) => l.id !== id);
  if (filtered.length === logs.length) return false;
  writeData(KEYS.REP_LOGS, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("customer_rep_logs").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete customer_rep_logs error:", err);
    }
  }

  return true;
}

// ------------------------------------------------------------------------------
// REGISTERED CLIENT PROFILES (CROSS-SECTOR)
// ------------------------------------------------------------------------------

export async function getRegisteredClients(): Promise<RegisteredClientRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("registered_clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        writeData(KEYS.CLIENTS, data);
        return data as RegisteredClientRecord[];
      }
    } catch (err) {
      console.warn("Supabase fetch registered_clients failed, using local cache", err);
    }
  }
  return readData<RegisteredClientRecord[]>(KEYS.CLIENTS, SEED_REGISTERED_CLIENTS);
}

export async function createRegisteredClient(
  data: Omit<RegisteredClientRecord, "id" | "created_at">
): Promise<RegisteredClientRecord> {
  const clients = readData<RegisteredClientRecord[]>(KEYS.CLIENTS, SEED_REGISTERED_CLIENTS);
  const newClient: RegisteredClientRecord = {
    ...data,
    id: "client-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.CLIENTS, [newClient, ...clients]);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("registered_clients").insert([newClient]);
    } catch (err) {
      console.warn("Supabase insert registered_clients error (persisted locally):", err);
    }
  }

  return newClient;
}

export const registerClient = createRegisteredClient;
export const addRegisteredClient = createRegisteredClient;

export async function updateRegisteredClient(
  id: string,
  updates: Partial<RegisteredClientRecord>
): Promise<RegisteredClientRecord> {
  const clients = readData<RegisteredClientRecord[]>(KEYS.CLIENTS, SEED_REGISTERED_CLIENTS);
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Client not found");

  const updated: RegisteredClientRecord = {
    ...clients[index],
    ...updates,
  };
  clients[index] = updated;
  writeData(KEYS.CLIENTS, clients);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("registered_clients").update(updates).eq("id", id);
    } catch (err) {
      console.warn("Supabase update registered_clients error (persisted locally):", err);
    }
  }

  return updated;
}

export async function deleteRegisteredClient(id: string): Promise<boolean> {
  const clients = readData<RegisteredClientRecord[]>(KEYS.CLIENTS, SEED_REGISTERED_CLIENTS);
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return false;
  writeData(KEYS.CLIENTS, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("registered_clients").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete registered_clients error:", err);
    }
  }

  return true;
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
  submission_type: "lodge" | "lead" | "rep" | "student" | "client";
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
      target.admin_feedback = params.coaching_comment;
      writeData(KEYS.LEADS, leads);
    }
  } else if (params.submission_type === "rep") {
    const logs = await getCustomerRepLogs();
    const target = logs.find((l) => l.id === params.submission_id);
    if (target) {
      target.admin_points_awarded = params.points_awarded;
      target.admin_feedback = params.coaching_comment;
      writeData(KEYS.REP_LOGS, logs);
    }
  } else if (params.submission_type === "student") {
    const records = await getStudentIntelRecords();
    const target = records.find((s) => s.id === params.submission_id);
    if (target) {
      target.admin_points_awarded = params.points_awarded;
      target.admin_feedback = params.coaching_comment;
      writeData(KEYS.STUDENT_INTEL, records);
    }
  } else if (params.submission_type === "client") {
    const clients = await getRegisteredClients();
    const target = clients.find((c) => c.id === params.submission_id);
    if (target) {
      target.admin_points_awarded = params.points_awarded;
      target.admin_feedback = params.coaching_comment;
      writeData(KEYS.CLIENTS, clients);
    }
  }

  return newRating;
}

export const awardPointsAndRating = awardWorkerRatingAndPoints;

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

// ------------------------------------------------------------------------------
// TERRITORY ZONES & RECON PROGRESS
// ------------------------------------------------------------------------------

export async function getTerritoryZones(): Promise<TerritoryZone[]> {
  return readData<TerritoryZone[]>(KEYS.ZONES, INITIAL_ZONES);
}

export async function getClientApproachGuide(): Promise<ClientApproachGuide> {
  return CLIENT_APPROACH_GUIDE;
}

// ------------------------------------------------------------------------------
// LODGE AGENCY REPRESENTATION APPLICATIONS
// ------------------------------------------------------------------------------

export async function getLodgeApplications(): Promise<LodgeAgencyApplication[]> {
  return readData<LodgeAgencyApplication[]>(KEYS.APPLICATIONS, SEED_APPLICATIONS);
}

export async function createLodgeApplication(
  data: Omit<LodgeAgencyApplication, "id" | "created_at">
): Promise<LodgeAgencyApplication> {
  const list = await getLodgeApplications();
  const newApp: LodgeAgencyApplication = {
    ...data,
    id: "app-" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  writeData(KEYS.APPLICATIONS, [newApp, ...list]);
  return newApp;
}

export async function updateLodgeApplicationStatus(
  appId: string,
  status: LodgeAgencyApplication["status"]
): Promise<LodgeAgencyApplication> {
  const list = await getLodgeApplications();
  const app = list.find((a) => a.id === appId);
  if (!app) throw new Error("Application not found");
  app.status = status;
  writeData(KEYS.APPLICATIONS, list);
  return app;
}

// ------------------------------------------------------------------------------
// INTELLIGENT DAILY DUTIES & AUTO-PACING ENGINE
// ------------------------------------------------------------------------------

export function generateSystemDailyQuests(
  workerId: string,
  workerName: string,
  role: WorkerRole
): DailyDutyTask[] {
  const todayStr = new Date().toISOString().split("T")[0];

  if (role === "area_controller") {
    return [
      {
        id: `task-${workerId}-scout-${todayStr}`,
        worker_id: workerId,
        worker_name: workerName,
        role: "area_controller",
        date: todayStr,
        title: "Daily Territory Recon: Scout 30 Lodges",
        description:
          "Target 30 lodges in your designated territory (e.g. Hilltop Phase 1). Check vacancies now, upcoming rooms, water & light reality.",
        target_count: 30,
        completed_count: 0,
        unit_label: "Lodges Visited",
        is_completed: false,
        assigned_by: "system_ai",
        created_at: new Date().toISOString(),
      },
      {
        id: `task-${workerId}-db-${todayStr}`,
        worker_id: workerId,
        worker_name: workerName,
        role: "area_controller",
        date: todayStr,
        title: "Lodge Intel Database Capture",
        description:
          "Capture Caretaker details, Lodge President contact, and identify graduating final-year students with rooms & household goods to sell.",
        target_count: 10,
        completed_count: 0,
        unit_label: "Lodges Mapped",
        is_completed: false,
        assigned_by: "system_ai",
        created_at: new Date().toISOString(),
      },
      {
        id: `task-${workerId}-agency-${todayStr}`,
        worker_id: workerId,
        worker_name: workerName,
        role: "area_controller",
        date: todayStr,
        title: "Submit 2 Lodge Agency Applications",
        description:
          "Formally pitch caretakers to sign KINGSOK as their official lodge representation agent to fill their rooms fast.",
        target_count: 2,
        completed_count: 0,
        unit_label: "Applications Sent",
        is_completed: false,
        assigned_by: "system_ai",
        created_at: new Date().toISOString(),
      },
      {
        id: `task-${workerId}-inspect-${todayStr}`,
        worker_id: workerId,
        worker_name: workerName,
        role: "area_controller",
        date: todayStr,
        title: "Client Physical Inspection with Truth",
        description:
          "Take incoming fresher student leads on honest physical lodge tours, following the KINGSOK Client Approach Etiquette.",
        target_count: 2,
        completed_count: 0,
        unit_label: "Tours Conducted",
        is_completed: false,
        assigned_by: "system_ai",
        created_at: new Date().toISOString(),
      },
    ];
  }

  if (role === "hotliner") {
    return [
      {
        id: `task-${workerId}-blast-${todayStr}`,
        worker_id: workerId,
        worker_name: workerName,
        role: "hotliner",
        date: todayStr,
        title: "WhatsApp Fresher Broadcasts",
        description:
          "Send curated vacancy lists to 4 active student groups to reach 1,000+ incoming freshers.",
        target_count: 4,
        completed_count: 0,
        unit_label: "Communities",
        is_completed: false,
        assigned_by: "system_ai",
        created_at: new Date().toISOString(),
      },
      {
        id: `task-${workerId}-inquiry-${todayStr}`,
        worker_id: workerId,
        worker_name: workerName,
        role: "hotliner",
        date: todayStr,
        title: "Qualify 15 Fresher Inquiries",
        description:
          "Engage incoming students, get budget and room requirements, and book them for physical inspections.",
        target_count: 15,
        completed_count: 0,
        unit_label: "Freshers Qualified",
        is_completed: false,
        assigned_by: "system_ai",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return [];
}

export async function getDailyTasks(workerId?: string): Promise<DailyDutyTask[]> {
  const allTasks = readData<DailyDutyTask[]>(KEYS.TASKS, []);
  if (workerId) {
    return allTasks.filter((t) => t.worker_id === workerId);
  }
  return allTasks;
}

export async function getOrGenerateDailyTasks(
  workerId: string,
  role: WorkerRole
): Promise<DailyDutyTask[]> {
  const users = await getUsers();
  const worker = users.find((u) => u.id === workerId) || users[0];
  const allTasks = readData<DailyDutyTask[]>(KEYS.TASKS, []);
  const todayStr = new Date().toISOString().split("T")[0];

  const userTodayTasks = allTasks.filter(
    (t) => t.worker_id === worker.id && t.date === todayStr
  );

  if (userTodayTasks.length > 0) {
    return userTodayTasks;
  }

  // Auto-generate fresh system quests for today
  const newQuests = generateSystemDailyQuests(worker.id, worker.name, role);
  const updated = [...newQuests, ...allTasks];
  writeData(KEYS.TASKS, updated);
  return newQuests;
}

export async function incrementTaskProgress(
  taskId: string,
  amount: number = 1
): Promise<DailyDutyTask> {
  const allTasks = readData<DailyDutyTask[]>(KEYS.TASKS, []);
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Task not found");

  task.completed_count = Math.min(task.target_count, task.completed_count + amount);
  if (task.completed_count >= task.target_count) {
    task.is_completed = true;
  }
  writeData(KEYS.TASKS, allTasks);
  return task;
}

export async function toggleTaskComplete(taskId: string): Promise<DailyDutyTask> {
  const allTasks = readData<DailyDutyTask[]>(KEYS.TASKS, []);
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Task not found");

  task.is_completed = !task.is_completed;
  if (task.is_completed) {
    task.completed_count = task.target_count;
  }
  writeData(KEYS.TASKS, allTasks);
  return task;
}

export async function assignAdminDuty(params: {
  worker_id: string;
  worker_name: string;
  role: WorkerRole;
  title: string;
  description: string;
  target_count: number;
  unit_label: string;
  admin_note?: string;
}): Promise<DailyDutyTask> {
  const allTasks = readData<DailyDutyTask[]>(KEYS.TASKS, []);
  const todayStr = new Date().toISOString().split("T")[0];

  const newTask: DailyDutyTask = {
    id: "admin-task-" + Date.now().toString(36),
    worker_id: params.worker_id,
    worker_name: params.worker_name,
    role: params.role,
    date: todayStr,
    title: params.title,
    description: params.description,
    target_count: params.target_count,
    completed_count: 0,
    unit_label: params.unit_label,
    is_completed: false,
    assigned_by: "admin",
    admin_note: params.admin_note || "Direct priority directive from Okoye",
    created_at: new Date().toISOString(),
  };

  writeData(KEYS.TASKS, [newTask, ...allTasks]);
  return newTask;
}

export async function deleteDailyTask(id: string): Promise<boolean> {
  const allTasks = readData<DailyDutyTask[]>(KEYS.TASKS, []);
  const filtered = allTasks.filter((t) => t.id !== id);
  if (filtered.length === allTasks.length) return false;
  writeData(KEYS.TASKS, filtered);
  return true;
}


