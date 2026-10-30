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
	undoCheckFix: jest.fn(),
} ) );

import { activateAgentsReady, applyCheckFix, runSiteScan, undoCheckFix } from 'elementor/modules/agents/assets/js/admin/api';

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

const activatedProps = { isActivated: true };

const renderScanner = ( props = {} ) => render( <ScannerApp siteDomain={ SITE_DOMAIN } agentAccessUrl={ AGENT_ACCESS_URL } { ...props } /> );

const runFirstScan = async ( props = {} ) => {
	renderScanner( props );
	fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
	await advanceTimers( SCAN_DURATION_MS );
};

const getScoreRing = ( score ) => screen.getByRole( 'img', { name: `Agent readiness score: ${ score } out of 100` } );

const getRowByTitle = ( title ) => screen.getByText( title ).closest( '[role="button"]' );

const NOT_ACTIVATED_REASON = 'Activate Agent Ready to turn this on.';
const ABILITIES_API_REASON = { code: 'abilities_api_missing', message: 'Agent browser tools need the WordPress Abilities API.' };
const SEO_PLUGIN_REASON = { code: 'seo_plugin', message: 'Yoast SEO already generates llms.txt.' };

const getSwitchReason = ( checkSwitch ) => {
	const describedBy = checkSwitch.getAttribute( 'aria-describedby' );

	return describedBy ? document.getElementById( describedBy )?.textContent ?? null : null;
};

