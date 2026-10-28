/**
 * KINGSOK Admission Intelligence System - Workflow Configurations
 * Verified portal navigation, form handling, extraction rules, and policies
 * for both UTME and Direct Entry (DE) admissions.
 *
 * Grounded directly on the UNN SM Core Portal SPA bundle inspection:
 * - Base Domain: https://unnportal.unn.edu.ng
 * - Backend API Host: https://schmgrunn.azurewebsites.net/api
 */

import { AdmissionWorkflowConfig } from './types';

/**
 * Verified UTME / Post-UTME Workflow Configuration
 * Official page: https://unnportal.unn.edu.ng/putme_application_details
 */
export const UTME_WORKFLOW_CONFIG: AdmissionWorkflowConfig = {
  category: 'UTME',
  name: 'UNN Post-UTME Admission Screening Workflow',
  officialPortalUrl: 'https://unnportal.unn.edu.ng/putme_application_details',
  loginPath: '/putme_login',
  targetPath: '/putme_application_details',
  backendApiEndpoint: 'https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form',
  formTitle: 'ADMISSION SCREENING APPLICATION FORM',
  regNumberFieldId: 'reg_no',
  regNumberFieldName: 'jambRegNumber',
  regNumberPlaceholder: 'Enter your JAMB registration number',
  // Standard JAMB Reg Numbers: 10 or 12 alphanumeric characters (e.g., 202412345678AB or 23412345AB)
  expectedRegNumberPattern: /^(?:20\d{2}|[0-9]{8,10})[A-Za-z]{2}$/i,
  requestThrottleMs: 3500, // Safe throttle to avoid Netlify / Azure App Service DDoS triggers
  allowBulkAutomatedScraping: false,
  officialIntegrationRequiredNote:
    'UNN SM Core Portal protects candidate records behind Netlify Edge and Azure API throttling. ' +
    'Automated bulk mass scraping without institutional authorization is strictly blocked by UNN infrastructure. ' +
    'Individual verification is supported via official application endpoints, while mass processing requires ' +
    'the institutional CSV/Excel admission upload manifest approved by UNN Registry.',
};

/**
 * Verified Direct Entry (DE) Workflow Configuration
 * Official page: https://unnportal.unn.edu.ng/ScrenningApplication.aspx
 */
export const DIRECT_ENTRY_WORKFLOW_CONFIG: AdmissionWorkflowConfig = {
  category: 'Direct Entry',
  name: 'UNN Direct Entry (DE) Admission Screening Workflow',
  officialPortalUrl: 'https://unnportal.unn.edu.ng/ScrenningApplication.aspx',
  loginPath: '/direct_entry_login',
  // Verified from UNN frontend router: Direct Entry directs to /direct_entry_application/preview (if completed)
  // or /direct_entry_application (if awaiting completion). Direct Entry does NOT use /putme_application_details.
  targetPath: '/direct_entry_application/preview',
  backendApiEndpoint: 'https://schmgrunn.azurewebsites.net/api/DirectEntryApplication/load-direct-entry-application-form',
  formTitle: 'DIRECT ENTRY APPLICATION FORM',
  regNumberFieldId: 'reg_no',
  regNumberFieldName: 'jambRegNumber',
  regNumberPlaceholder: 'Enter your JAMB registration number',
  // Direct Entry JAMB numbers: Alphanumeric format issued with Direct Entry ePIN
  expectedRegNumberPattern: /^(?:20\d{2}|[0-9]{8,10})[A-Za-z]{2}$/i,
  requestThrottleMs: 3500,
  allowBulkAutomatedScraping: false,
  officialIntegrationRequiredNote:
    'UNN Direct Entry screening forms require Direct Entry ePIN verification. ' +
    'The Direct Entry Application Form is accessible via /direct_entry_login with target route ' +
    '/direct_entry_application/preview. Automated bulk scraping is restricted by UNN Azure rate-limiting; ' +
    'official registry batch exports or verified API credentials are required for mass list integration.',
};

/**
 * Retrieve configuration by admission category
 */
export function getWorkflowConfig(category: 'UTME' | 'Direct Entry'): AdmissionWorkflowConfig {
  return category === 'UTME' ? UTME_WORKFLOW_CONFIG : DIRECT_ENTRY_WORKFLOW_CONFIG;
}
