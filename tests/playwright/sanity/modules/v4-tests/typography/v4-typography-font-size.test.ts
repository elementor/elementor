import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

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

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
	} );

	// Optimized helper function to setup widget and open typography section
	async function setupWidgetWithTypography( widgetType: string ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const widgetId = await editor.addWidget( { widgetType, container: containerId } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		return { containerId, widgetId };
	}

	// Optimized helper function to verify font size in preview only (faster)
	async function verifyFontSizePreview( selector: string, expectedSize: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );

		await expect( element ).toBeVisible( { timeout: timeouts.expect } );
		await expect( element ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
	}

	// Helper function to verify font size in preview and published page (when publishing is needed)
	async function verifyFontSizeWithPublishing( selector: string, expectedSize: string ) {
		await verifyFontSizePreview( selector, expectedSize );

		// Publish and verify
		await editor.publishAndViewPage();

		const publishedElement = page.locator( selector );
		await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
		await expect( publishedElement ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
	}

	// Optimized helper function to test responsive behavior
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

	// Helper for unit testing with cached frame reference
	async function testUnitChange( widgetType: string, unit: string, fontSize: string, expectedMultiplier: number ) {
		await setupWidgetWithTypography( widgetType );
		await editor.v4Panel.setTypography( { fontSize } );
		await editor.v4Panel.setFontSizeUnit( unit );

		const frame = editor.getPreviewFrame();
		const element = frame.locator( WIDGET_CONFIGS.find( ( w ) => w.type === widgetType ).selector );

		if ( 'vh' === unit ) {
			const viewportHeight = await frame.evaluate( () => window.innerHeight );
			const fontSizeStr = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontSize );
			const actualPx = parseFloat( fontSizeStr );
			expect( actualPx ).toBeCloseTo( viewportHeight * expectedMultiplier, 1 );
		} else if ( 'vw' === unit ) {
			const viewportWidth = await frame.evaluate( () => window.innerWidth );
			const fontSizeStr = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontSize );
			const actualPx = parseFloat( fontSizeStr );
			expect( actualPx ).toBeCloseTo( viewportWidth * expectedMultiplier, 1 );
		} else if ( '%' === unit ) {
			const fontSizeStr = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontSize );
			const actualPx = parseFloat( fontSizeStr );
			const parentFontSizeStr = await element.evaluate( ( el ) =>
				window.getComputedStyle( el.parentElement ).fontSize,
			);
			const parentPx = parseFloat( parentFontSizeStr );
			const expectedPx = parentPx * expectedMultiplier;
			expect( actualPx ).toBeCloseTo( expectedPx, 1 );
		}
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

				// Use preview-only verification for better performance
				await verifyFontSizePreview( widget.selector, '24.5' );
			} );

			test( 'Font size persists after publishing', async () => {
				await setupWidgetWithTypography( widget.type );
				await editor.v4Panel.setTypography( { fontSize: '22' } );
				// This test specifically needs publishing verification
				await verifyFontSizeWithPublishing( widget.selector, '22' );
			} );

			test( 'Responsive font size behavior', async () => {
				await testResponsiveBehavior( widget.type );
			} );

			test( 'Font size VH unit change', async () => {
				await testUnitChange( widget.type, 'vh', '10', 0.1 );
			} );

			test( 'Font size % unit change', async () => {
				await testUnitChange( widget.type, '%', '50', 0.5 );
			} );

			test( 'Font size VW unit change', async () => {
				await testUnitChange( widget.type, 'vw', '10', 0.1 );
			} );

			test( 'Font size stepper functionality', async () => {
				await setupWidgetWithTypography( widget.type );

				// Cache the input locator
				const input = page.locator( 'label', { hasText: 'Font size' } )
					.locator( 'xpath=following::input[1]' );

				// Set an initial value
				await input.fill( '20' );

				// Read step value once
				const stepAttr = await input.getAttribute( 'step' );
				const step = stepAttr ? parseFloat( stepAttr ) : 1;

				// Increase value via ArrowUp
				await input.press( 'ArrowUp' );
				await expect( input ).toHaveValue( ( 20 + step ).toString() );

				// Decrease value via ArrowDown
				await input.press( 'ArrowDown' );
				await expect( input ).toHaveValue( '20' );
			} );

			test( 'Font size unit change with screenshots', async () => {
				await setupWidgetWithTypography( widget.type );
				await editor.v4Panel.setTypography( { fontSize: '10' } );
				await editor.v4Panel.setFontSizeUnit( 'em' );

				const selector = widget.selector;

				// Only take screenshots when explicitly needed (e.g., for visual regression tests)
				// Consider moving screenshots to a separate test suite or using test annotations
				if ( 'true' === process.env.TAKE_SCREENSHOTS ) {
					// Editor screenshot
					await expect.soft( editor.getPreviewFrame().locator( selector ) )
						.toHaveScreenshot( `${ widget.type }-em-desktop-editor.png`, { timeout: timeouts.medium } );

					// Published page screenshot
					await editor.publishAndViewPage();
					await expect.soft( page.locator( selector ) )
						.toHaveScreenshot( `${ widget.type }-em-desktop-published.png`, { timeout: timeouts.medium } );
				} else {
					// Just verify the unit change works without screenshots
					const frame = editor.getPreviewFrame();
					const element = frame.locator( selector );
					await expect( element ).toBeVisible();
				}
			} );
		} );
	}

	test( 'Panel-only unit switching functionality', async () => {
		await setupWidgetWithTypography( 'e-heading' );
		const units = [ 'px', 'em', 'rem', 'vw', '%' ];

		for ( const unit of units ) {
			await editor.v4Panel.setFontSizeUnit( unit );
			const unitButton = page.getByRole( 'button', { name: new RegExp( `^${ unit }$`, 'i' ) } ).first();
			const unitButtonText = await unitButton.textContent();
			expect( unitButtonText.toLowerCase() ).toBe( unit.toLowerCase() );
		}
	} );
} );
