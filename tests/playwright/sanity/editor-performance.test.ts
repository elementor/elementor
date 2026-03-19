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
		initializedSelector: '.elementor-code-editor .ace_editor',
	},
];

async function collectMatchingRequests(
	page: Page,
	pattern: RegExp,
	action: () => Promise<void>,
): Promise<Request[]> {
	const matched: Request[] = [];
	const capture = ( req: Request ) => {
		if ( pattern.test( req.url() ) ) {
			matched.push( req );
		}
	};

	page.on( 'request', capture );
	await action();
	page.off( 'request', capture );

	return matched;
}

async function reportTiming( testInfo: TestInfo, label: string, ms: number ): Promise<void> {
	const entry = `[editor-performance] ${ label }: ${ ms }ms`;

	console.log( entry );

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
			const libraryRequests = await collectMatchingRequests( page, control.scriptUrlPattern, () => wpAdmin.openNewPage() );
			await reportTiming( testInfo, `Editor TTI — ${ control.name } — Experiment OFF`, Date.now() - start );

			// Assert.
			expect( libraryRequests.length ).toBeGreaterThan( 0 );
		} );

		test( `${ control.name }: library is NOT loaded on editor page load when experiment is ON`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_ID ]: true } );

			// Act.
			const start = Date.now();
			const libraryRequests = await collectMatchingRequests( page, control.scriptUrlPattern, () => wpAdmin.openNewPage() );
			await reportTiming( testInfo, `Editor TTI — ${ control.name } — Experiment ON`, Date.now() - start );

			// Assert.
			expect( libraryRequests.length ).toBe( 0 );
		} );

		test( `${ control.name }: library loads when the control panel is opened with experiment ON`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.setExperiments( { [ EXPERIMENT_ID ]: true } );
			const editor = await wpAdmin.openNewPage();

			const libraryRequestPromise = page.waitForRequest(
				( req ) => control.scriptUrlPattern.test( req.url() ),
				{ timeout: timeouts.longAction },
			);

			// Act.
			const start = Date.now();
			await editor.addWidget( { widgetType: control.widgetType } );
			const libraryRequest = await libraryRequestPromise;
			await reportTiming( testInfo, `${ control.name } library load time after panel open`, Date.now() - start );

			// Assert.
			expect( control.scriptUrlPattern.test( libraryRequest.url() ) ).toBe( true );
			await expect( page.locator( control.initializedSelector ) ).toBeVisible( { timeout: timeouts.longAction } );
		} );
	}
} );
