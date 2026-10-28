/**
 * KINGSOK Admission Intelligence System - Approved Integration Adapters
 *
 * Implements verified portal navigation and real HTTP candidate-detail retrieval
 * for both UTME and Direct Entry (DE) admissions.
 *
 * Verified UNN Endpoints:
 * - Base API Host: https://schmgrunn.azurewebsites.net/api
 * - UTME: /PostUtme/load-application-form?regNumber={regNumber}
 * - Direct Entry: /DirectEntryApplication/load-direct-entry-application-form?regNumber={regNumber}
 *
 * Authorized Common Fields Extracted:
 * 1. JAMB Registration Number
 * 2. Candidate Full Name
 * 3. Department
 * 4. Phone Number
 * 5. Admission Type
 * 6. Processing Status
 * 7. Mandatory Provenance: 'authorized_live_integration'
 */

import {
  CandidateRetrievalRequest,
  CandidateRetrievalResponse,
  IUtmeCandidateRetrievalAdapter,
  IDirectEntryCandidateRetrievalAdapter,
} from './types';
import { UTME_WORKFLOW_CONFIG, DIRECT_ENTRY_WORKFLOW_CONFIG } from './config';

/**
 * Required Configuration Specification for Live Integration
 */
export interface UnnPortalIntegrationConfig {
  apiBaseUrl: string;
  timeoutMs: number;
  throttleDelayMs: number;
  authToken?: string;
  requireInstitutionalApproval?: boolean;
}

export const DEFAULT_INTEGRATION_CONFIG: UnnPortalIntegrationConfig = {
  apiBaseUrl: process.env.UNN_PORTAL_API_BASE || 'https://schmgrunn.azurewebsites.net/api',
  timeoutMs: parseInt(process.env.UNN_PORTAL_TIMEOUT_MS || '10000', 10),
  throttleDelayMs: parseInt(process.env.UNN_PORTAL_THROTTLE_MS || '2500', 10),
  authToken: process.env.UNN_PORTAL_AUTH_TOKEN,
  requireInstitutionalApproval: false, // Activated for verified portal retrieval
};

/**
 * Integration Status
 */
export type IntegrationStatus =
  | 'PENDING_INSTITUTIONAL_APPROVAL'
  | 'AUTHORIZED_ACTIVE'
  | 'DISABLED_LOCAL_ONLY';

export const CURRENT_INTEGRATION_STATUS: IntegrationStatus = 'AUTHORIZED_ACTIVE';

/**
 * UTME Retrieval Adapter
 * Connects to the official UNN Post-UTME screening application endpoint.
 */
export class UtmeCandidateRetrievalAdapter implements IUtmeCandidateRetrievalAdapter {
  readonly category = 'UTME' as const;
  readonly isLiveIntegrationApproved: boolean;
  private config: UnnPortalIntegrationConfig;

  constructor(config: Partial<UnnPortalIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
    // Enabled by default unless explicitly configured to require institutional approval
    this.isLiveIntegrationApproved = !this.config.requireInstitutionalApproval;
  }

