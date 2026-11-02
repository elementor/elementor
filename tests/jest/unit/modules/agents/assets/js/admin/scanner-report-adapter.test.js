import {
	FIX_WITH_ANGIE,
	FIX_WITH_MANUAL,
	FIX_WITH_SEO,
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

const LLMS_TXT_EXISTS_FIX_DETAILS = 'Turn on Elementor Agent Ready > llms.txt.';
const AGENT_INSTRUCTION_MARKDOWN = '## Fix agent usage guidance\n\nAdd concrete suitable tasks and starting URLs.';

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
		{ id: 'sitemap', label: 'Sitemap exists', layer: 'accessibility', tier: 'required', status: 'pass', earned: 2, possible: 2, scorable: true, description: 'Sitemaps help agents.', message: 'Found sitemap.xml' },
		{
			id: 'llms-txt-exists',
			label: 'llms.txt exists',
			layer: 'accessibility',
			tier: 'required',
			status: 'fail',
			earned: 0,
			possible: 1,
			scorable: true,
			fix: 'Publish llms.txt.',
			fixBy: 'Agent Ready toggle',
			fixDetails: LLMS_TXT_EXISTS_FIX_DETAILS,
		},
		{
			id: 'llms-txt-formatting',
			label: 'llms.txt formatting',
			layer: 'accessibility',
			tier: 'recommended',
			status: 'partial',
			earned: 1,
			possible: 2,
			scorable: true,
			fix: 'Install an SEO plugin.',
			fixBy: 'SEO Plugin',
		},
		{
			id: 'unmapped-toggle',
			label: 'Unmapped toggle',
			layer: 'accessibility',
			tier: 'recommended',
			status: 'fail',
			earned: 0,
			possible: 1,
			scorable: true,
			fix: 'Turn it on.',
			fixBy: 'Agent Ready toggle',
		},
		{
			id: 'public-api',
			label: 'Public API',
			layer: 'usability',
			tier: 'required',
			status: 'fail',
			earned: 0,
			possible: 7,
			scorable: true,
			description: 'Agents need an API.',
			message: 'No API found',
			fix: 'Publish an API.',
			fixBy: 'Manual',
		},
		{
			id: 'agent-ua-markdown',
			label: 'Bot-UA markdown',
			layer: 'accessibility',
			tier: 'emerging',
			status: 'fail',
			earned: 0,
			possible: 0,
			scorable: false,
			fix: 'Serve markdown to bot user agents.',
			fixBy: 'Angie',
			fixDetails: 'PROMPT: "Serve markdown to bot user agents."',
		},
		{
			id: 'agent-instruction',
			label: 'Agent instruction',
			layer: 'accessibility',
			tier: 'recommended',
			status: 'fail',
			earned: 0,
			possible: 1,
			scorable: true,
			fix: 'Add agent usage guidance.',
			fixBy: 'Angie',
			fixDetails: AGENT_INSTRUCTION_MARKDOWN,
		},
		{
			id: 'webmcp-support',
			label: 'WebMCP support',
			layer: 'accessibility',
			tier: 'required',
			status: 'fail',
			earned: 0,
			possible: 2,
			scorable: true,
			fix: 'Turn on Agent browser tools in Agent Ready.',
			fixBy: 'Built In',
		},
		{ id: 'ai-catalog-published', label: 'AI Catalog', layer: 'discovery', tier: 'recommended', status: 'na', earned: 0, possible: 0, scorable: false },
	],
} );

