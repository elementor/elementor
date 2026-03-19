import { expect, Page, Request, TestInfo } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import { timeouts } from '../config/timeouts';

const EXPERIMENT_ID = 'editor_loading_optimization';

type LazyControlConfig = {
	name: string;
	widgetType: string;
	scriptUrlPattern: RegExp;
	initializedSelector: string;
};

const LAZY_CONTROLS: LazyControlConfig[] = [
	{
		name: 'Code (ACE Editor)',
		widgetType: 'html',
		scriptUrlPattern: /ace-builds.*\/ace(\.min)?\.js/,
		initializedSelector: '.elementor-code-editor.ace_editor',
	},
];

async function trackNetworkRequests(
	page: Page,
	pattern: RegExp,
	action: () => Promise<unknown>,
	stopWhen?: () => Promise<unknown>,
): Promise<Request[]> {
	const matchedRequests: Request[] = [];

	const capture = ( req: Request ) => {
		if ( pattern.test( req.url() ) ) {
			matchedRequests.push( req );
		}
	};

	page.on( 'request', capture );

	if ( stopWhen ) {
		const actionPromise = action();
		await stopWhen();
		page.off( 'request', capture );
		await actionPromise;
	} else {
		await action();
		page.off( 'request', capture );
	}

	return matchedRequests;
}

async function isScriptPhpEnqueued( page: Page, pattern: RegExp ): Promise<boolean> {
	return page.evaluate( ( patternStr ) => {
		const scriptPattern = new RegExp( patternStr );
		return Array.from( document.querySelectorAll( 'script[src]:not([data-elementor-lazy])' ) )
			.some( ( scriptTag ) => scriptPattern.test( scriptTag.getAttribute( 'src' ) ?? '' ) );
	}, pattern.source );
}

async function waitForEditorTTI( page: Page ): Promise<void> {
	await page.waitForSelector( '#elementor-loading', { state: 'visible', timeout: timeouts.heavyAction } );
	await page.waitForSelector( '#elementor-loading', { state: 'hidden', timeout: timeouts.heavyAction } );
}

async function reportTiming( testInfo: TestInfo, label: string, ms: number ): Promise<void> {
	const entry = `[editor-performance] ${ label }: ${ ms }ms`;

	testInfo.annotations.push( { type: label, description: `${ ms }ms` } );

	await testInfo.attach( label, {
		contentType: 'text/plain',
		body: Buffer.from( entry ),
	} );
}

test.describe( 'Editor Performance — Lazy Control Scripts', () => {
	test.afterEach( async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { [ EXPERIMENT_ID ]: 'default' } );
	} );

	for ( const control of LAZY_CONTROLS ) {
		test( `${ control.name }: library is loaded on editor page load when experiment is OFF`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_ID ]: false } );

			// Act.
			const start = Date.now();
			const pagePromise = wpAdmin.openNewPage();
			await waitForEditorTTI( page );
			await reportTiming( testInfo, `Editor TTI — ${ control.name } — Experiment OFF`, Date.now() - start );
			await pagePromise;

			// Assert.
			expect( await isScriptPhpEnqueued( page, control.scriptUrlPattern ) ).toBe( true );
		} );

		test( `${ control.name }: library is NOT loaded as a blocking script when experiment is ON`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_ID ]: true } );

			// Act.
			const start = Date.now();
			const pagePromise = wpAdmin.openNewPage();
			await waitForEditorTTI( page );
			await reportTiming( testInfo, `Editor TTI — ${ control.name } — Experiment ON`, Date.now() - start );
			await pagePromise;

			// Assert.
			expect( await isScriptPhpEnqueued( page, control.scriptUrlPattern ) ).toBe( false );
		} );

		test( `${ control.name }: library loads when the control panel is opened with experiment ON`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_ID ]: true } );
			const editor = await wpAdmin.openNewPage();

			// Act.
			const start = Date.now();
			await editor.addWidget( { widgetType: control.widgetType } );
			await reportTiming( testInfo, `${ control.name } library load time after panel open`, Date.now() - start );

			// Assert.
			await expect( page.locator( control.initializedSelector ) ).toBeVisible( { timeout: timeouts.longAction } );
		} );
	}
} );
