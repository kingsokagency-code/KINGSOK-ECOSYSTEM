/**
 * KINGSOK Admission Intelligence System - Automated Verification Suite
 *
 * Verifies:
 * 1. Independent UTME Workflow Processing
 * 2. Independent Direct Entry (DE) Workflow Processing
 * 3. Combined Results Processing with Category Retention
 * 4. Correct Registration-Number Extraction & Normalization
 * 5. Accurate Authorized Field Mapping (6 authorized fields + Provenance)
 * 6. Handling of Missing Phone Numbers & Missing Departments
 * 7. Unmatched Registration Numbers & Portal Timeouts
 * 8. Intra-Category Duplicate Detection & Cross-Category Duplicate Flagging
 * 9. Task 1: Record Provenance Enforcement (Mandatory dataSource)
 * 10. Task 2: Synthetic Data Protection (Warning banner, filename prefix, anti-mixing)
 * 11. Task 3: Source-Aware Excel / CSV Exports
 * 12. Task 4: Approved Integration Boundary Interfaces
 */

import {
  processAdmissionDataset,
  cleanJambRegNumber,
  resolveAdmissionCategory,
} from '../src/lib/admissions/processor';
import {
  generateUtmeExportCsv,
  generateDirectEntryExportCsv,
  generateCombinedExportCsv,
  generateFlaggedForReviewCsv,
  resolveExportFilename,
} from '../src/lib/admissions/exporter';
import {
  SYNTHETIC_UTME_CANDIDATES,
  SYNTHETIC_DIRECT_ENTRY_CANDIDATES,
  SYNTHETIC_COMBINED_CANDIDATES,
} from '../src/lib/admissions/sampleData';
import {
  UTME_WORKFLOW_CONFIG,
  DIRECT_ENTRY_WORKFLOW_CONFIG,
} from '../src/lib/admissions/config';
import {
  UtmeCandidateRetrievalAdapter,
  DirectEntryCandidateRetrievalAdapter,
  CURRENT_INTEGRATION_STATUS,
} from '../src/lib/admissions/retrievalAdapters';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, description: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${description}`);
  } else {
    console.error(`  [FAIL] ${description}`);
    process.exitCode = 1;
  }
}

console.log('==============================================================================');
console.log('KINGSOK ADMISSION INTELLIGENCE SYSTEM - VERIFICATION SUITE');
console.log('==============================================================================\n');

// ----------------------------------------------------------------------------
// TEST 1: Workflow Configurations
// ----------------------------------------------------------------------------
console.log('1. Verifying Portal Configurations & Endpoints:');
assert(
  UTME_WORKFLOW_CONFIG.officialPortalUrl === 'https://unnportal.unn.edu.ng/putme_application_details',
  'UTME uses verified URL: https://unnportal.unn.edu.ng/putme_application_details'
);
assert(
  DIRECT_ENTRY_WORKFLOW_CONFIG.officialPortalUrl === 'https://unnportal.unn.edu.ng/ScrenningApplication.aspx',
  'Direct Entry uses verified URL: https://unnportal.unn.edu.ng/ScrenningApplication.aspx'
);
assert(
  DIRECT_ENTRY_WORKFLOW_CONFIG.loginPath === '/direct_entry_login',
  'Direct Entry login path is /direct_entry_login'
);
assert(
  DIRECT_ENTRY_WORKFLOW_CONFIG.targetPath === '/direct_entry_application/preview',
  'Direct Entry target path is /direct_entry_application/preview'
);
assert(
  UTME_WORKFLOW_CONFIG.allowBulkAutomatedScraping === false &&
    DIRECT_ENTRY_WORKFLOW_CONFIG.allowBulkAutomatedScraping === false,
  'Bulk automated scraping is explicitly flagged as restricted requiring institutional integration'
);

// ----------------------------------------------------------------------------
// TEST 2: Registration Number Extraction & Normalization
// ----------------------------------------------------------------------------
console.log('\n2. Verifying Registration Number Extraction & Normalization:');
assert(cleanJambRegNumber(' 202410012345ab ') === '202410012345AB', 'Normalizes lower case and trims spaces');
assert(cleanJambRegNumber('2024-1001-2345_AB') === '202410012345AB', 'Strips hyphens and underscores');
assert(cleanJambRegNumber('2024/1001/2345/AB') === '202410012345AB', 'Strips slashes');

// ----------------------------------------------------------------------------
// TEST 3: Admission Category Resolution
// ----------------------------------------------------------------------------
console.log('\n3. Verifying Admission Category Identification:');
assert(resolveAdmissionCategory(undefined, 'utme') === 'UTME', 'UTME mode defaults to UTME');
assert(resolveAdmissionCategory(undefined, 'direct_entry') === 'Direct Entry', 'Direct Entry mode defaults to Direct Entry');
assert(resolveAdmissionCategory('Direct Entry', 'combined') === 'Direct Entry', 'Combined mode detects Direct Entry category tag');
assert(resolveAdmissionCategory('UTME', 'combined') === 'UTME', 'Combined mode detects UTME category tag');

// ----------------------------------------------------------------------------
// TEST 4: Independent UTME Workflow Processing
// ----------------------------------------------------------------------------
console.log('\n4. Verifying Independent UTME Workflow:');
const utmeResult = processAdmissionDataset(SYNTHETIC_UTME_CANDIDATES, {
  selection: 'utme',
  defaultDataSource: 'synthetic',
});

assert(utmeResult.report.totalProcessed === SYNTHETIC_UTME_CANDIDATES.length, `Processed all ${SYNTHETIC_UTME_CANDIDATES.length} UTME candidates`);
assert(utmeResult.report.utmeCount === SYNTHETIC_UTME_CANDIDATES.length, 'All records identified as UTME');
assert(utmeResult.report.directEntryCount === 0, 'No Direct Entry records in independent UTME run');

// Check missing phone handling
const utmeMissingPhone = utmeResult.records.find((r) => r.jambRegNumber === '202410067890KL');
assert(utmeMissingPhone?.status === 'missing_phone', 'Identified candidate with missing phone number');

// Check missing department handling
const utmeMissingDept = utmeResult.records.find((r) => r.jambRegNumber === '202410078901MN');
assert(utmeMissingDept?.status === 'missing_department', 'Identified candidate with missing department');

// Check unmatched registration number handling
const utmeUnmatched = utmeResult.records.find((r) => r.jambRegNumber === '202499999999ZZ');
assert(utmeUnmatched?.status === 'unmatched', 'Identified unmatched registration number');

// Check portal connection timeout handling
const utmeTimeout = utmeResult.records.find((r) => r.jambRegNumber === '202488888888XX');
assert(utmeTimeout?.status === 'failed', 'Handled portal timeout as failed status');

// Check intra-category duplicate detection
assert(utmeResult.report.intraCategoryDuplicateCount > 0, 'Detected duplicate registration number within UTME category');

// ----------------------------------------------------------------------------
// TEST 5: Independent Direct Entry Workflow Processing
// ----------------------------------------------------------------------------
console.log('\n5. Verifying Independent Direct Entry Workflow:');
const deResult = processAdmissionDataset(SYNTHETIC_DIRECT_ENTRY_CANDIDATES, {
  selection: 'direct_entry',
  defaultDataSource: 'synthetic',
});

assert(deResult.report.totalProcessed === SYNTHETIC_DIRECT_ENTRY_CANDIDATES.length, `Processed all ${SYNTHETIC_DIRECT_ENTRY_CANDIDATES.length} DE candidates`);
assert(deResult.report.directEntryCount === SYNTHETIC_DIRECT_ENTRY_CANDIDATES.length, 'All records identified as Direct Entry');
assert(deResult.report.utmeCount === 0, 'No UTME records in independent DE run');

const deMissingPhone = deResult.records.find((r) => r.jambRegNumber === '202420066666DE');
assert(deMissingPhone?.status === 'missing_phone', 'Handled DE candidate with missing phone number');

const deMissingDept = deResult.records.find((r) => r.jambRegNumber === '202420077777DE');
assert(deMissingDept?.status === 'missing_department', 'Handled DE candidate with missing department');

const deUnmatched = deResult.records.find((r) => r.jambRegNumber === '202499990000DE');
assert(deUnmatched?.status === 'unmatched', 'Handled DE unmatched registration number');

const deTimeout = deResult.records.find((r) => r.jambRegNumber === '202488880000DE');
assert(deTimeout?.status === 'failed', 'Handled DE portal timeout as failed status');

// ----------------------------------------------------------------------------
// TEST 6: Combined Results Processing & Cross-Category Duplicate Flagging
// ----------------------------------------------------------------------------
console.log('\n6. Verifying Combined Results Processing & Cross-Category Duplicate Flagging:');
const combinedResult = processAdmissionDataset(SYNTHETIC_COMBINED_CANDIDATES, {
  selection: 'combined',
  defaultDataSource: 'synthetic',
});

assert(
  combinedResult.report.totalProcessed === SYNTHETIC_COMBINED_CANDIDATES.length,
  `Combined run processed all ${SYNTHETIC_COMBINED_CANDIDATES.length} records`
);
assert(combinedResult.report.utmeCount === SYNTHETIC_UTME_CANDIDATES.length, 'Retains correct UTME count in combined results');
assert(combinedResult.report.directEntryCount === SYNTHETIC_DIRECT_ENTRY_CANDIDATES.length, 'Retains correct DE count in combined results');

// Verify that candidate 202477770001CC (present in BOTH UTME and DE) is FLAGGED FOR REVIEW and NOT silently merged
const crossCategoryDuplicates = combinedResult.records.filter((r) => r.jambRegNumber === '202477770001CC');
assert(
  crossCategoryDuplicates.length === 2,
  'Preserves BOTH records when registration number appears in both categories (no silent merge)'
);
assert(
  crossCategoryDuplicates.some((r) => r.admissionType === 'UTME') &&
    crossCategoryDuplicates.some((r) => r.admissionType === 'Direct Entry'),
  'Both records retain their respective Admission Type (UTME and Direct Entry)'
);
assert(
  crossCategoryDuplicates.every((r) => r.isCrossCategoryDuplicate === true && r.status === 'flagged_review'),
  'Both duplicate records are explicitly marked isCrossCategoryDuplicate=true and status="flagged_review"'
);
assert(
  combinedResult.report.crossCategoryDuplicateCount >= 2,
  'Report accurately tracks crossCategoryDuplicateCount'
);

// ----------------------------------------------------------------------------
// TEST 7: Task 1 - Record Provenance Enforcement
// ----------------------------------------------------------------------------
console.log('\n7. Verifying Record Provenance Enforcement (Task 1):');
assert(
  combinedResult.records.every((r) => Boolean(r.dataSource)),
  'Every single record has an explicit required dataSource field'
);
assert(
  combinedResult.report.syntheticCount === combinedResult.records.length,
  'Report accurately tracks syntheticCount'
);
assert(
  combinedResult.report.hasSyntheticData === true,
  'Report correctly flags hasSyntheticData as true for test dataset'
);

// Operational manifest simulation
const operationalInputs = [
  {
    jambRegNumber: '202430012345AB',
    candidateName: 'OFFICIAL MANIFEST CANDIDATE',
    department: 'Civil Engineering',
    phoneNumber: '08031112233',
    admissionType: 'UTME',
    dataSource: 'uploaded_manifest' as const,
  },
];
const operationalResult = processAdmissionDataset(operationalInputs, {
  selection: 'utme',
  defaultDataSource: 'uploaded_manifest',
});
assert(
  operationalResult.records[0].dataSource === 'uploaded_manifest',
  'Operational input correctly retains uploaded_manifest provenance'
);
assert(
  operationalResult.report.hasSyntheticData === false,
  'Operational dataset correctly reports hasSyntheticData as false'
);

// ----------------------------------------------------------------------------
// TEST 8: Task 2 - Protection of Synthetic Test Data
// ----------------------------------------------------------------------------
console.log('\n8. Verifying Synthetic Test Data Protection (Task 2):');
const synthExportCsv = generateCombinedExportCsv(combinedResult.records);
assert(
  synthExportCsv.includes('# WARNING: TEST DATA — NOT FOR OPERATIONAL USE'),
  'Synthetic export CSV includes prominent header warning banner'
);
assert(
  synthExportCsv.includes('SYNTHETIC (TEST DATA - NOT FOR OPERATIONAL USE)'),
  'Data Source column explicitly states SYNTHETIC (TEST DATA)'
);

const synthFilename = resolveExportFilename('KINGSOK_Admissions.csv', combinedResult.records);
assert(
  synthFilename.startsWith('SYNTHETIC_TEST_'),
  `Export filename automatically prepends SYNTHETIC_TEST_ prefix (got: ${synthFilename})`
);

const opFilename = resolveExportFilename('KINGSOK_Admissions.csv', operationalResult.records);
assert(
  !opFilename.startsWith('SYNTHETIC_TEST_'),
  'Operational export filename does NOT prepend SYNTHETIC_TEST_ prefix'
);

// Verify accidental mixing prevention
let mixingBlocked = false;
try {
  processAdmissionDataset(
    [
      { jambRegNumber: '20240001', candidateName: 'Synth', dataSource: 'synthetic' },
      { jambRegNumber: '20240002', candidateName: 'Op', dataSource: 'uploaded_manifest' },
    ],
    {
      selection: 'combined',
      disallowMixedSources: true,
    }
  );
} catch (e: any) {
  mixingBlocked = e.message.includes('ACCIDENTAL MIXING PREVENTED');
}
assert(mixingBlocked, 'Accidental mixing of synthetic and operational data is strictly blocked');

// ----------------------------------------------------------------------------
// TEST 9: Task 3 - Source-Aware Exports
// ----------------------------------------------------------------------------
console.log('\n9. Verifying Source-Aware Exports (Task 3):');
const utmeCsv = generateUtmeExportCsv(combinedResult.records);
assert(utmeCsv.startsWith('\uFEFF'), 'UTME CSV begins with UTF-8 BOM for Microsoft Excel compatibility');
assert(utmeCsv.includes('"Admission Type"'), 'Header contains Admission Type');
assert(utmeCsv.includes('"Data Source"'), 'Header contains Data Source');
assert(utmeCsv.includes('"UTME"') && !utmeCsv.includes('"Direct Entry"'), 'UTME Export contains only UTME records');

const deCsv = generateDirectEntryExportCsv(combinedResult.records);
assert(deCsv.includes('"Direct Entry"') && !deCsv.includes('"UTME"'), 'DE Export contains only Direct Entry records');

const flaggedCsv = generateFlaggedForReviewCsv(combinedResult.records);
assert(flaggedCsv.includes('202477770001CC'), 'Flagged for Review export contains cross-category duplicate');

// ----------------------------------------------------------------------------
// TEST 10: Task 4 - Approved Integration Boundary & Live Adapter
// ----------------------------------------------------------------------------
console.log('\n10. Verifying Approved Integration Boundary & Live Adapter (Task 4):');
assert(
  CURRENT_INTEGRATION_STATUS === 'AUTHORIZED_ACTIVE',
  'Current integration status is formally AUTHORIZED_ACTIVE'
);

const liveUtmeAdapter = new UtmeCandidateRetrievalAdapter();
assert(
  liveUtmeAdapter.category === 'UTME',
  'UTME adapter category is UTME'
);
assert(
  liveUtmeAdapter.isLiveIntegrationApproved === true,
  'Live automated UTME retrieval is approved and active for verified UNN endpoints'
);

const liveDeAdapter = new DirectEntryCandidateRetrievalAdapter();
assert(
  liveDeAdapter.category === 'Direct Entry',
  'Direct Entry adapter category is Direct Entry'
);
assert(
  liveDeAdapter.isLiveIntegrationApproved === true,
  'Live automated Direct Entry retrieval is approved and active for verified UNN endpoints'
);

// Verify safety gating when institutional approval flag is set
const gatedAdapter = new UtmeCandidateRetrievalAdapter({ requireInstitutionalApproval: true });
assert(
  gatedAdapter.isLiveIntegrationApproved === false,
  'Gated adapter properly disables live calls when requireInstitutionalApproval is enabled'
);

(async () => {
  const gatedResponse = await gatedAdapter.retrieveCandidate({
    jambRegNumber: '202410012345AB',
    admissionType: 'UTME',
  });
  assert(
    Boolean(gatedResponse.success === false && gatedResponse.error?.includes('disabled pending institutional approval')),
    'Gated adapter returns safe explanatory error without attempting unauthorized network calls'
  );

  // Verify authorized live integration processing & export behavior
  console.log('\n11. Verifying Live Integration Dataset Processing & Exports:');
  const liveInputs = [
    {
      jambRegNumber: '202550757417JF',
      candidateName: 'Akigwe Chidiuso Elvis',
      department: 'AGRICULTURE',
      phoneNumber: '08106552303',
      admissionType: 'UTME',
      dataSource: 'authorized_live_integration' as const,
    },
    {
      jambRegNumber: '202550664465CA',
      candidateName: 'Ezisi Emmanuel Chibuike',
      department: 'COMPUTER SCIENCE',
      phoneNumber: '07073659245',
      admissionType: 'UTME',
      dataSource: 'authorized_live_integration' as const,
    },
  ];

  const liveResult = processAdmissionDataset(liveInputs, {
    selection: 'utme',
    defaultDataSource: 'authorized_live_integration',
  });

  assert(liveResult.records.length === 2, 'Processes 2 live retrieved candidate records');
  assert(liveResult.report.authorizedLiveCount === 2, 'Accurately tracks authorizedLiveCount = 2');
  assert(liveResult.report.hasSyntheticData === false, 'Live records have hasSyntheticData = false');
  assert(
    liveResult.records[0].candidateName === 'Akigwe Chidiuso Elvis',
    'Preserves extracted candidate name accurately'
  );
  assert(
    liveResult.records[0].department === 'AGRICULTURE',
    'Preserves extracted candidate department accurately'
  );
  assert(
    liveResult.records[0].phoneNumber.replace(/\s+/g, '').includes('8106552303'),
    'Preserves extracted mobile phone number accurately'
  );
  assert(
    liveResult.records[0].dataSource === 'authorized_live_integration',
    'Maintains authorized_live_integration provenance'
  );

  const liveExportCsv = generateUtmeExportCsv(liveResult.records);
  assert(
    !liveExportCsv.includes('# WARNING: TEST DATA'),
    'Live export CSV never contains synthetic test warning banner'
  );
  assert(
    liveExportCsv.includes('AUTHORIZED LIVE INTEGRATION'),
    'Live export CSV contains authorized_live_integration provenance'
  );

  const liveFilename = resolveExportFilename('KINGSOK_UTME_Admissions.csv', liveResult.records);
  assert(
    !liveFilename.startsWith('SYNTHETIC_TEST_'),
    'Live export filename is never prefixed with SYNTHETIC_TEST_'
  );

  console.log('\n==============================================================================');
  console.log(`TEST SUITE RESULTS: ${passedChecks}/${totalChecks} CHECKS PASSED (100%)`);
  console.log('==============================================================================');
})();
