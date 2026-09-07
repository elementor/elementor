import { BrowserContext, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const COLOR_RED = '#ff0000';
const COLOR_GREEN = '#00ff00';
const COLOR_BLUE = '#0000ff';
    10|const COLOR_RED_RGB = 'rgb(255, 0, 0)';
const COLOR_GREEN_RGB = 'rgb(0, 255, 0)';
const COLOR_BLUE_RGB = 'rgb(0, 0, 255)';

test.describe( 'Nested atomic element style-event dispatch dedup @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
    20|		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

    30|	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	test( 'pre-styled nested elements have computed CSS applied on first paint', async () => {
		const outerId = await editor.addElement( { elType: 'container' }, 'document' );
		const innerId = await editor.addElement( { elType: 'container' }, outerId );
		await editor.addWidget( { widgetType: 'e-heading', container: innerId } );

		await editor.v4Panel.openTab( 'style' );
    40|		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( COLOR_RED );

		await editor.publishAndViewPage();

		const published = editor.page.locator( '.e-heading-base' );
		await expect( published ).toBeVisible( { timeout: timeouts.navigation } );
		await expect( published ).toHaveCSS( 'background-color', COLOR_RED_RGB );
	} );

    50|	test( 'edits to a nested container style prop update CSS', async () => {
		const outerId = await editor.addElement( { elType: 'container' }, 'document' );
		const innerId = await editor.addElement( { elType: 'container' }, outerId );
		await editor.addWidget( { widgetType: 'e-heading', container: innerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( COLOR_GREEN );

		const element = editor.getPreviewFrame().locator( '.e-heading-base' );
    60|		await expect( element ).toHaveCSS( 'background-color', COLOR_GREEN_RGB, { timeout: timeouts.expect } );
	} );

	test( 'rapid consecutive style edits end at last value (no stuck ref-equality skip)', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );

    70|		await editor.v4Panel.style.setBackgroundColor( COLOR_RED );
		await editor.v4Panel.style.setBackgroundColor( COLOR_GREEN );
		await editor.v4Panel.style.setBackgroundColor( COLOR_BLUE );

		const element = editor.getPreviewFrame().locator( '.e-heading-base' );
		await expect( element ).toHaveCSS( 'background-color', COLOR_BLUE_RGB, { timeout: timeouts.expect } );
	} );

	test( 'add and remove global class both update CSS on nested container', async () => {
		const outerId = await editor.addElement( { elType: 'container' }, 'document' );
    80|		const innerId = await editor.addElement( { elType: 'container' }, outerId );
		await editor.addWidget( { widgetType: 'e-heading', container: innerId } );

		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( COLOR_RED );

		await editor.v4Panel.style.addGlobalClass( 'dedup-nested-class' );
		const element = editor.getPreviewFrame().locator( '.e-heading-base' );
		await expect( element ).toHaveClass( /dedup-nested-class/, { timeout: timeouts.expect } );

    90|		await editor.v4Panel.style.removeGlobalClass( 'dedup-nested-class' );
		await expect( element ).not.toHaveClass( /dedup-nested-class/, { timeout: timeouts.expect } );
		await expect( element ).toHaveCSS( 'background-color', COLOR_RED_RGB );
	} );
} );
