import { BrowserContext, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const COLOR_A = '#ff0000';
const COLOR_B = '#00ff00';
const COLOR_A_RGB = 'rgb(255, 0, 0)';
    10|const COLOR_B_RGB = 'rgb(0, 255, 0)';

test.describe( 'rAF-coalesced document elements styles subscribe @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
    20|		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
    30|		editor = await wpAdmin.openNewPage();
	} );

	test( 'single style edit applies CSS after batching frame', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( COLOR_A );
    40|
		const element = editor.getPreviewFrame().locator( '.e-heading-base' );
		await expect( element ).toHaveCSS( 'background-color', COLOR_A_RGB, { timeout: timeouts.expect } );
	} );

	test( 'burst of rapid style edits ends with the last value applied', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
    50|		await editor.v4Panel.style.openSection( 'Background' );

		await editor.v4Panel.style.setBackgroundColor( COLOR_A );
		await editor.v4Panel.style.setBackgroundColor( COLOR_B );

		const element = editor.getPreviewFrame().locator( '.e-heading-base' );
		await expect( element ).toHaveCSS( 'background-color', COLOR_B_RGB, { timeout: timeouts.expect } );
	} );

	test( 'add then remove global class ends with the correct final CSS', async () => {
    60|		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( COLOR_A );

		await editor.v4Panel.style.addGlobalClass( 'raf-test-class' );
		await editor.v4Panel.style.removeGlobalClass( 'raf-test-class' );

    70|		const element = editor.getPreviewFrame().locator( '.e-heading-base' );
		await expect( element ).toHaveCSS( 'background-color', COLOR_A_RGB, { timeout: timeouts.expect } );
	} );

	test( 'CSS applied on published page after rAF batching', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
    80|		await editor.v4Panel.style.setBackgroundColor( COLOR_A );

		await editor.publishAndViewPage();

		const published = editor.page.locator( '.e-heading-base' );
		await expect( published ).toBeVisible( { timeout: timeouts.navigation } );
		await expect( published ).toHaveCSS( 'background-color', COLOR_A_RGB );
	} );
} );
