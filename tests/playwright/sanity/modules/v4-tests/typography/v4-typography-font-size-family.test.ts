import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

// Combined test settings
const FONT_SIZE = '24';
const FONT_FAMILY = { name: 'Arial', type: 'system' as const };
const SELECTORS = {
	heading: '.e-heading-base',
	paragraph: '.e-paragraph-base',
};

test.describe( 'V4 Typography Combined Font Size and Family Tests @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	const experimentName = 'e_atomic_elements';

	// Helper to add widget and open typography controls
	async function addWidgetAndOpenTypography( widgetType: string, containerId: string ) {
		const widgetId = await editor.addWidget( { widgetType, container: containerId } );
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();
		return widgetId;
	}

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { [ experimentName ]: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
	} );

	test( 'Heading font size and family apply correctly in editor and published page', async () => {
		// Add container and heading widget
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await addWidgetAndOpenTypography( 'e-heading', containerId );

		// Apply settings to heading
		await editor.v4Panel.setTypography( { fontSize: FONT_SIZE } );
		await editor.v4Panel.setFontFamily( FONT_FAMILY.name, FONT_FAMILY.type );

		// Verify in editor preview
		const frame = editor.getPreviewFrame();
		const headingEl = frame.locator( SELECTORS.heading );
		await expect( headingEl ).toBeVisible( { timeout: timeouts.expect } );
		await expect( headingEl ).toHaveCSS( 'font-size', `${ FONT_SIZE }px`, { timeout: timeouts.expect } );
		const computedFamily = await headingEl.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
		expect( computedFamily.toLowerCase() ).toContain( FONT_FAMILY.name.toLowerCase() );

		// Verify after publishing
		await editor.publishAndViewPage();
		const publishedHeadingEl = page.locator( SELECTORS.heading );
		await expect( publishedHeadingEl ).toBeVisible( { timeout: timeouts.navigation } );
		await expect( publishedHeadingEl ).toHaveCSS( 'font-size', `${ FONT_SIZE }px`, { timeout: timeouts.expect } );
		const publishedComputedFamily = await publishedHeadingEl.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
		expect( publishedComputedFamily.toLowerCase() ).toContain( FONT_FAMILY.name.toLowerCase() );
	} );

	test( 'Paragraph font size and family apply correctly in editor and published page', async () => {
		// Add container and paragraph widget
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await addWidgetAndOpenTypography( 'e-paragraph', containerId );

		// Apply settings to paragraph
		await editor.v4Panel.setTypography( { fontSize: FONT_SIZE } );
		await editor.v4Panel.setFontFamily( FONT_FAMILY.name, FONT_FAMILY.type );

		// Verify in editor preview
		const frame = editor.getPreviewFrame();
		const paragraphEl = frame.locator( SELECTORS.paragraph );
		await expect( paragraphEl ).toBeVisible( { timeout: timeouts.expect } );
		await expect( paragraphEl ).toHaveCSS( 'font-size', `${ FONT_SIZE }px`, { timeout: timeouts.expect } );
		const computedFamily = await paragraphEl.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
		expect( computedFamily.toLowerCase() ).toContain( FONT_FAMILY.name.toLowerCase() );

		// Verify after publishing
		await editor.publishAndViewPage();
		const publishedParagraphEl = page.locator( SELECTORS.paragraph );
		await expect( publishedParagraphEl ).toBeVisible( { timeout: timeouts.navigation } );
		await expect( publishedParagraphEl ).toHaveCSS( 'font-size', `${ FONT_SIZE }px`, { timeout: timeouts.expect } );
		const publishedComputedFamily = await publishedParagraphEl.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
		expect( publishedComputedFamily.toLowerCase() ).toContain( FONT_FAMILY.name.toLowerCase() );
	} );
} );