describe( 'toScanResult', () => {
	it( 'maps layers to stages in order and marks an empty commerce stage as coming soon', () => {
		// Act
		const result = toScanResult( getReport() );

		// Assert
		expect( result.stages ).toEqual( [
			{ id: STAGE_REACH, earned: 0, total: 0 },
			{ id: STAGE_IDENTIFY, earned: 1, total: 6 },
			{ id: STAGE_ACT, earned: 0, total: 1 },
			{ id: STAGE_COMMERCE, earned: 0, total: 0, isComingSoon: true },
		] );
	} );

	it( 'counts passed over scorable checks per task, regardless of layer', () => {
		// Arrange
		const report = {
			...getReport(),
			checks: [
				{ id: 'robots-txt', label: 'robots.txt', layer: 'discovery', task: 'Find', status: 'pass', scorable: true },
				{ id: 'sitemap', label: 'Sitemap', layer: 'accessibility', task: 'Find', status: 'fail', scorable: true },
				{ id: 'bot-detection', label: 'Bots', layer: 'accessibility', task: 'Find', status: 'pass', scorable: false },
				{ id: 'ai-catalog', label: 'AI Catalog', layer: 'discovery', task: 'Find', status: 'na', scorable: false },
				{ id: 'json-ld', label: 'JSON-LD', layer: 'accessibility', task: 'Read', status: 'partial', scorable: true },
			],
		};

		// Act
		const [ reach, identify ] = toScanResult( report ).stages;

		// Assert
		expect( reach ).toEqual( { id: STAGE_REACH, earned: 1, total: 2 } );
		expect( identify ).toEqual( { id: STAGE_IDENTIFY, earned: 0, total: 1 } );
	} );

	it( 'uses the task for each row stage and falls back to the layer without one', () => {
		// Arrange
		const report = {
			...getReport(),
			checks: [
				{ id: 'sitemap', label: 'Sitemap', layer: 'accessibility', task: 'Find', status: 'fail', scorable: true },
				{ id: 'legacy', label: 'Legacy', layer: 'usability', status: 'fail', scorable: true },
			],
		};

		// Act
		const stages = toScanResult( report ).checks.map( ( check ) => check.stage );

		// Assert
		expect( stages ).toEqual( expect.arrayContaining( [ STAGE_REACH, STAGE_ACT ] ) );
	} );

	it( 'maps the task to a stage regardless of its casing', () => {
		// Arrange
		const report = {
			...getReport(),
			checks: [
				{ id: 'a', label: 'A', layer: 'usability', task: 'find', status: 'pass', scorable: true },
				{ id: 'b', label: 'B', layer: 'usability', task: 'READ', status: 'fail', scorable: true },
				{ id: 'c', label: 'C', layer: 'discovery', task: 'Act', status: 'pass', scorable: true },
			],
		};

		// Act
		const result = toScanResult( report );

		// Assert
		expect( result.stages ).toEqual( [
			{ id: STAGE_REACH, earned: 1, total: 1 },
			{ id: STAGE_IDENTIFY, earned: 0, total: 1 },
			{ id: STAGE_ACT, earned: 1, total: 1 },
			{ id: STAGE_COMMERCE, earned: 0, total: 0, isComingSoon: true },
		] );
		expect( result.checks[ 0 ].stage ).toBe( STAGE_IDENTIFY );
	} );

	it( 'splits checks into fixes and passing rows, ordered by score impact', () => {
		// Act
		const result = toScanResult( getReport() );

		// Assert
		expect( result.checks.map( ( check ) => check.id ) ).toEqual( [
			'public-api',
			'webmcp-support',
			'llms-txt-exists',
			'llms-txt-formatting',
			'unmapped-toggle',
			'agent-instruction',
			'agent-ua-markdown',
		] );
		expect( result.passingChecks ).toEqual( [ {
			id: 'sitemap',
			title: 'Sitemap exists',
			technicalName: 'Sitemap exists',
			description: 'Sitemaps help agents.',
			evidence: 'Found sitemap.xml',
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
			status: 'fail',
			stage: STAGE_ACT,
			evidence: 'No API found',
			explanation: { whatItMeans: 'Agents need an API.', howToFix: 'Publish an API.' },
			fixPrompt: '',
			fixWith: FIX_WITH_MANUAL,
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

	it( 'classifies fixBy and fixDetails into toggle, Angie, SEO search, or manual', () => {
		// Act
		const checks = toScanResult( getReport() ).checks;
		const byId = ( id ) => checks.find( ( check ) => check.id === id );

		// Assert
		expect( byId( 'agent-ua-markdown' ) ).toMatchObject( {
			fixWith: FIX_WITH_ANGIE,
			fixPrompt: 'Serve markdown to bot user agents.',
			explanation: { howToFix: 'Serve markdown to bot user agents.' },
			tier: 'emerging',
			priority: null,
			status: 'fail',
			resolvedByActivation: false,
			points: 0,
		} );
		expect( byId( 'llms-txt-formatting' ) ).toMatchObject( { status: 'partial' } );
		expect( byId( 'agent-instruction' ) ).toMatchObject( {
			fixWith: FIX_WITH_ANGIE,
			fixPrompt: AGENT_INSTRUCTION_MARKDOWN,
			explanation: { howToFix: AGENT_INSTRUCTION_MARKDOWN },
		} );
		expect( byId( 'llms-txt-exists' ) ).toMatchObject( {
			fixWith: FIX_WITH_TOGGLE,
			fixPrompt: '',
			explanation: { howToFix: LLMS_TXT_EXISTS_FIX_DETAILS },
		} );
		expect( byId( 'llms-txt-formatting' ) ).toMatchObject( { fixWith: FIX_WITH_SEO, priority: PRIORITY_RECOMMENDED } );
		expect( byId( 'public-api' ) ).toMatchObject( { fixWith: FIX_WITH_MANUAL, resolvedByActivation: false } );
		expect( byId( 'unmapped-toggle' ) ).toMatchObject( { fixWith: FIX_WITH_MANUAL } );
		expect( byId( 'webmcp-support' ) ).toMatchObject( {
			fixWith: FIX_WITH_TOGGLE,
			fixPrompt: '',
			explanation: { howToFix: 'Turn on Agent browser tools in Agent Ready.' },
		} );
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

	it( 'rounds fractional readiness scores to whole numbers', () => {
		// Act
		const result = toScanResult( { ...getReport(), score: 64.6 } );

		// Assert
		expect( result.score ).toBe( 65 );
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
