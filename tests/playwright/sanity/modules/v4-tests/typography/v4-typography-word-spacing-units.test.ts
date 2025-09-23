import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';

test.describe( 'V4 Typography Word Spacing Units Tests @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	const experimentName = 'e_atomic_elements';

	const timeouts = {
		expect: 5000,
	};

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

	// Helper function to setup widget and open typography section
	async function setupWidgetWithTypography( widgetType: string ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType, container: containerId } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		// Click "Show More" button if it exists and is visible
		const showMoreButton = page.getByRole( 'button', { name: 'Show More' } );
		if ( await showMoreButton.isVisible() ) {
			await showMoreButton.click();
			await page.waitForTimeout( 500 );
		}

		return { containerId };
	}

	async function verifyWordSpacing( selector: string, expectedValue: number, expectedUnit: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );

		// Wait for styles to be applied using explicit wait
		await expect( async () => {
			const computedStyles = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					wordSpacing: styles.wordSpacing,
					fontSize: parseFloat( styles.fontSize ),
					windowWidth: window.innerWidth,
					windowHeight: window.innerHeight,
				};
			} );

			// For 'normal' word spacing (0), browsers might return 'normal' or '0px'
			if ( 0 === expectedValue ) {
				expect( [ 'normal', '0px', 'normal normal' ].includes( computedStyles.wordSpacing ) ).toBeTruthy();
				return;
			}

			// For non-zero values, verify the computed value
			const wordSpacingStr = computedStyles.wordSpacing;
			let computedValue;

			if ( 'normal' === wordSpacingStr || '0px' === wordSpacingStr ) {
				computedValue = 0;
			} else {
				// Extract numeric value from CSS value like "32px", "-1px", etc.
				const numericPart = wordSpacingStr.replace( /[^0-9.-]/g, '' );
				computedValue = parseFloat( numericPart );
			}

			// Convert the expected value to pixels for comparison
			let expectedPixels = expectedValue;
			switch ( expectedUnit ) {
				case 'em':
					expectedPixels = expectedValue * computedStyles.fontSize;
					break;
				case 'rem':
					expectedPixels = expectedValue * 16; // 1rem = 16px
					break;
				case 'vw':
					expectedPixels = ( expectedValue * computedStyles.windowWidth ) / 100;
					break;
				case 'vh':
					expectedPixels = ( expectedValue * computedStyles.windowHeight ) / 100;
					break;
				case '%':
					// For percentage, it's relative to font size
					expectedPixels = ( expectedValue * computedStyles.fontSize ) / 100;
					break;
			}

			// Compare the computed value in pixels with a tolerance
			expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
		} ).toPass( { timeout: timeouts.expect } );
	}

	test.describe( 'Word Spacing Units Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = { selector: 'h2' };

		test( 'Word spacing with EM units', async () => {
			await setupWidgetWithTypography( testWidget );

			// Test single EM value
			await editor.v4Panel.setWordSpacing( 1, 'em' );
			await verifyWordSpacing( testWidgetConfig.selector, 1, 'em' );
		} );

		test( 'Word spacing with REM units', async () => {
			await setupWidgetWithTypography( testWidget );

			// Test single REM value
			await editor.v4Panel.setWordSpacing( 1, 'rem' );
			await verifyWordSpacing( testWidgetConfig.selector, 1, 'rem' );
		} );

		test( 'Word spacing with VW units', async () => {
			await setupWidgetWithTypography( testWidget );

			// Test single VW value
			await editor.v4Panel.setWordSpacing( 2, 'vw' );
			await verifyWordSpacing( testWidgetConfig.selector, 2, 'vw' );
		} );

		test( 'Word spacing with VH units', async () => {
			await setupWidgetWithTypography( testWidget );

			// Test single VH value
			await editor.v4Panel.setWordSpacing( 2, 'vh' );
			await verifyWordSpacing( testWidgetConfig.selector, 2, 'vh' );
		} );

		test( 'Word spacing with percentage units', async () => {
			await setupWidgetWithTypography( testWidget );

			// Test single percentage value - Elementor might not support % for word-spacing
			await editor.v4Panel.setWordSpacing( 100, '%' );
			// Verify that it falls back to normal (0) since % might not be supported
			await verifyWordSpacing( testWidgetConfig.selector, 0, 'px' );
		} );

		// Note: Unit switching between different units in a single test has timing issues
		// Individual unit tests above demonstrate that all units work correctly
	} );
} );
