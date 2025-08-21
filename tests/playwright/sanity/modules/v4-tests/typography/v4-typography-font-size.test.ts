import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';
import { viewportSize } from '../../../../enums/viewport-sizes';

// Constants for test data
const FONT_SIZES = {
	DESKTOP: '24',
	TABLET: '18',
	MOBILE: '16',
};

// Test widget configurations
const WIDGET_CONFIGS = [
	{
		type: 'e-heading',
		selector: '.e-heading-base',
		defaultSize: '32px',
	},
	{
		type: 'e-paragraph',
		selector: '.e-paragraph-base',
		defaultSize: '16px',
	},
	{
		type: 'e-button',
		selector: '.e-button-base',
		defaultSize: '15px',
	},
];

test.describe( 'V4 Typography Font Size Tests @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	const experimentName = 'e_atomic_elements';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { [ experimentName ]: 'active' } );
	} );

	// Test.afterAll( async () => {
	// 	Await wpAdmin.resetExperiments();
	// 	Await context.close();
	// } );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
	} );

	// Helper function to setup widget and open typography section
	async function setupWidgetWithTypography( widgetType: string ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const widgetId = await editor.addWidget( { widgetType, container: containerId } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		return { containerId, widgetId };
	}

	// Helper function to verify font size in preview and published page
	async function verifyFontSize( selector: string, expectedSize: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );

		// Verify in preview
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );
		await expect( element ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );

		// Publish and verify
		await editor.publishAndViewPage();

		const publishedElement = page.locator( selector );
		await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
		await expect( publishedElement ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
	}

	// Helper function to test responsive behavior
	async function testResponsiveBehavior( widgetType: string ) {
		await setupWidgetWithTypography( widgetType );

		// Set desktop size
		await editor.v4Panel.setTypography( { fontSize: FONT_SIZES.DESKTOP } );

		// Switch to tablet and set size
		await editor.changeResponsiveView( 'tablet' );
		await editor.v4Panel.setTypography( { fontSize: FONT_SIZES.TABLET } );

		// Verify tablet size
		let typographyValues = await editor.v4Panel.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.TABLET );

		// Switch to mobile and set size
		await editor.changeResponsiveView( 'mobile' );
		await editor.v4Panel.setTypography( { fontSize: FONT_SIZES.MOBILE } );

		// Verify mobile size
		typographyValues = await editor.v4Panel.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.MOBILE );

		// Switch back to desktop and verify all values persist
		await editor.changeResponsiveView( 'desktop' );
		typographyValues = await editor.v4Panel.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.DESKTOP );

		await editor.changeResponsiveView( 'tablet' );
		typographyValues = await editor.v4Panel.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.TABLET );

		await editor.changeResponsiveView( 'mobile' );
		typographyValues = await editor.v4Panel.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.MOBILE );
	}

	for ( const widget of WIDGET_CONFIGS ) {
		test.describe( `${ widget.type } Font Size Input Functionality`, () => {
			test( 'Numeric input accepts valid font sizes', async () => {
				await setupWidgetWithTypography( widget.type );

				// Test regular number
				await editor.v4Panel.setTypography( { fontSize: '24' } );
				let typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( '24' );

				// Test decimal number
				await editor.v4Panel.setTypography( { fontSize: '24.5' } );
				typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( '24.5' );

				await verifyFontSize( widget.selector, '24.5' );
			} );

			test( 'Font size persists after publishing', async () => {
				await setupWidgetWithTypography( widget.type );
				await editor.v4Panel.setTypography( { fontSize: '22' } );
				await verifyFontSize( widget.selector, '22' );
			} );

			test( 'Responsive font size behavior', async () => {
				await testResponsiveBehavior( widget.type );
			} );

			test( 'EM unit screenshot across breakpoints in editor and published page', async () => {
				await setupWidgetWithTypography( widget.type );
				await editor.v4Panel.setTypography( { fontSize: '24' } );
				await editor.v4Panel.setFontSizeUnit( 'em' );

				const selector = widget.selector;

				// Editor screenshots
				await expect.soft( editor.getPreviewFrame().locator( selector ) )
					.toHaveScreenshot( `${ widget.type }-em-desktop-editor.png` );
				await editor.changeResponsiveView( 'tablet' );
				await page.waitForTimeout( timeouts.short );
				await expect.soft( editor.getPreviewFrame().locator( selector ) )
					.toHaveScreenshot( `${ widget.type }-em-tablet-editor.png` );
				await editor.changeResponsiveView( 'mobile' );
				await page.waitForTimeout( timeouts.short );
				await expect.soft( editor.getPreviewFrame().locator( selector ) )
					.toHaveScreenshot( `${ widget.type }-em-mobile-editor.png` );

				// Published page screenshots
				await editor.publishAndViewPage();
				await page.setViewportSize( viewportSize.desktop );
				await expect.soft( page.locator( selector ) )
					.toHaveScreenshot( `${ widget.type }-em-desktop-published.png` );
				await page.setViewportSize( viewportSize.tablet );
				await expect.soft( page.locator( selector ) )
					.toHaveScreenshot( `${ widget.type }-em-tablet-published.png` );
				await page.setViewportSize( viewportSize.mobile );
				await expect.soft( page.locator( selector ) )
					.toHaveScreenshot( `${ widget.type }-em-mobile-published.png` );
			} );
			test( 'Panel-only unit switching functionality', async () => {
				await setupWidgetWithTypography( widget.type );

				const units = [ 'px', 'em', 'rem', 'vw', '%' ];
				for ( const unit of units ) {
					await editor.v4Panel.setFontSizeUnit( unit );
					const unitButton = page.getByRole( 'button', { name: new RegExp( `^${ unit }$`, 'i' ) } ).first();
					const unitButtonText = await unitButton.textContent();
					expect( unitButtonText.toLowerCase() ).toBe( unit.toLowerCase() );
				}
			} );
		} );
	}
} );