describe( 'Agent Ready scanner', () => {
	beforeEach( () => {
		HTMLCanvasElement.prototype.getContext = () => null;
		jest.useFakeTimers();
		runSiteScan.mockReset().mockImplementation( () => Promise.resolve( getMockScanResult() ) );
		activateAgentsReady.mockReset().mockResolvedValue( undefined );
		applyCheckFix.mockReset().mockResolvedValue( {} );
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );

		// Assert
		expect( screen.getByText( `Checking ${ SITE_DOMAIN }` ) ).toBeTruthy();
		expect( within( screen.getByRole( 'list' ) ).getByText( 'Getting your site ready to scan' ) ).toBeTruthy();
		expect( screen.getByRole( 'progressbar', { name: 'Scan progress' } ) ).toBeTruthy();

		await advanceTimers( SCAN_DURATION_MS );

		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getByRole( 'heading', { name: 'Where you stand' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Turn settings on' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( '' );
		expect( screen.getByRole( 'link', { name: /Open agent readiness settings/ } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
		expect( screen.getByText( 'Checks to fix. Activate fixes 2 of them. The other 5 need you or Angie.' ) ).toBeTruthy();
		expect( screen.queryByText( /\+\d+\s*pts/ ) ).toBeNull();
	} );

	it( 'expands the collapsed checks list on the first check report', async () => {
		// Arrange
		await runFirstScan();

		// Assert
		expect( screen.queryByText( 'Check' ) ).toBeNull();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );

		// Assert
		expect( screen.getAllByText( 'Check' ) ).toHaveLength( 1 );
		expect( screen.getAllByText( 'Actions' ) ).toHaveLength( 1 );
		expect( screen.getByText( 'Checks to fix. Activate fixes 2 of them. The other 5 need you or Angie.' ) ).toBeTruthy();
		expect( screen.getByText( 'Agents can\'t find a path into your site' ) ).toBeTruthy();
		expect( screen.queryByText( 'Agents can\'t read clean versions of your pages' ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Hide checks' } ).getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'shows the first five fixes and toggles the rest', async () => {
		// Arrange
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Show all fixes (+2)' } ) );

		// Assert
		expect( screen.getByText( 'Agents can\'t read clean versions of your pages' ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Show less' } ) ).toBeTruthy();

		fireEvent.click( screen.getByRole( 'button', { name: 'Show less' } ) );

		expect( screen.queryByText( 'Agents can\'t read clean versions of your pages' ) ).toBeNull();
	} );

	it( 'activates Agent Ready and lands on the fixes report', async () => {
		// Arrange
		await runFirstScan();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn settings on' } ) );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Activating' } ).disabled ).toBe( true );

		await advanceTimers( SCANNER_MOTION.ringActivatingMs );

		expect( activateAgentsReady ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getAllByRole( 'button', { name: 'Rescan' } )[ 0 ].textContent ).toBe( 'Rescan' );
		expect( screen.getByRole( 'link', { name: 'Settings' } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
		expect( screen.getByText( 'Agent Ready is on' ).parentElement.contains( screen.getByRole( 'link', { name: 'Settings' } ) ) ).toBe( true );
		expect( screen.queryByText( 'AI agents are blocked by your robots.txt' ) ).toBeNull();
		expect( screen.getByText( 'Agents can\'t tell when you\'re open' ) ).toBeTruthy();
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );
		const row = getRowByTitle( 'Agents can\'t tell when you\'re open' );

		// Act
		fireEvent.click( row );

		// Assert
		expect( row.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		expect( screen.getByText( 'What we found' ) ).toBeTruthy();
		expect( screen.getByText( 'No openingHours found on your homepage' ) ).toBeTruthy();
		expect( screen.getByText( 'How to fix it manually' ) ).toBeTruthy();

		fireEvent.keyDown( row, { key: 'Enter' } );

		expect( row.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'opens the install dialog from Fix with Angie when Angie is not active', async () => {
		// Arrange
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );

		// Act
		fireEvent.click( within( getRowByTitle( 'Agents can\'t tell when you\'re open' ) ).getByRole( 'button', { name: 'Fix with Angie' } ) );

		// Assert
		expect( applyCheckFix ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'heading', { name: 'Prepare your site for agents (with Angie)' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Install Angie & fix issue' } ).hasAttribute( 'disabled' ) ).toBe( true );
	} );

	it( 'opens How to fix from Copy prompt and copies that prompt', async () => {
		// Arrange
		const writeText = jest.fn().mockResolvedValue( undefined );
		Object.assign( navigator, { clipboard: { writeText } } );
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );
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

	it( 'wires WebMCP support to Agent browser tools settings', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithWebmcpCheck() );
		renderScanner( { ...activatedProps, browserToolsConfig: { enabled: true, isAvailable: true } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await advanceTimers( SCAN_DURATION_MS );
		const row = getRowByTitle( 'WebMCP support' );

		// Assert
		expect( within( row ).queryByRole( 'switch' ) ).toBeNull();

		// Act
		fireEvent.click( within( row ).getByRole( 'button', { name: 'Undo' } ) );
		await flushPendingSave();

		// Assert
		expect( undoCheckFix ).toHaveBeenCalledWith( 'webmcp-support' );
		expect( screen.getByRole( 'switch', { name: 'WebMCP support' } ).checked ).toBe( false );
		expect( within( row ).queryByRole( 'button', { name: 'Undo' } ) ).toBeNull();
	} );

	it( 'disables the WebMCP switch and explains why when Agent browser tools are unavailable', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithWebmcpCheck() );
		renderScanner( { ...activatedProps, browserToolsConfig: { enabled: true, isAvailable: false, unavailableReason: ABILITIES_API_REASON } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await advanceTimers( SCAN_DURATION_MS );
		const checkSwitch = screen.getByRole( 'switch', { name: 'WebMCP support' } );

		// Assert
		expect( checkSwitch.checked ).toBe( false );
		expect( checkSwitch.disabled ).toBe( true );
		expect( getSwitchReason( checkSwitch ) ).toBe( ABILITIES_API_REASON.message );
	} );

	it( 'disables the llms.txt switch and explains why when an SEO plugin owns llms.txt', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithToggleCheck( 'llms-txt-exists', 'No llms.txt file' ) );
		renderScanner( { ...activatedProps, llmsConfig: { enabled: true, hasPhysicalFile: false, unavailableReason: SEO_PLUGIN_REASON } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await advanceTimers( SCAN_DURATION_MS );
		const checkSwitch = screen.getByRole( 'switch', { name: 'No llms.txt file' } );

		// Assert
		expect( checkSwitch.checked ).toBe( false );
		expect( checkSwitch.disabled ).toBe( true );
		expect( getSwitchReason( checkSwitch ) ).toBe( SEO_PLUGIN_REASON.message );
	} );

	it( 'prefers the server reason over the activation hint before Agent Ready is activated', async () => {
		// Arrange
		runSiteScan.mockResolvedValue( getScanWithWebmcpCheck() );
		renderScanner( { browserToolsConfig: { enabled: true, isAvailable: false, unavailableReason: ABILITIES_API_REASON } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await advanceTimers( SCAN_DURATION_MS );
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );
		const checkSwitch = screen.getByRole( 'switch', { name: 'WebMCP support' } );

		// Assert
		expect( checkSwitch.disabled ).toBe( true );
		expect( getSwitchReason( checkSwitch ) ).toBe( ABILITIES_API_REASON.message );
	} );

	it( 'shows Undo and Rescan instead of the switch when that Agent Ready module is already enabled', async () => {
		// Arrange
		const title = 'Agents can\'t read clean versions of your pages';
		renderScanner( { ...activatedProps, markdownConfig: { enabled: true } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await advanceTimers( SCAN_DURATION_MS );
		fireEvent.click( screen.getByRole( 'button', { name: 'Show all fixes (+2)' } ) );
		const row = getRowByTitle( title );

		// Assert
		expect( within( row ).queryByRole( 'switch' ) ).toBeNull();
		expect( within( row ).getByRole( 'button', { name: 'Rescan' } ) ).toBeTruthy();
		expect( screen.queryByText( 'Rescan to update your score.' ) ).toBeNull();

		// Act
		fireEvent.click( within( row ).getByRole( 'button', { name: 'Undo' } ) );
		await flushPendingSave();

		// Assert
		expect( undoCheckFix ).toHaveBeenCalledWith( 'markdown-pages' );
		expect( screen.getByRole( 'switch', { name: title } ).checked ).toBe( false );
		expect( screen.getByText( 'Rescan to update your score.' ) ).toBeTruthy();
	} );

	it( 'keeps the scan score when a local check switch is turned on', async () => {
		// Arrange
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );
		const checkSwitch = screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } );

		// Act
		fireEvent.click( checkSwitch );
		await flushPendingSave();

		// Assert
		expect( applyCheckFix ).toHaveBeenCalledWith( 'agent-path', { enabled: true } );
		expect( within( getRowByTitle( 'Agents can\'t find a path into your site' ) ).getByRole( 'button', { name: 'Undo' } ) ).toBeTruthy();
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.getByText( 'Rescan to update your score.' ) ).toBeTruthy();
		expect( getRowByTitle( 'Agents can\'t find a path into your site' ).getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'keeps check switches disabled until Agent Ready is activated', async () => {
		// Arrange
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );

		// Act
		const checkSwitch = screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } );

		// Assert
		expect( checkSwitch.disabled ).toBe( true );
		expect( getSwitchReason( checkSwitch ) ).toBe( NOT_ACTIVATED_REASON );
	} );

	it( 'drops the activation hint from check switches once Agent Ready is activated', async () => {
		// Arrange
		await runFirstScan( activatedProps );

		// Act
		const checkSwitch = screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } );

		// Assert
		expect( checkSwitch.disabled ).toBe( false );
		expect( checkSwitch.getAttribute( 'aria-describedby' ) ).toBeNull();
	} );

	it( 'disables a toggle while its fix is saving', async () => {
		// Arrange
		let resolveFix;
		applyCheckFix.mockImplementation( () => new Promise( ( resolve ) => {
			resolveFix = resolve;
		} ) );
		await runFirstScan( activatedProps );
		const checkSwitch = screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } );

		// Act
		fireEvent.click( checkSwitch );
		const row = getRowByTitle( 'Agents can\'t find a path into your site' );

		// Assert
		expect( within( row ).queryByRole( 'switch' ) ).toBeNull();
		expect( within( row ).getByRole( 'button', { name: 'Undo' } ).disabled ).toBe( true );
		expect( within( row ).getByRole( 'button', { name: 'Rescan' } ).disabled ).toBe( true );

		await act( async () => {
			resolveFix( {} );
		} );

		expect( within( row ).getByRole( 'button', { name: 'Undo' } ).disabled ).toBe( false );
		expect( within( row ).getByRole( 'button', { name: 'Rescan' } ).disabled ).toBe( false );
	} );

	it( 'reverts a handled toggle to its initial state when Undo is clicked', async () => {
		// Arrange
		await runFirstScan( activatedProps );
		const title = 'Agents can\'t find a path into your site';
		fireEvent.click( screen.getByRole( 'switch', { name: title } ) );
		await flushPendingSave();

		// Act
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Undo' } ) );
		await flushPendingSave();

		// Assert
		expect( undoCheckFix ).toHaveBeenCalledWith( 'agent-path' );
		expect( screen.getByRole( 'switch', { name: title } ).checked ).toBe( false );
		expect( screen.queryByText( 'Rescan to update your score.' ) ).toBeNull();
	} );

	it( 'starts a new scan when Rescan is clicked on a handled toggle row', async () => {
		// Arrange
		await runFirstScan( activatedProps );
		const title = 'Agents can\'t find a path into your site';
		fireEvent.click( screen.getByRole( 'switch', { name: title } ) );
		await flushPendingSave();

		// Act
		fireEvent.click( within( getRowByTitle( title ) ).getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'rolls back a toggle and shows an error when saving fails', async () => {
		// Arrange
		applyCheckFix.mockRejectedValue( new Error( 'Save failed' ) );
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );
		const checkSwitch = screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } );

		// Act
		fireEvent.click( checkSwitch );
		await act( async () => {
			await Promise.resolve();
		} );

		// Assert
		expect( screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } ).checked ).toBe( false );
		expect( screen.getByText( 'Save failed' ) ).toBeTruthy();
	} );

	it( 'drops a pending fix when a rescan still reports the check as failing', async () => {
		// Arrange
		await runFirstScan( activatedProps );
		const checkSwitch = screen.getByRole( 'switch', { name: 'Agents can\'t find a path into your site' } );
		fireEvent.click( checkSwitch );
		await flushPendingSave();

		// Act
		fireEvent.click( within( getRowByTitle( 'Agents can\'t find a path into your site' ) ).getByRole( 'button', { name: 'Rescan' } ) );
		await advanceTimers( SCANNER_MOTION.rescanMinMs );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 2 );
		expect( getScoreRing( 30 ) ).toBeTruthy();
		expect( screen.queryByText( 'Rescan to update your score.' ) ).toBeNull();
		expect( within( getRowByTitle( 'Agents can\'t find a path into your site' ) ).getByRole( 'button', { name: 'Undo' } ) ).toBeTruthy();
	} );

	it( 'opens the preference drawer and completes the row once a value is saved', async () => {
		// Arrange
		await runFirstScan();
		fireEvent.click( screen.getByRole( 'button', { name: 'Show checks' } ) );
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

	it( 'shows the error report when the outside half of the scan fails, and still offers Activate', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.resolve( getFailedScanResult() ) );
		renderScanner();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
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
		expect( screen.getByRole( 'button', { name: 'Next scan: 2h 15m' } ).disabled ).toBe( true );
	} );

	it( 'lands on the error report with the failure reason when the first scan request is rejected', async () => {
		// Arrange
		runSiteScan.mockImplementation( () => Promise.reject( Object.assign( new Error( 'Blocked' ), { status: 502, reason: SCAN_FAILURE_REASON_BLOCKED } ) ) );
		renderScanner();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
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
		expect( screen.queryByRole( 'button', { name: 'Check my site' } ) ).toBeNull();
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
		expect( screen.queryByRole( 'button', { name: 'Show checks' } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Rescan' } ).textContent ).toBe( 'Rescan' );
		expect( screen.getByText( 'Agent Ready is on' ) ).toBeTruthy();
		expect( screen.getByRole( 'link', { name: 'Settings' } ).getAttribute( 'href' ) ).toBe( AGENT_ACCESS_URL );
		expect( screen.getByText( 'JSON-LD structured data' ) ).toBeTruthy();
	} );

	it( 'skips the prepare banner after a first scan when Agent Ready is already on', async () => {
		// Arrange
		renderScanner( activatedProps );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
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
		expect( screen.getByRole( 'button', { name: 'Next scan: 2h 15m' } ).disabled ).toBe( true );
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
		expect( screen.getByRole( 'button', { name: 'Next scan: 2h 15m' } ).disabled ).toBe( true );
	} );

	it( 'blocks the first check when a cooldown is active and no report is stored', () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();

		// Act
		renderScanner( { retryAt } );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Next scan: 2h 15m' } ).disabled ).toBe( true );
		expect( screen.queryByRole( 'button', { name: 'Check my site' } ) ).toBeNull();
	} );

	it( 'uses a later localized cooldown instead of an expired report timestamp', () => {
		// Arrange
		const retryAt = new Date( Date.now() + COOLDOWN_REMAINING_MS ).toISOString();

		// Act
		renderScanner( { lastReport: getLastReport(), retryAt } );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Next scan: 2h 15m' } ).disabled ).toBe( true );
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await advanceTimers( SCAN_DURATION_MS );

		// Assert
		expect( runSiteScan ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByText( `We couldn't reach ${ SITE_DOMAIN }` ) ).toBeNull();
		expect( screen.getByRole( 'heading', { name: 'Is your site ready for agents?' } ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Next scan: 2h 15m' } ).disabled ).toBe( true );
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
		expect( screen.getByRole( 'button', { name: 'Next scan: 5m' } ).disabled ).toBe( true );
	} );
} );

describe( 'getScoreTier', () => {
	it( 'uses the Figma boundaries for low, mid and high scores', () => {
		// Assert
		expect( getScoreTier( 30 ) ).toBe( SCORE_TIER_LOW );
		expect( getScoreTier( 31 ) ).toBe( SCORE_TIER_MID );
		expect( getScoreTier( 79 ) ).toBe( SCORE_TIER_MID );
		expect( getScoreTier( 80 ) ).toBe( SCORE_TIER_HIGH );
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
		expect( getStageHealthTier( { earned: 4, total: 5 } ) ).toBe( SCORE_TIER_HIGH );
	} );
} );
