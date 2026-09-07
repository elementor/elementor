import { BrowserContext, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const WIDGET_ONE_COLOR = '#ff0000';
const WIDGET_TWO_COLOR = '#0000ff';
const WIDGET_ONE_RGB = 'rgb(255, 0, 0)';
const WIDGET_TWO_RGB = 'rgb(0, 0, 255)';
const CONTAINER_COLOR = '#00ff00';
const CONTAINER_RGB = 'rgb(0, 255, 0)';

test.describe( 'Render cascade — simple elements @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	test( 'editing one widget style does not disturb sibling widget DOM', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const widgetOneId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const widgetTwoId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.selectElement( widgetTwoId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( WIDGET_TWO_COLOR );

		await editor.selectElement( widgetOneId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( WIDGET_ONE_COLOR );

		const previewFrame = editor.getPreviewFrame();
		const widgetOne = previewFrame.locator( `[data-id="${ widgetOneId }"] .e-heading-base` );
		const widgetTwo = previewFrame.locator( `[data-id="${ widgetTwoId }"] .e-heading-base` );

		await expect( widgetOne ).toHaveCSS( 'background-color', WIDGET_ONE_RGB, { timeout: timeouts.expect } );
		await expect( widgetTwo ).toHaveCSS( 'background-color', WIDGET_TWO_RGB );
	} );

	test( 'editing root container style keeps child widgets rendered', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container: containerId } );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container: containerId } );

		await editor.selectElement( containerId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( CONTAINER_COLOR );

		const previewFrame = editor.getPreviewFrame();
		const container = previewFrame.locator( `[data-id="${ containerId }"]` );
		const heading = previewFrame.locator( `[data-id="${ headingId }"] .e-heading-base` );
		const button = previewFrame.locator( `[data-id="${ buttonId }"] .e-button-base` );

		await expect( container ).toHaveCSS( 'background-color', CONTAINER_RGB, { timeout: timeouts.expect } );
		await expect( heading ).toBeVisible();
		await expect( button ).toBeVisible();
	} );

	test( 'undo after edit restores previous DOM (skipped-render invalidation)', async () => {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await editor.selectElement( containerId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
		await editor.v4Panel.style.setBackgroundColor( CONTAINER_COLOR );

		const previewFrame = editor.getPreviewFrame();
		const container = previewFrame.locator( `[data-id="${ containerId }"]` );
		await expect( container ).toHaveCSS( 'background-color', CONTAINER_RGB, { timeout: timeouts.expect } );

		await editor.page.keyboard.press( 'Control+Z' );
		await expect( container ).not.toHaveCSS( 'background-color', CONTAINER_RGB, { timeout: timeouts.expect } );

		const heading = previewFrame.locator( '.e-heading-base' );
		await expect( heading ).toBeVisible();
	} );
} );
