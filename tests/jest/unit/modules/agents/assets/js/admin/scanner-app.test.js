import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { ScannerApp } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-app';
import {
	FIX_WITH_TOGGLE,
	HTTP_TOO_MANY_REQUESTS,
	PRIORITY_REQUIRED,
	SCAN_FAILURE_REASON_BLOCKED,
	SCAN_FAILURE_REASON_LOCAL,
	SCORE_TIER_HIGH,
	SCORE_TIER_LOW,
	SCORE_TIER_MID,
	SCANNER_MOTION,
	STAGE_REACH,
} from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';
import { getMockScanResult, getProgressScanGateDurationMs } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-mock-data';
import { toFailedScanResult } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-report-adapter';
import { getScoreTier, getStageHealthTier, getStagePassPercent } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-score';

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	activateAgentsReady: jest.fn(),
	applyCheckFix: jest.fn(),
	runSiteScan: jest.fn(),
	saveAgentReadySettings: jest.fn(),
	undoCheckFix: jest.fn(),
} ) );

import { activateAgentsReady, applyCheckFix, runSiteScan, saveAgentReadySettings, undoCheckFix } from 'elementor/modules/agents/assets/js/admin/api';

const HTTP_UNPROCESSABLE_ENTITY = 422;
const SITE_DOMAIN = 'example.com';
const AGENT_ACCESS_URL = 'https://example.com/wp-admin/admin.php?page=elementor-agent-access';
const SCAN_DURATION_MS = getProgressScanGateDurationMs();

const advanceTimers = async ( ms ) => {
	await act( async () => {
		await jest.advanceTimersByTimeAsync( ms );
	} );
};

// Lets a mocked save settle inside act(), so its `.finally()` state update doesn't land after the test.
const flushPendingSave = async () => {
	await act( async () => {
		await Promise.resolve();
	} );
};

// In jsdom, getComputedStyle walks every stylesheet rule for each element (and its ancestors), and
// getByRole calls it for every candidate. The ~575 Emotion rules @elementor/ui injects made a single
// getByRole take 0.7–2.8 s here, so tests ran 3–12 s and hit the 5 s timeout on slow runners.
// No assertion in this file depends on stylesheet CSS (hidden content uses attributes or unmounting),
// so this file drops Emotion's inserted rules.
const originalInsertRule = CSSStyleSheet.prototype.insertRule;

beforeAll( () => {
	CSSStyleSheet.prototype.insertRule = () => 0;
} );

afterAll( () => {
	CSSStyleSheet.prototype.insertRule = originalInsertRule;
} );

const LAST_REPORT_SCORE = 72;
const RETRY_AT = '2026-10-21T10:00:00Z';
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;
const COOLDOWN_HOURS = 2;
const COOLDOWN_MINUTES = 15;
const COOLDOWN_REMAINING_MS = ( ( COOLDOWN_HOURS * MINUTES_PER_HOUR ) + COOLDOWN_MINUTES ) * MS_PER_MINUTE;
const SHORT_COOLDOWN_MS = 30 * MS_PER_SECOND;

const getLastReport = () => ( {
	score: LAST_REPORT_SCORE,
	scannedAt: '2026-10-21T09:55:00Z',
	retryAt: RETRY_AT,
	layers: {
		discovery: { weight: 20, earned: 4, possible: 5 },
		accessibility: { weight: 30, earned: 30, possible: 40 },
		usability: { weight: 40, earned: 30, possible: 40 },
		payments: { weight: 10, earned: 0, possible: 0 },
	},
	checks: [
		{ id: 'sitemap', label: 'Sitemap exists', layer: 'accessibility', tier: 'required', status: 'pass', earned: 2, possible: 2, scorable: true },
		{ id: 'json-ld', label: 'JSON-LD structured data', layer: 'accessibility', tier: 'required', status: 'fail', earned: 0, possible: 4, scorable: true, fix: 'Add JSON-LD.' },
	],
} );

const getFailedScanResult = () => toFailedScanResult( SCAN_FAILURE_REASON_BLOCKED );

const agentAccessOnConfigs = {
	llmsConfig: { enabled: true },
	markdownConfig: { enabled: true },
	botAccessConfig: { enabled: true },
	agentDiscoveryConfig: { enabled: false },
	browserToolsConfig: { enabled: false },
};

const activatedProps = { isActivated: true, ...agentAccessOnConfigs };

const agentAccessOffConfigs = {
	llmsConfig: { enabled: false },
	markdownConfig: { enabled: false },
	botAccessConfig: { enabled: false },
	agentDiscoveryConfig: { enabled: false },
	browserToolsConfig: { enabled: false },
};

