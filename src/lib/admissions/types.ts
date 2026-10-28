/**
 * KINGSOK Admission Intelligence System - Core Types
 * Supports both UTME / Post-UTME and Direct Entry (DE) admissions.
 *
 * Authorized Common Data Fields:
 * 1. JAMB Registration Number
 * 2. Candidate Full Name
 * 3. Department
 * 4. Phone Number
 * 5. Admission Type
 * 6. Processing Status
 * 7. Data Source (Mandatory Provenance)
 */

export type AdmissionCategory = 'UTME' | 'Direct Entry';

export type AdmissionSelection = 'utme' | 'direct_entry' | 'combined';

export type AdmissionProcessingStatus =
  | 'success'             // Candidate verified and all authorized fields populated
  | 'pending'             // Queued for retrieval/validation
  | 'missing_phone'       // Record retrieved, but phone number was empty or unlisted
  | 'missing_department'  // Record retrieved, but department was missing
  | 'unmatched'           // Registration number not found on UNN portal / admission list
  | 'flagged_review'      // Candidate appears in both UTME and DE, or intra-list duplicate
  | 'failed';             // Network timeout or portal load failure

/**
 * Task 1: Required Data Source Provenance
 * Every admission record MUST explicitly declare its provenance.
 * Unknown or unverified sources are strictly blocked from being marked as verified.
 */
export type RecordDataSource =
  | 'synthetic'                  // Synthetic benchmark / sample data for testing
  | 'uploaded_manifest'          // User/Registry uploaded CSV or Excel manifest
  | 'authorized_live_integration'; // Retrieved through official, authorized portal integration

export interface CandidateAdmissionRecord {
  id: string;
  jambRegNumber: string;
  candidateName: string;
  department: string;
  phoneNumber: string;
  normalizedPhone?: string;
  admissionType: AdmissionCategory;
  status: AdmissionProcessingStatus;
  statusMessage: string;
  dataSource: RecordDataSource; // Mandatory provenance
  portalSource: string;
  isDuplicateWithinCategory: boolean;
  isCrossCategoryDuplicate: boolean;
  reviewReason?: string;
  retrievedAt: string;
  rawSourceRow?: number;
}

export interface AdmissionWorkflowConfig {
  category: AdmissionCategory;
  name: string;
  officialPortalUrl: string;
  loginPath: string;
  targetPath: string;
  backendApiEndpoint: string;
  formTitle: string;
  regNumberFieldId: string;
  regNumberFieldName: string;
  regNumberPlaceholder: string;
  expectedRegNumberPattern: RegExp;
  requestThrottleMs: number;
  allowBulkAutomatedScraping: boolean;
  officialIntegrationRequiredNote: string;
}

export interface AdmissionProcessingReport {
  selection: AdmissionSelection;
  totalProcessed: number;
  utmeCount: number;
  directEntryCount: number;
  successCount: number;
  missingPhoneCount: number;
  missingDeptCount: number;
  unmatchedCount: number;
  flaggedReviewCount: number;
  failedCount: number;
  crossCategoryDuplicateCount: number;
  intraCategoryDuplicateCount: number;
  // Data Source Provenance Breakdown
  syntheticCount: number;
  uploadedManifestCount: number;
  authorizedLiveCount: number;
  hasSyntheticData: boolean;
  processingTimeMs: number;
  timestamp: string;
}

export interface AdmissionQueueItem {
  id: string;
  jambRegNumber: string;
  targetCategory: AdmissionCategory;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  retries: number;
  error?: string;
}

/**
 * Task 4: Approved Integration Boundary Interfaces
 * Shared normalized retrieval interfaces for UTME and Direct Entry.
 */
export interface CandidateRetrievalRequest {
  jambRegNumber: string;
  admissionType: AdmissionCategory;
  sessionYear?: string;
}

export interface CandidateRetrievalResponse {
  success: boolean;
  jambRegNumber: string;
  candidateName?: string;
  department?: string;
  phoneNumber?: string;
  admissionType: AdmissionCategory;
  dataSource: RecordDataSource;
  portalUrl: string;
  rawStatusCode?: number;
  error?: string;
  isFormCompleted?: boolean;
}

export interface IUtmeCandidateRetrievalAdapter {
  readonly category: 'UTME';
  readonly isLiveIntegrationApproved: boolean;
  retrieveCandidate(request: CandidateRetrievalRequest): Promise<CandidateRetrievalResponse>;
}

export interface IDirectEntryCandidateRetrievalAdapter {
  readonly category: 'Direct Entry';
  readonly isLiveIntegrationApproved: boolean;
  retrieveCandidate(request: CandidateRetrievalRequest): Promise<CandidateRetrievalResponse>;
}
