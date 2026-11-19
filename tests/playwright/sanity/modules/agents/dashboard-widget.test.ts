import { expect, type Page } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';
import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';

const SETTINGS_OPTION = 'elementor_agent_ready_settings';
const REPORT_OPTION = 'elementor_agents_scanner_last_report';

const BLOCK = '.e-overview__agent-ready';
const CTA = `${ BLOCK } [data-agent-ready-cta]`;
const DOT = `${ BLOCK } .e-overview__agent-ready-dot`;
const META = `${ BLOCK } .e-overview__agent-ready-meta`;

const SCANNER_PAGE = 'page=elementor-agents-ready';
const TRACKING_EVENT = 'agent_readiness_dashboard_cta_clicked';

const SCORE_NEEDS_WORK = 30;
const SCORE_GETTING_THERE = 55;
const SCORE_STRONG = 92;

type CheckStatus = 'fail' | 'partial' | 'pass';

const seedReport = async ( score: number, statuses: CheckStatus[] ): Promise<void> => {
	const checks = statuses.map( ( status ) => `['status'=>'${ status }']` ).join( ',' );

	await wpCli( `wp eval update_option('${ REPORT_OPTION }',['score'=>${ score },'checks'=>[${ checks }]]);` );
};

const resetAgentReadyState = async (): Promise<void> => {
	await wpCli( `wp eval delete_option('${ REPORT_OPTION }');` );
	await wpCli( `wp eval delete_option('${ SETTINGS_OPTION }');` );
};

type TrackingWindow = {
	elementorCommon: { eventsManager: { dispatchEvent: ( ...args: unknown[] ) => void } };
	trackedEvents: unknown[][];
};

const captureTrackedEvents = async ( page: Page ): Promise<void> => {
	await page.evaluate( () => {
		const trackingWindow = window as unknown as TrackingWindow;

		trackingWindow.trackedEvents = [];
		trackingWindow.elementorCommon.eventsManager.dispatchEvent = ( ...args: unknown[] ) => {
			trackingWindow.trackedEvents.push( args );
		};

		document.querySelector( '[data-agent-ready-cta]' ).addEventListener( 'click', ( event ) => event.preventDefault() );
	} );
};

const getTrackedEvents = ( page: Page ): Promise<unknown[][]> =>
	page.evaluate( () => ( window as unknown as TrackingWindow ).trackedEvents );

test.describe( 'Agent Readiness block in the dashboard Elementor Overview widget @agents', () => {
	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		await resetAgentReadyState();

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openWordPressDashboard();
	} );

	test.afterEach( async () => {
		await resetAgentReadyState();
	} );

	test( 'Prompts to scan when the site has no stored report', async ( { page } ) => {
		// Arrange.
		await page.reload();

		// Assert.
		await expect( page.locator( BLOCK ) ).toBeVisible();
		await expect( page.locator( BLOCK ) ).toContainText( 'Your site might not be visible to AI agents.' );
		await expect( page.locator( DOT ) ).toHaveCount( 0 );
		await expect( page.locator( META ) ).toHaveCount( 0 );
		await expect( page.locator( CTA ) ).toHaveText( 'Scan & Fix' );
	} );

	test( 'Shows a red dot, score and quick fixes when the site needs work', async ( { page } ) => {
		// Arrange.
		await seedReport( SCORE_NEEDS_WORK, [ 'fail', 'partial', 'fail', 'pass' ] );

		// Act.
		await page.reload();

		// Assert.
		await expect( page.locator( BLOCK ) ).toContainText( `${ SCORE_NEEDS_WORK }/100 · Needs work` );
		await expect( page.locator( DOT ) ).toHaveCSS( 'background-color', 'rgb(214, 54, 56)' );
		await expect( page.locator( META ) ).toHaveText( '3 quick fixes' );
		await expect( page.locator( CTA ) ).toHaveText( 'Fix now' );
	} );

	test( 'Shows an orange dot and a singular quick fix label when the site is getting there', async ( { page } ) => {
		// Arrange.
		await seedReport( SCORE_GETTING_THERE, [ 'partial', 'pass' ] );

		// Act.
		await page.reload();

		// Assert.
		await expect( page.locator( BLOCK ) ).toContainText( `${ SCORE_GETTING_THERE }/100 · Getting there` );
		await expect( page.locator( DOT ) ).toHaveCSS( 'background-color', 'rgb(219, 166, 23)' );
		await expect( page.locator( META ) ).toHaveText( '1 quick fix' );
		await expect( page.locator( CTA ) ).toHaveText( 'Fix now' );
	} );

	test( 'Shows a green dot, no quick fixes and a report link when the site is strong', async ( { page } ) => {
		// Arrange.
		await seedReport( SCORE_STRONG, [ 'partial', 'pass' ] );

		// Act.
		await page.reload();

		// Assert.
		await expect( page.locator( BLOCK ) ).toContainText( `${ SCORE_STRONG }/100 · Strong` );
		await expect( page.locator( DOT ) ).toHaveCSS( 'background-color', 'rgb(0, 163, 42)' );
		await expect( page.locator( META ) ).toHaveCount( 0 );
		await expect( page.locator( CTA ) ).toHaveText( 'View report' );
	} );

	test( 'Routes the CTA to the Agent Ready scanner page', async ( { page } ) => {
		// Act.
		await page.reload();

		// Assert.
		await expect( page.locator( CTA ) ).toHaveAttribute( 'href', new RegExp( SCANNER_PAGE ) );
	} );

	test( 'Tracks the CTA click with the current state', async ( { page } ) => {
		// Arrange.
		await seedReport( SCORE_NEEDS_WORK, [ 'fail' ] );
		await page.reload();
		await captureTrackedEvents( page );

		// Act.
		await page.locator( CTA ).click();

		// Assert.
		const tracked = await getTrackedEvents( page );

		expect( tracked ).toHaveLength( 1 );
		expect( tracked[ 0 ][ 0 ] ).toBe( TRACKING_EVENT );
		expect( tracked[ 0 ][ 1 ] ).toMatchObject( {
			window_name: 'wp_dashboard',
			target_name: 'dashboard_cta',
			interaction_result: 'needs_work',
		} );
	} );
} );