const renderScanner = ( props = {} ) => render( <ScannerApp siteDomain={ SITE_DOMAIN } agentAccessUrl={ AGENT_ACCESS_URL } { ...props } /> );

const runFirstScan = async ( props = {} ) => {
	renderScanner( props );
	fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
	await advanceTimers( SCAN_DURATION_MS );
};

const showFixChecks = () => fireEvent.click( screen.getByRole( 'button', { name: 'Show failed checks' } ) );

const showPassedChecks = () => fireEvent.click( screen.getByRole( 'button', { name: 'Show passed checks' } ) );

const expectNextScanLabelDisabled = ( label ) => {
	const buttons = screen.getAllByRole( 'button', { name: label } );

	expect( buttons.every( ( button ) => button.disabled ) ).toBe( true );
};

const getScoreRing = ( score ) => screen.getByRole( 'img', { name: `Agent readiness score: ${ score } out of 100` } );

const getRowByTitle = ( title ) => screen.getByText( title ).closest( '[role="button"]' );

const NOT_ACTIVATED_REASON = 'Activate Agent Ready to turn this on.';
const ABILITIES_API_REASON = { code: 'abilities_api_missing', message: 'Agent browser tools need the WordPress Abilities API.' };
const SEO_PLUGIN_REASON = { code: 'seo_plugin', message: 'Yoast SEO already generates llms.txt.' };

const getActionReason = ( action ) => {
	const describedBy = action.getAttribute( 'aria-describedby' );

	return describedBy ? document.getElementById( describedBy )?.textContent ?? null : null;
};

