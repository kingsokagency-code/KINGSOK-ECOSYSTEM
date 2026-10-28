/**
 * KINGSOK Admission Intelligence System - Synthetic Test Datasets
 * Realistic synthetic test records for both UTME and Direct Entry admissions,
 * covering all verification scenarios required by specification.
 *
 * Task 1 & 2: Explicitly marked with dataSource: 'synthetic' so synthetic
 * records can never be confused with live candidate records.
 */

import { RawCandidateInput } from './processor';

/**
 * Synthetic UTME Candidates
 */
export const SYNTHETIC_UTME_CANDIDATES: RawCandidateInput[] = [
  {
    jambRegNumber: '202410012345AB',
    candidateName: 'CHUKWUEMEKA KINGSLEY OBI',
    department: 'Computer Science',
    phoneNumber: '08031234567',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202410023456CD',
    candidateName: 'NGOZI PRECIOUS NWOSU',
    department: 'Medicine and Surgery',
    phoneNumber: '08129876543',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202410034567EF',
    candidateName: 'SOMTOCHUKWU DAVID EZE',
    department: 'Pharmacy',
    phoneNumber: '07034567890',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202410045678GH',
    candidateName: 'CHIDINMA BLESSING OKAFOR',
    department: 'Nursing Science',
    phoneNumber: '09012345678',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202410056789IJ',
    candidateName: 'TOCHUKWU EMMANUEL UMEH',
    department: 'Civil Engineering',
    phoneNumber: '08056789012',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202410067890KL',
    candidateName: 'ADAOBI GRACE ONYEKA',
    department: 'Law',
    phoneNumber: '', // MISSING PHONE TEST CASE
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202410078901MN',
    candidateName: 'IKENNA VICTOR OKOYE',
    department: '', // MISSING DEPARTMENT TEST CASE
    phoneNumber: '08023456789',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202499999999ZZ',
    candidateName: 'UNMATCHED UTME CANDIDATE',
    department: 'Microbiology',
    phoneNumber: '08033334444',
    admissionType: 'UTME',
    dataSource: 'synthetic',
    simulatedError: 'unmatched', // UNMATCHED REG NO TEST CASE
  },
  {
    jambRegNumber: '202488888888XX',
    candidateName: 'TIMEOUT UTME CANDIDATE',
    department: 'Accountancy',
    phoneNumber: '08055556666',
    admissionType: 'UTME',
    dataSource: 'synthetic',
    simulatedError: 'timeout', // PORTAL TIMEOUT TEST CASE
  },
  {
    jambRegNumber: '202410012345AB', // INTRA-CATEGORY DUPLICATE TEST CASE (same as #1)
    candidateName: 'CHUKWUEMEKA KINGSLEY OBI',
    department: 'Computer Science',
    phoneNumber: '08031234567',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
  // Cross-category candidate: will also be included in DE list to test cross-category duplicate review flagging
  {
    jambRegNumber: '202477770001CC',
    candidateName: 'CHIBUZOR MICHAEL ANEKE',
    department: 'Electrical Engineering',
    phoneNumber: '08037778899',
    admissionType: 'UTME',
    dataSource: 'synthetic',
  },
];

/**
 * Synthetic Direct Entry (DE) Candidates
 */
export const SYNTHETIC_DIRECT_ENTRY_CANDIDATES: RawCandidateInput[] = [
  {
    jambRegNumber: '202420011111DE',
    candidateName: 'KINGSLEY ONYEBUCHI ANOSIKE',
    department: 'Mechanical Engineering',
    phoneNumber: '08061122334',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202420022222DE',
    candidateName: 'IFEOMA CYNTHIA MADU',
    department: 'Medical Laboratory Science',
    phoneNumber: '08134455667',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202420033333DE',
    candidateName: 'CHUKWUDI JOHN NDUKA',
    department: 'Architecture',
    phoneNumber: '07067788990',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202420044444DE',
    candidateName: 'CHIAMAKA JANE IBE',
    department: 'Mass Communication',
    phoneNumber: '09071122334',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202420055555DE',
    candidateName: 'EMMANUEL CHIBUEZE NWANKWO',
    department: 'Economics',
    phoneNumber: '08092233445',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202420066666DE',
    candidateName: 'CHINWE ROSEMARY DIKE',
    department: 'Biochemistry',
    phoneNumber: '', // MISSING PHONE TEST CASE
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202420077777DE',
    candidateName: 'PASCHAL TOCHUKWU MBA',
    department: '', // MISSING DEPARTMENT TEST CASE
    phoneNumber: '08183344556',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
  {
    jambRegNumber: '202499990000DE',
    candidateName: 'UNMATCHED DE CANDIDATE',
    department: 'Estate Management',
    phoneNumber: '08022221111',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
    simulatedError: 'unmatched', // UNMATCHED REG NO TEST CASE
  },
  {
    jambRegNumber: '202488880000DE',
    candidateName: 'TIMEOUT DE CANDIDATE',
    department: 'Geology',
    phoneNumber: '08044443333',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
    simulatedError: 'timeout', // PORTAL TIMEOUT TEST CASE
  },
  // Cross-category candidate: Registration number identical to UTME record 202477770001CC
  {
    jambRegNumber: '202477770001CC', // CROSS-CATEGORY DUPLICATE TEST CASE
    candidateName: 'CHIBUZOR MICHAEL ANEKE',
    department: 'Electrical Engineering',
    phoneNumber: '08037778899',
    admissionType: 'Direct Entry',
    dataSource: 'synthetic',
  },
];

/**
 * Combined synthetic list
 */
export const SYNTHETIC_COMBINED_CANDIDATES: RawCandidateInput[] = [
  ...SYNTHETIC_UTME_CANDIDATES,
  ...SYNTHETIC_DIRECT_ENTRY_CANDIDATES,
];