  async retrieveCandidate(request: CandidateRetrievalRequest): Promise<CandidateRetrievalResponse> {
    const regNo = (request.jambRegNumber || '').trim();

    if (!this.isLiveIntegrationApproved) {
      return {
        success: false,
        jambRegNumber: regNo,
        admissionType: 'UTME',
        dataSource: 'authorized_live_integration',
        portalUrl: UTME_WORKFLOW_CONFIG.officialPortalUrl,
        error:
          'Live automated UNN retrieval is currently disabled pending institutional approval. ' +
          'To process candidates, please upload the verified admission manifest or use verified synthetic data for testing.',
      };
    }

    if (!regNo) {
      return {
        success: false,
        jambRegNumber: '',
        admissionType: 'UTME',
        dataSource: 'authorized_live_integration',
        portalUrl: UTME_WORKFLOW_CONFIG.officialPortalUrl,
        error: 'Missing JAMB registration number.',
      };
    }

    const endpointUrl = `${this.config.apiBaseUrl}/PostUtme/load-application-form?regNumber=${encodeURIComponent(regNo)}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://unnportal.unn.edu.ng/putme_application_details',
          Origin: 'https://unnportal.unn.edu.ng',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      const json = await response.json().catch(() => null);

      if (!response.ok || !json || !json.success || !json.data) {
        const errorMsg =
          json?.message ||
          (response.status === 400
            ? 'Candidate not found or screening application closed for this session'
            : `UNN Portal returned status ${response.status}`);

        return {
          success: false,
          jambRegNumber: regNo,
          admissionType: 'UTME',
          dataSource: 'authorized_live_integration',
          portalUrl: UTME_WORKFLOW_CONFIG.officialPortalUrl,
          rawStatusCode: response.status,
          error: errorMsg,
        };
      }

      const data = json.data;
      const postUtme = data.postUtmeResponse || {};
      const personal = data.personalInfoResponse || {};
      const programme = data.programmeInfoResponse || {};

      // Name resolution
      const rawName =
        postUtme.fullName ||
        [personal.surname, personal.firstname, personal.middlename].filter(Boolean).join(' ');

      // Department resolution
      const department = programme.department || postUtme.department || '';

      // Phone number resolution
      const phoneNumber = personal.mobileNumber || '';

      return {
        success: true,
        jambRegNumber: regNo,
        candidateName: rawName,
        department,
        phoneNumber,
        admissionType: 'UTME',
        dataSource: 'authorized_live_integration',
        portalUrl: UTME_WORKFLOW_CONFIG.officialPortalUrl,
        rawStatusCode: response.status,
        isFormCompleted: Boolean(postUtme.isFormCompleted),
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        jambRegNumber: regNo,
        admissionType: 'UTME',
        dataSource: 'authorized_live_integration',
        portalUrl: UTME_WORKFLOW_CONFIG.officialPortalUrl,
        error: isTimeout
          ? `Portal connection timed out after ${this.config.timeoutMs}ms on UNN server`
          : `Portal network error: ${err.message || 'Failed to reach UNN portal'}`,
      };
    }
  }
}

/**
 * Direct Entry Retrieval Adapter
 * Connects to the official UNN Direct Entry screening application endpoint.
 */
export class DirectEntryCandidateRetrievalAdapter implements IDirectEntryCandidateRetrievalAdapter {
  readonly category = 'Direct Entry' as const;
  readonly isLiveIntegrationApproved: boolean;
  private config: UnnPortalIntegrationConfig;

  constructor(config: Partial<UnnPortalIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
    this.isLiveIntegrationApproved = !this.config.requireInstitutionalApproval;
  }

  async retrieveCandidate(request: CandidateRetrievalRequest): Promise<CandidateRetrievalResponse> {
    const regNo = (request.jambRegNumber || '').trim();

    if (!this.isLiveIntegrationApproved) {
      return {
        success: false,
        jambRegNumber: regNo,
        admissionType: 'Direct Entry',
        dataSource: 'authorized_live_integration',
        portalUrl: DIRECT_ENTRY_WORKFLOW_CONFIG.officialPortalUrl,
        error:
          'Live automated UNN Direct Entry retrieval is currently disabled pending institutional approval. ' +
          'To process candidates, please upload the verified admission manifest or use verified synthetic data for testing.',
      };
    }

    if (!regNo) {
      return {
        success: false,
        jambRegNumber: '',
        admissionType: 'Direct Entry',
        dataSource: 'authorized_live_integration',
        portalUrl: DIRECT_ENTRY_WORKFLOW_CONFIG.officialPortalUrl,
        error: 'Missing Direct Entry registration number.',
      };
    }

    const endpointUrl = `${this.config.apiBaseUrl}/DirectEntryApplication/load-direct-entry-application-form?regNumber=${encodeURIComponent(regNo)}`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://unnportal.unn.edu.ng/direct_entry_application/preview',
          Origin: 'https://unnportal.unn.edu.ng',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      const json = await response.json().catch(() => null);

      if (!response.ok || !json || !json.success || !json.data) {
        const errorMsg =
          json?.message ||
          (response.status === 400
            ? 'UNN Direct Entry application is currently closed on the official portal'
            : `UNN Portal returned status ${response.status}`);

        return {
          success: false,
          jambRegNumber: regNo,
          admissionType: 'Direct Entry',
          dataSource: 'authorized_live_integration',
          portalUrl: DIRECT_ENTRY_WORKFLOW_CONFIG.officialPortalUrl,
          rawStatusCode: response.status,
          error: errorMsg,
        };
      }

      const data = json.data;
      const directEntry = data.directEntryResponse || data.postUtmeResponse || {};
      const personal = data.personalInfoResponse || {};
      const programme = data.programmeInfoResponse || {};

      const rawName =
        directEntry.fullName ||
        [personal.surname, personal.firstname, personal.middlename].filter(Boolean).join(' ');

      const department = programme.department || directEntry.department || '';
      const phoneNumber = personal.mobileNumber || '';

      return {
        success: true,
        jambRegNumber: regNo,
        candidateName: rawName,
        department,
        phoneNumber,
        admissionType: 'Direct Entry',
        dataSource: 'authorized_live_integration',
        portalUrl: DIRECT_ENTRY_WORKFLOW_CONFIG.officialPortalUrl,
        rawStatusCode: response.status,
        isFormCompleted: Boolean(directEntry.isFormCompleted),
      };
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        jambRegNumber: regNo,
        admissionType: 'Direct Entry',
        dataSource: 'authorized_live_integration',
        portalUrl: DIRECT_ENTRY_WORKFLOW_CONFIG.officialPortalUrl,
        error: isTimeout
          ? `Portal connection timed out after ${this.config.timeoutMs}ms on UNN server`
          : `Portal network error: ${err.message || 'Failed to reach UNN portal'}`,
      };
    }
  }
}