describe( 'Agent Ready scanner', () => {
	beforeEach( () => {
		HTMLCanvasElement.prototype.getContext = () => null;
		jest.useFakeTimers();
		runSiteScan.mockReset().mockImplementation( () => Promise.resolve( getMockScanResult() ) );
		activateAgentsReady.mockReset().mockResolvedValue( undefined );
		applyCheckFix.mockReset().mockResolvedValue( {} );
		saveAgentReadySettings.mockReset().mockResolvedValue( {} );
		undoCheckFix.mockReset().mockResolvedValue( {} );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'shows the first-run pitch and keeps the scanner preview out of the accessibility tree', () => {
		// Arrange
		renderScanner();

		// Assert
		expect( screen.getByRole( 'heading', { name: 'Is your site ready for agents?' } ) ).toBeTruthy();
		expect( screen.getByText( 'Find the gaps' ) ).toBeTruthy();
		expect( screen.getByText( 'Know exactly what to fix' ) ).toBeTruthy();
		expect( screen.getByText( 'Rescan when you\'re done' ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Rescan' } ) ).toBeNull();
	} );

	it( 'walks from first run through progress to the first check report', async () => {
		// Arrange
		renderScanner();

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );

		// Assert
		expect( screen.getByText( `Checking ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( within( screen.getByRole( 'list' ) ).getByText( 'Getting your site ready to scan' ) ).toBeTruthy();
		expect( screen.getByRole( 'progressbar', { name: 'Scan progress' } ) ).toBeTruthy();

		await advanceTimers( SCAN_DURATION_MS );

		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByRole( 'button', { name: 'Check my site' } ) ).toBeNull();
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getByRole( 'heading', { name: 'Where you stand' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Turn settings on' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( '' );
		expect( screen.getByRole( 'link', { name: /Open agent readiness settings/ } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
		expect( screen.getByText( '7 failed checks to be fixed. Activating agent access settings fixes 2 of them, the others require Angie or a manual fix.' ) ).toBeTruthy();
		expect( screen.queryByText( /\+\d+\s*pts/ ) ).toBeNull();
	} );

	it( 'expands the collapsed checks list on the first check report', async () => {
		// Arrange
		await runFirstScan();

		// Assert
		expect( screen.queryByText( 'Check' ) ).toBeNull();

		// Act
		showFixChecks();

		// Assert
		expect( screen.getAllByText( 'Check' ) ).toHaveLength( 1 );
		expect( screen.getAllByText( 'Actions' ) ).toHaveLength( 1 );
		expect( screen.getByText( '7 failed checks to be fixed. Activating agent access settings fixes 2 of them, the others require Angie or a manual fix.' ) ).toBeTruthy();
		expect( screen.getByText( 'Agents can\'t find a path into your site' ) ).toBeTruthy();
		expect( screen.queryByText( 'Agents can\'t read clean versions of your pages' ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Hide failed checks' } ).getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'shows the first five fixes and toggles the rest', async () => {
		// Arrange
		await runFirstScan();
		showFixChecks();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Show all fixes (+2)' } ) );

		// Assert
		expect( screen.getByText( 'Agents can\'t read clean versions of your pages' ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Show less' } ) ).toBeTruthy();

		fireEvent.click( screen.getByRole( 'button', { name: 'Show less' } ) );

		expect( screen.queryByText( 'Agents can\'t read clean versions of your pages' ) ).toBeNull();
	} );

	it( 'activates Agent Ready from the first check, rescans automatically and lands on the fixes report', async () => {
		// Arrange
		await runFirstScan();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn settings on' } ) );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Turning on' } ).disabled ).toBe( true );

		await advanceTimers( 0 );

		expect( activateAgentsReady ).toHaveBeenCalledTimes( 1 );
		expect( runSiteScan ).toHaveBeenCalledTimes( 2 );
		expect( screen.getByRole( 'status', { name: 'Scanning again' } ) ).toBeTruthy();

		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		expect( screen.queryByRole( 'status', { name: 'Scanning again' } ) ).toBeNull();
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Turn settings on' } ) ).toBeNull();
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getAllByRole( 'button', { name: 'Rescan' } )[ 0 ].textContent ).toBe( 'Rescan' );
		expect( screen.getByRole( 'link', { name: 'Settings' } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
		expect( screen.getByText( 'Agent Ready is on' ).parentElement.contains( screen.getByRole( 'link', { name: 'Settings' } ) ) ).toBe( true );
		expect( screen.queryByText( 'AI agents are blocked by your robots.txt' ) ).toBeNull();
		expect( screen.getByText( 'Agents can\'t tell when you\'re open' ) ).toBeTruthy();
	} );

	it( 'keeps Agent Ready on and offers a manual rescan when the automatic rescan fails', async () => {
		// Arrange
		await runFirstScan();
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn settings on' } ) );
		await advanceTimers( SCANNER_MOTION.ringActivatingMs + SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Turn settings on' } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).disabled ).toBe( false );
	} );

	it( 'does not rescan automatically when Agent Ready is turned on from the error report', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );
		renderScanner();
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS + SCANNER_MOTION.errorProgressPauseMs );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn settings on' } ) );
		await advanceTimers( SCANNER_MOTION.ringActivatingMs );

		// Assert
		expect( activateAgentsReady ).toHaveBeenCalledTimes( 1 );
		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'returns to the report with an error when activation fails', async () => {
		// Arrange
		activateAgentsReady.mockRejectedValue( new Error( 'Activation failed' ) );
		await runFirstScan();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn settings on' } ) );
		await advanceTimers( SCANNER_MOTION.ringActivatingMs );

		// Assert
		expect( screen.getByText( 'Activation failed' ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Turn settings on' } ) ).toBeTruthy();
		expect( screen.queryByText( 'Agent Ready is on' ) ).toBeNull();
	} );

	it( 'opens and closes a row drawer by clicking anywhere on the row', async () => {
		// Arrange
		await runFirstScan();
		showFixChecks();
		const row = getRowByTitle( 'Agents can\'t tell when you\'re open' );

		// Act
		fireEvent.click( row );

		// Assert
		expect( row.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		expect( screen.getByText( 'What we found' ) ).toBeTruthy();
		expect( screen.getByText( 'No openingHours found on your homepage' ) ).toBeTruthy();
		expect( screen.queryByText( 'How to fix it manually' ) ).toBeNull();

		fireEvent.keyDown( row, { key: 'Enter' } );

		expect( row.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'opens the install dialog from Fix with Angie when Angie is not active', async () => {
		// Arrange
		await runFirstScan();
		showFixChecks();

		// Act
		fireEvent.click( within( getRowByTitle( 'Agents can\'t tell when you\'re open' ) ).getByRole( 'button', { name: 'Fix with Angie' } ) );

		// Assert
		expect( applyCheckFix ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'heading', { name: 'Prepare your site for agents (with Angie)' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Install Angie & fix issue' } ).hasAttribute( 'disabled' ) ).toBe( true );
	} );

	it( 'offers to activate Angie when it is installed but inactive', async () => {
		// Arrange
		await runFirstScan( { isAngieInstalled: true } );
		showFixChecks();

		// Act
		fireEvent.click( within( getRowByTitle( 'Agents can\'t tell when you\'re open' ) ).getByRole( 'button', { name: 'Fix with Angie' } ) );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Activate Angie & fix issue' } ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Install Angie & fix issue' } ) ).toBeNull();
	} );

	it( 'opens How to fix from Copy prompt and copies that prompt', async () => {
		// Arrange
		const writeText = jest.fn().mockResolvedValue( undefined );
		Object.assign( navigator, { clipboard: { writeText } } );
		await runFirstScan();
		showFixChecks();
		const row = getRowByTitle( 'Agents can\'t tell when you\'re open' );

		// Act
		fireEvent.click( within( row ).getByRole( 'button', { name: 'Copy prompt' } ) );

		// Assert
		const dialog = screen.getByRole( 'dialog' );
		expect( within( dialog ).getByRole( 'heading', { name: 'Agents can\'t tell when you\'re open' } ) ).toBeTruthy();

		fireEvent.click( within( dialog ).getByRole( 'button', { name: 'Copy prompt' } ) );

		expect( writeText ).toHaveBeenCalledWith( 'Add your opening hours to your site\'s structured data.' );

		fireEvent.click( within( dialog ).getByRole( 'button', { name: 'Next issue' } ) );

		expect( within( screen.getByRole( 'dialog' ) ).getByRole( 'heading', { name: 'Agents can\'t find a way to contact you' } ) ).toBeTruthy();
	} );

	const getScanWithToggleCheck = ( id, title ) => {
		const scan = getMockScanResult();

		return {
			...scan,
			checks: [
				{
					id,
					title,
					points: 5,
					priority: PRIORITY_REQUIRED,
					stage: STAGE_REACH,
					evidence: `${ title } is missing`,
					explanation: { whatItMeans: '', howToFix: `Turn on ${ title }.` },
					fixWith: FIX_WITH_TOGGLE,
					fixPrompt: '',
					resolvedByActivation: false,
				},
				...scan.checks,
			],
		};
	};

	const getScanWithWebmcpCheck = () => getScanWithToggleCheck( 'webmcp-support', 'WebMCP support' );

	it( 'shows Undo and Rescan instead of Create for me when WebMCP support is on but the scan still reports it as failing', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithWebmcpCheck() );
		renderScanner( { ...activatedProps, browserToolsConfig: { enabled: true, isAvailable: true } } );
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );

		// Act
		await advanceTimers( SCAN_DURATION_MS );

		// Assert
		const row = getRowByTitle( 'WebMCP support' );
		expect( screen.getAllByText( 'WebMCP support' ) ).toHaveLength( 1 );
		expect( within( row ).getByRole( 'button', { name: 'Undo' } ) ).toBeTruthy();
		expect( within( row ).getByRole( 'button', { name: 'Rescan' } ) ).toBeTruthy();
		expect( within( row ).queryByRole( 'button', { name: 'Create for me' } ) ).toBeNull();
	} );

	it( 'disables Create for me and explains why when Agent browser tools are unavailable', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithWebmcpCheck() );
		renderScanner( { ...activatedProps, browserToolsConfig: { enabled: true, isAvailable: false, unavailableReason: ABILITIES_API_REASON } } );
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );
		const action = within( getRowByTitle( 'WebMCP support' ) ).getByRole( 'button', { name: 'Create for me' } );

		// Assert
		expect( action.disabled ).toBe( true );
		expect( getActionReason( action ) ).toBe( ABILITIES_API_REASON.message );
	} );

	it( 'disables Create for me and explains why when an SEO plugin owns llms.txt', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithToggleCheck( 'llms-txt-exists', 'No llms.txt file' ) );
		renderScanner( { ...activatedProps, llmsConfig: { enabled: true, hasPhysicalFile: false, unavailableReason: SEO_PLUGIN_REASON } } );
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );
		const action = within( getRowByTitle( 'No llms.txt file' ) ).getByRole( 'button', { name: 'Create for me' } );

		// Assert
		expect( action.disabled ).toBe( true );
		expect( getActionReason( action ) ).toBe( SEO_PLUGIN_REASON.message );
	} );

	it( 'prefers the server reason over the activation hint before Agent Ready is activated', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithWebmcpCheck() );
		renderScanner( { browserToolsConfig: { enabled: false, isAvailable: false, unavailableReason: ABILITIES_API_REASON } } );
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );
		showFixChecks();
		const action = within( getRowByTitle( 'WebMCP support' ) ).getByRole( 'button', { name: 'Create for me' } );

		// Assert
		expect( action.disabled ).toBe( true );
		expect( getActionReason( action ) ).toBe( ABILITIES_API_REASON.message );
	} );

	it( 'leaves checks whose module is unavailable out of the activation fix count', async () => {
		// Arrange
		const browserToolsConfig = { enabled: false, isAvailable: false, unavailableReason: ABILITIES_API_REASON };
		const scan = getScanWithWebmcpCheck();
		runSiteScan.mockResolvedValue( { ...scan, checks: scan.checks.map( ( check ) => ( { ...check, resolvedByActivation: 'webmcp-support' === check.id || check.resolvedByActivation } ) ) } );

		// Act
		await runFirstScan( { browserToolsConfig } );

		// Assert
		expect( screen.getByText( '8 failed checks to be fixed. Activating agent access settings fixes 2 of them, the others require Angie or a manual fix.' ) ).toBeTruthy();
	} );

	it( 'keeps checks whose module is already enabled in the failing list but out of the activation fix count', async () => {
		// Arrange
		const markdownConfig = { enabled: true };

		// Act
		renderScanner( { markdownConfig } );
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );
		showFixChecks();

		// Assert
		expect( screen.getByText( '7 failed checks to be fixed. Activating agent access settings fixes 1 of them, the others require Angie or a manual fix.' ) ).toBeTruthy();
	} );

	it( 'keeps the check listed with Undo and Rescan and the scan score when Create for me is clicked', async () => {
		// Arrange
		const title = 'Agents can\'t find a path into your site';
		await runFirstScan( activatedProps );

		// Act
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) );
		await flushPendingSave();

		// Assert
		const row = getRowByTitle( title );
		expect( applyCheckFix ).toHaveBeenCalledWith( 'agent-path', { enabled: true } );
		expect( within( row ).getByRole( 'button', { name: 'Undo' } ) ).toBeTruthy();
		expect( within( row ).getByRole( 'button', { name: 'Rescan' } ) ).toBeTruthy();
		expect( within( row ).queryByRole( 'button', { name: 'Create for me' } ) ).toBeNull();
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getByText( 'Rescan to update your score.' ) ).toBeTruthy();
	} );

	it( 'brings back Create for me when Undo is clicked', async () => {
		// Arrange
		const title = 'Agents can\'t find a path into your site';
		await runFirstScan( activatedProps );
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) );
		await flushPendingSave();

		// Act
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Undo' } ) );
		await flushPendingSave();

		// Assert
		expect( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) ).toBeTruthy();
		expect( screen.queryByText( 'Rescan to update your score.' ) ).toBeNull();
	} );

	it( 'moves the check to the passed checks and updates both counts when a rescan reports it as passing', async () => {
		// Arrange
		const title = 'Agents can\'t find a path into your site';
		const scan = getMockScanResult();
		const fixedCheck = scan.checks.find( ( check ) => title === check.title );
		await runFirstScan( activatedProps );
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) );
		await flushPendingSave();
		runSiteScan.mockResolvedValue( {
			...scan,
			checks: scan.checks.filter( ( check ) => check !== fixedCheck ),
			passingChecks: [ ...scan.passingChecks, { id: fixedCheck.id, title: fixedCheck.title, description: '', stage: fixedCheck.stage } ],
		} );
		const passedBefore = Number( screen.getByText( /Checks? passed/ ).textContent.match( /\d+/ )[ 0 ] );

		// Act
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( screen.getByText( `${ passedBefore + 1 } Checks passed` ) ).toBeTruthy();
		expect( screen.queryByText( title ) ).toBeNull();

		showPassedChecks();

		expect( screen.getByText( title ) ).toBeTruthy();
	} );

	it( 'keeps Create for me disabled until Agent Ready is activated', async () => {
		// Arrange
		await runFirstScan();
		showFixChecks();

		// Act
		const action = within( getRowByTitle( 'Agents can\'t find a path into your site' ) ).getByRole( 'button', { name: 'Create for me' } );

		// Assert
		expect( action.disabled ).toBe( true );
		expect( getActionReason( action ) ).toBe( NOT_ACTIVATED_REASON );
	} );

	it( 'drops the activation hint from Create for me once Agent Ready is activated', async () => {
		// Arrange
		await runFirstScan( activatedProps );

		// Act
		const action = within( getRowByTitle( 'Agents can\'t find a path into your site' ) ).getByRole( 'button', { name: 'Create for me' } );

		// Assert
		expect( action.disabled ).toBe( false );
		expect( action.getAttribute( 'aria-describedby' ) ).toBeNull();
	} );

	it( 'rolls back Create for me and shows an error when saving fails', async () => {
		// Arrange
		const title = 'Agents can\'t find a path into your site';
		applyCheckFix.mockRejectedValue( new Error( 'Save failed' ) );
		await runFirstScan( activatedProps );

		// Act
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) );
		await act( async () => {
			await Promise.resolve();
		} );

		// Assert
		expect( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) ).toBeTruthy();
		expect( screen.getByText( 'Save failed' ) ).toBeTruthy();
	} );

	it( 'keeps Undo and Rescan on the failing check when a rescan still reports it as failing', async () => {
		// Arrange
		const title = 'Agents can\'t find a path into your site';
		await runFirstScan( activatedProps );
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Create for me' } ) );
		await flushPendingSave();

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Rescan' } )[ 0 ] );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 2 );
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.queryByText( 'Rescan to update your score.' ) ).toBeNull();
		expect( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Undo' } ) ).toBeTruthy();
	} );

	it( 'opens the preference drawer and shows Undo and Rescan once a value is saved', async () => {
		// Arrange
		await runFirstScan();
		showFixChecks();
		const title = 'Your service area isn\'t stated anywhere an agent can read';
		fireEvent.click( screen.getByRole( 'button', { name: 'Set your preference' } ) );

		// Act
		fireEvent.change( screen.getByRole( 'textbox', { name: title } ), { target: { value: 'London' } } );
		fireEvent.keyDown( screen.getByRole( 'textbox', { name: title } ), { key: 'Enter' } );
		await flushPendingSave();

		// Assert
		expect( applyCheckFix ).toHaveBeenCalledWith( 'service-area', { value: 'London' } );
		expect( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Undo' } ) ).toBeTruthy();
	} );

	it( 'lists the passed checks in a card that is collapsed by default', async () => {
		// Arrange
		await runFirstScan( activatedProps );

		// Assert
		expect( screen.getByText( /Checks? passed/ ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Show passed checks' } ).getAttribute( 'aria-expanded' ) ).toBe( 'false' );

		// Act
		showPassedChecks();

		// Assert
		expect( screen.getByRole( 'button', { name: 'Hide passed checks' } ).getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'shows the error report when the outside half of the scan fails, and still offers Activate', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );
		renderScanner();

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );

		// Assert
		expect( screen.queryByText( 'Looking for your business name' ) ).toBeNull();

		await advanceTimers( SCANNER_MOTION.errorProgressPauseMs );

		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( screen.getByText( 'What you can do now' ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( 'Rescan' );
		expect( screen.getByRole( 'button', { name: 'Turn settings on' } ) ).toBeTruthy();
		expect( screen.queryByRole( 'img', { name: /Agent readiness score/ } ) ).toBeNull();
	} );

	it( 'shows the report skeleton while a rescan runs, then returns to the report', async () => {
		// Arrange
		await runFirstScan();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );

		// Assert
		expect( screen.getByRole( 'status', { name: 'Scanning again' } ) ).toBeTruthy();
		expect( screen.queryByRole( 'progressbar', { name: 'Scan progress' } ) ).toBeNull();
		expect( screen.queryByRole( 'img', { name: /Agent readiness score/ } ) ).toBeNull();

		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		expect( runSiteScan ).toHaveBeenCalledTimes( 2 );
		expect( screen.queryByRole( 'status', { name: 'Scanning again' } ) ).toBeNull();
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getByRole( 'heading', { name: 'Where you stand' } ) ).toBeTruthy();
	} );

	it( 'lands on the error report when a rescan fails', async () => {
		// Arrange
		await runFirstScan();
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( screen.queryByRole( 'progressbar', { name: 'Scan progress' } ) ).toBeNull();
		expect( screen.queryByRole( 'status', { name: 'Scanning again' } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( 'Rescan' );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 3 );
		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
	} );

	it( 'offers rescan on the error report when Agent Ready is already on', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );
		renderScanner( activatedProps );

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS + SCANNER_MOTION.errorProgressPauseMs );

		// Assert
		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( 'Rescan' );
		expect( screen.queryByRole( 'button', { name: 'Turn settings on' } ) ).toBeNull();
	} );

	it( 'shows the next scan time on the error report when a failed rescan is throttled', async () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();
		await runFirstScan();
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Too many scans' ), {
			status: HTTP_TOO_MANY_REQUESTS,
			reason: 'throttled',
			retryAt,
		} ) ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expectNextScanLabelDisabled( 'Next scan: 2h 15m' );
	} );

	it( 'lands on the error report with the failure reason when the first scan request is rejected', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Blocked' ), { status: 502, reason: SCAN_FAILURE_REASON_BLOCKED } ) ) );
		renderScanner();

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS + SCANNER_MOTION.errorProgressPauseMs );

		// Assert
		expect( screen.getByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( screen.getByText( /A firewall or security plugin/ ) ).toBeTruthy();
	} );

	it( 'explains that the site is not public yet when the scan is rejected for a local site', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Local' ), { status: HTTP_UNPROCESSABLE_ENTITY, reason: SCAN_FAILURE_REASON_LOCAL } ) ) );
		renderScanner();

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS + SCANNER_MOTION.errorProgressPauseMs );

		// Assert
		expect( screen.getByText( 'Your site isn\'t public yet' ) ).toBeTruthy();
		expect( screen.getByText( /Come back and run the check once the site is live/ ) ).toBeTruthy();
		expect( screen.queryByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeNull();
	} );

	it( 'opens on the last stored report instead of the first-run pitch', () => {
		// Arrange
		renderScanner( { lastReport: getLastReport() } );

		// Assert
		expect( screen.queryByRole( 'heading', { name: 'Is your site ready for agents?' } ) ).toBeNull();
		expect( getScoreRing( LAST_REPORT_SCORE ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( '' );
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).disabled ).toBe( false );
		expect( screen.getByText( 'Prepare your site for agents' ) ).toBeTruthy();
	} );

	it( 'treats an activated Agent Ready as already activated', () => {
		// Arrange
		renderScanner( { ...activatedProps, lastReport: getLastReport() } );

		// Assert
		expect( screen.queryByText( 'Prepare your site for agents' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Turn settings on' } ) ).toBeNull();
		expect( screen.queryByText( /failed checks to be fixed/ ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( 'Rescan' );
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
		expect( screen.getByRole( 'link', { name: 'Settings' } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
		expect( screen.queryByText( /You turned off agent readiness settings/ ) ).toBeNull();
		expect( screen.getByText( 'JSON-LD structured data' ) ).toBeTruthy();
	} );

	it( 'shows the agent access off banner when modules are off but Agent Ready stays activated', () => {
		// Arrange
		renderScanner( { isActivated: true, lastReport: getLastReport(), ...agentAccessOffConfigs } );

		// Assert
		expect( screen.getByText( /You turned off agent readiness settings/ ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Rescan now' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Turn back on' } ) ).toBeTruthy();
		expect( screen.queryByText( 'Agent Ready is on' ) ).toBeNull();
		expect( screen.queryByRole( 'link', { name: 'Settings' } ) ).toBeNull();
		expect( screen.queryByText( 'Prepare your site for agents' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Turn settings on' } ) ).toBeNull();
	} );

	it( 'shows only the prepare banner when modules are off and Agent Ready was never activated', () => {
		// Arrange
		renderScanner( { lastReport: getLastReport(), ...agentAccessOffConfigs } );

		// Assert
		expect( screen.getByText( 'Prepare your site for agents' ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Turn settings on' } ) ).toBeTruthy();
		expect( screen.queryByText( /You turned off agent readiness settings/ ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Turn back on' } ) ).toBeNull();
	} );

	it( 're-enables modules from the off banner when Agent Ready is already activated', async () => {
		// Arrange
		renderScanner( { isActivated: true, lastReport: getLastReport(), ...agentAccessOffConfigs } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn back on' } ) );
		await flushPendingSave();

		// Assert
		expect( saveAgentReadySettings ).toHaveBeenCalledTimes( 1 );
		expect( activateAgentsReady ).not.toHaveBeenCalled();
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
		expect( screen.queryByText( /You turned off agent readiness settings/ ) ).toBeNull();
	} );

	it( 'activates Agent Ready from the prepare banner when modules were off and it was never on', async () => {
		// Arrange
		renderScanner( { lastReport: getLastReport(), ...agentAccessOffConfigs } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn settings on' } ) );
		await advanceTimers( SCANNER_MOTION.ringActivatingMs );

		// Assert
		expect( activateAgentsReady ).toHaveBeenCalledTimes( 1 );
		expect( saveAgentReadySettings ).not.toHaveBeenCalled();
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
	} );

	it( 'starts a rescan from the off banner', async () => {
		// Arrange
		renderScanner( { isActivated: true, lastReport: getLastReport(), ...agentAccessOffConfigs } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan now' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips the prepare banner after a first scan when Agent Ready is already on', async () => {
		// Arrange
		renderScanner( activatedProps );

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );

		// Assert
		expect( screen.queryByText( 'Prepare your site for agents' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Turn settings on' } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( 'Rescan' );
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
		expect( screen.getByRole( 'link', { name: 'Settings' } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
	} );

	it( 'disables rescan and shows the remaining time while retryAt is still ahead', () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();

		// Act
		renderScanner( { lastReport: { ...getLastReport(), retryAt } } );

		// Assert
		expectNextScanLabelDisabled( 'Next scan: 2h 15m' );
		expect( screen.queryByRole( 'button', { name: 'Rescan' } ) ).toBeNull();
	} );

	it( 'enables rescan once the cooldown passes', async () => {
		// Arrange
		const retryAt = new Date( Date.now() + SHORT_COOLDOWN_MS ).toISOString();
		renderScanner( { lastReport: { ...getLastReport(), retryAt } } );

		// Act
		await advanceTimers( MS_PER_MINUTE );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).disabled ).toBe( false );
		expect( screen.queryByRole( 'button', { name: /Next scan/ } ) ).toBeNull();
	} );

	it( 'keeps the report and shows when the next scan is allowed when a rescan is throttled', async () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Too many scans' ), {
			status: HTTP_TOO_MANY_REQUESTS,
			reason: 'throttled',
			retryAt,
		} ) ) );
		renderScanner( { lastReport: getLastReport() } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
		expect( getScoreRing( LAST_REPORT_SCORE ) ).toBeTruthy();
		expect( screen.queryByText( /You can scan again at/ ) ).toBeNull();
		expect( screen.queryByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeNull();
		expectNextScanLabelDisabled( 'Next scan: 2h 15m' );
	} );

	it( 'blocks the first check when a cooldown is active and no report is stored', () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();

		// Act
		renderScanner( { retryAt } );

		// Assert
		expectNextScanLabelDisabled( 'Next scan: 2h 15m' );
		expect( screen.queryByRole( 'button', { name: 'Check my site' } ) ).toBeNull();
	} );

	it( 'uses a later localized cooldown instead of an expired report timestamp', () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();

		// Act
		renderScanner( { lastReport: getLastReport(), retryAt } );

		// Assert
		expectNextScanLabelDisabled( 'Next scan: 2h 15m' );
	} );

	it( 'returns to the first-run pitch and blocks another check when the first scan is throttled', async () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Too many scans' ), {
			status: HTTP_TOO_MANY_REQUESTS,
			reason: 'throttled',
			retryAt,
		} ) ) );
		renderScanner();

		// Act
		fireEvent.click( screen.getAllByRole( 'button', { name: 'Check my site' } )[ 0 ] );
		await advanceTimers( SCAN_DURATION_MS );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeNull();
		expect( screen.getByRole( 'heading', { name: 'Is your site ready for agents?' } ) ).toBeTruthy();
		expectNextScanLabelDisabled( 'Next scan: 2h 15m' );
	} );

	it( 'blocks rescans for the default cooldown when a throttle response omits retryAt', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Too many scans' ), {
			status: HTTP_TOO_MANY_REQUESTS,
			reason: 'throttled',
		} ) ) );
		renderScanner( { lastReport: getLastReport() } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
		expect( getScoreRing( LAST_REPORT_SCORE ) ).toBeTruthy();
		expectNextScanLabelDisabled( 'Next scan: 5m' );
	} );
} );

describe( 'getScoreTier', () => {
	it( 'uses the Figma boundaries for low, mid and high scores', () => {
		// Assert
		expect( getScoreTier( 30 ) ).toBe( SCORE_TIER_LOW );
		expect( getScoreTier( 31 ) ).toBe( SCORE_TIER_MID );
		expect( getScoreTier( 80 ) ).toBe( SCORE_TIER_MID );
		expect( getScoreTier( 81 ) ).toBe( SCORE_TIER_HIGH );
	} );
} );

describe( 'stage health', () => {
	it( 'derives the pass percent from earned and total checks', () => {
		// Assert
		expect( getStagePassPercent( { earned: 0, total: 6 } ) ).toBe( 0 );
		expect( getStagePassPercent( { earned: 2, total: 6 } ) ).toBe( 33 );
		expect( getStagePassPercent( { earned: 5, total: 6 } ) ).toBe( 83 );
	} );

	it( 'has no pass percent or tier for coming soon or empty stages', () => {
		// Arrange
		const comingSoon = { earned: 0, total: 0, isComingSoon: true };

		// Assert
		expect( getStagePassPercent( comingSoon ) ).toBeNull();
		expect( getStageHealthTier( comingSoon ) ).toBeNull();
		expect( getStageHealthTier( { earned: 0, total: 0 } ) ).toBeNull();
	} );

	it( 'maps the pass percent to low, mid and high tiers', () => {
		// Assert
		expect( getStageHealthTier( { earned: 0, total: 6 } ) ).toBe( SCORE_TIER_LOW );
		expect( getStageHealthTier( { earned: 3, total: 6 } ) ).toBe( SCORE_TIER_MID );
		expect( getStageHealthTier( { earned: 5, total: 6 } ) ).toBe( SCORE_TIER_HIGH );
	} );
} );
