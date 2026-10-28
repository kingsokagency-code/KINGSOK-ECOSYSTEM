import { NextRequest, NextResponse } from 'next/server';
import {
  UtmeCandidateRetrievalAdapter,
  DirectEntryCandidateRetrievalAdapter,
} from '@/lib/admissions/retrievalAdapters';
import {
  processAdmissionDataset,
  RawCandidateInput,
} from '@/lib/admissions/processor';
import { AdmissionSelection } from '@/lib/admissions/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      regNumbers = [],
      admissionType = 'UTME',
      selection = 'utme',
      throttleDelayMs = 2000,
    } = body as {
      regNumbers: string[];
      admissionType?: 'UTME' | 'Direct Entry' | 'combined';
      selection?: AdmissionSelection;
      throttleDelayMs?: number;
    };

    if (!Array.isArray(regNumbers) || regNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of JAMB registration numbers to retrieve.' },
        { status: 400 }
      );
    }

    // Safety limit to prevent unbounded scraping
    if (regNumbers.length > 100) {
      return NextResponse.json(
        {
          error:
            'Batch limit exceeded: Maximum 100 registration numbers can be verified in a single live request to respect UNN server capacity.',
        },
        { status: 400 }
      );
    }

    const utmeAdapter = new UtmeCandidateRetrievalAdapter();
    const deAdapter = new DirectEntryCandidateRetrievalAdapter();

    const rawInputs: RawCandidateInput[] = [];
    const individualResults: any[] = [];

    for (let i = 0; i < regNumbers.length; i++) {
      const regNo = (regNumbers[i] || '').trim();
      if (!regNo) continue;

      const isDE =
        admissionType === 'Direct Entry' ||
        (admissionType === 'combined' && regNo.toUpperCase().includes('DE'));

      const adapter = isDE ? deAdapter : utmeAdapter;
      const category = isDE ? 'Direct Entry' : 'UTME';

      const response = await adapter.retrieveCandidate({
        jambRegNumber: regNo,
        admissionType: category,
      });

      individualResults.push(response);

      if (response.success) {
        rawInputs.push({
          jambRegNumber: response.jambRegNumber,
          candidateName: response.candidateName,
          department: response.department,
          phoneNumber: response.phoneNumber,
          admissionType: response.admissionType,
          dataSource: 'authorized_live_integration',
        });
      } else {
        const isTimeout = Boolean(response.error?.includes('timed out'));
        rawInputs.push({
          jambRegNumber: response.jambRegNumber,
          candidateName: response.candidateName || 'UNMATCHED CANDIDATE',
          department: response.department || '',
          phoneNumber: response.phoneNumber || '',
          admissionType: response.admissionType,
          dataSource: 'authorized_live_integration',
          simulatedError: isTimeout ? 'timeout' : 'unmatched',
        });
      }

      // Throttle between live calls if there are subsequent records
      if (i < regNumbers.length - 1 && throttleDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, throttleDelayMs));
      }
    }

    // Run through the canonical processor to enforce provenance, duplicate detection, and category filtering
    const effectiveSelection: AdmissionSelection =
      selection || (admissionType === 'Direct Entry' ? 'direct_entry' : admissionType === 'combined' ? 'combined' : 'utme');

    const processed = processAdmissionDataset(rawInputs, {
      selection: effectiveSelection,
      defaultDataSource: 'authorized_live_integration',
      disallowMixedSources: false,
    });

    return NextResponse.json({
      success: true,
      count: processed.records.length,
      selection: effectiveSelection,
      records: processed.records,
      report: processed.report,
      rawResponses: individualResults,
    });
  } catch (error: any) {
    console.error('Admission live retrieval error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during live candidate retrieval.' },
      { status: 500 }
    );
  }
}
