import {
	FIX_WITH_ANGIE,
	FIX_WITH_LINK,
	FIX_WITH_TOGGLE,
	OUTSIDE_SCAN_STATUS_FAILED,
	OUTSIDE_SCAN_STATUS_OK,
	PRIORITY_RECOMMENDED,
	PRIORITY_REQUIRED,
	STAGE_ACT,
	STAGE_COMMERCE,
	STAGE_IDENTIFY,
	STAGE_REACH,
} from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';
import * as checkCopy from 'elementor/modules/agents/assets/js/admin/scanner/scanner-check-copy';
import { toFailedScanResult, toScanResult } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-report-adapter';

const RETRY_AT = '2026-10-21T10:00:00Z';

const getReport = () => ( {
	score: 80,
	scannedAt: '2026-10-21T09:55:00Z',
	retryAt: '2026-10-21T09:58:00Z',
	layers: {
		discovery: { weight: 20, earned: 4, possible: 5 },
		accessibility: { weight: 30, earned: 30, possible: 40 },
		usability: { weight: 40, earned: 30, possible: 40 },
		payments: { weight: 10, earned: 0, possible: 0 },
	},
	checks: [
		{ id: 'sitemap', label: 'Sitemap exists', layer: 'accessibility', tier: 'required', status: 'pass', earned: 2, possible: 2, scorable: true },
		{ id: 'llms-txt-exists', label: 'llms.txt exists', layer: 'accessibility', tier: 'required', status: 'fail', earned: 0, possible: 1, scorable: true, fix: 'Add llms.txt.' },
		{ id: 'llms-txt-formatting', label: 'llms.txt formatting', layer: 'accessibility', tier: 'recommended', status: 'partial', earned: 1, possible: 2, scorable: true, fix: 'Format it.' },
		{ id: 'public-api', label: 'Public API', layer: 'usability', tier: 'required', status: 'fail', earned: 0, possible: 7, scorable: true, description: 'Agents need an API.', message: 'No API found', fix: 'Publish an API.' },
		{ id: 'agent-ua-markdown', label: 'Bot-UA markdown', layer: 'accessibility', tier: 'emerging', status: 'fail', earned: 0, possible: 0, scorable: false },
		{ id: 'ai-catalog-published', label: 'AI Catalog', layer: 'discovery', tier: 'recommended', status: 'na', earned: 0, possible: 0, scorable: false },
	],
} );

describe( 'toScanResult', () => {
	it( 'maps layers to stages in order and marks an empty commerce stage as coming soon', () => {
		// Act
		const result = toScanResult( getReport() );

		// Assert
		expect( result.stages ).toEqual( [
			{ id: STAGE_REACH, earned: 4, total: 5 },
			{ id: STAGE_IDENTIFY, earned: 30, total: 40 },
			{ id: STAGE_ACT, earned: 30, total: 40 },
			{ id: STAGE_COMMERCE, earned: 0, total: 0, isComingSoon: true },
		] );
	} );

	it( 'splits checks into fixes and passing rows, ordered by score impact', () => {
		// Act
		const result = toScanResult( getReport() );

		// Assert
		expect( result.checks.map( ( check ) => check.id ) ).toEqual( [ 'public-api', 'llms-txt-exists', 'llms-txt-formatting', 'agent-ua-markdown' ] );
		expect( result.passingChecks ).toEqual( [ {
			id: 'sitemap',
			title: 'Sitemap exists',
			technicalName: 'Sitemap exists',
			stage: STAGE_IDENTIFY,
			points: 2,
		} ] );
	} );

	it( 'weights check points by their layer share of the score', () => {
		// Act
		const [ publicApi ] = toScanResult( getReport() ).checks;

		// Assert
		expect( publicApi ).toMatchObject( {
			title: 'Public API',
			technicalName: 'Public API',
			points: 8,
			priority: PRIORITY_REQUIRED,
			stage: STAGE_ACT,
			evidence: 'No API found',
			explanation: { whatItMeans: 'Agents need an API.', howToFix: 'Publish an API.' },
			fixPrompt: 'Publish an API.',
		} );
	} );

	it( 'uses a mapped user-facing title and keeps the technical name', () => {
		// Arrange
		const MAPPED_TITLE = 'Mapped public API title';
		const spy = jest.spyOn( checkCopy, 'getCheckTitle' ).mockImplementation( ( checkId, label, isPassing ) => (
			'public-api' === checkId && ! isPassing ? MAPPED_TITLE : label
		) );

		// Act
		const [ publicApi ] = toScanResult( getReport() ).checks;

		// Assert
		expect( publicApi ).toMatchObject( {
			title: MAPPED_TITLE,
			technicalName: 'Public API',
		} );

		spy.mockRestore();
	} );

	it( 'uses the Agent Ready fix for module-covered checks and Angie for the rest', () => {
		// Act
		const checks = toScanResult( getReport() ).checks;
		const byId = ( id ) => checks.find( ( check ) => check.id === id );

		// Assert
		expect( byId( 'llms-txt-exists' ) ).toMatchObject( { fixWith: FIX_WITH_TOGGLE, isLocal: true, resolvedByActivation: true } );
		expect( byId( 'llms-txt-formatting' ) ).toMatchObject( { fixWith: FIX_WITH_LINK, priority: PRIORITY_RECOMMENDED } );
		expect( byId( 'agent-ua-markdown' ) ).toMatchObject( { fixWith: FIX_WITH_ANGIE, isLocal: false, points: 0 } );
	} );

	it( 'prefers the retryAt returned by the endpoint over the stored report', () => {
		// Act
		const result = toScanResult( getReport(), RETRY_AT );

		// Assert
		expect( result ).toMatchObject( {
			score: 80,
			ranAt: '2026-10-21T09:55:00Z',
			retryAt: RETRY_AT,
			outsideScan: { status: OUTSIDE_SCAN_STATUS_OK, reason: null },
		} );
	} );
} );

describe( 'toFailedScanResult', () => {
	it( 'marks the outside scan as failed with the given reason', () => {
		// Act
		const result = toFailedScanResult( 'local' );

		// Assert
		expect( result.score ).toBeNull();
		expect( result.outsideScan ).toEqual( { status: OUTSIDE_SCAN_STATUS_FAILED, reason: 'local' } );
	} );
} );
