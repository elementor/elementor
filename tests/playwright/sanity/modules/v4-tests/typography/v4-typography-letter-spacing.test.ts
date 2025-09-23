import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const WIDGET_CONFIGS = [
	{ type: 'e-heading', selector: '.e-heading-base' },
	{ type: 'e-paragraph', selector: '.e-paragraph-base' },
	{ type: 'e-button', selector: '.e-button-base' },
];

const TEST_FONTS = {
	SYSTEM: [
		{ name: 'Arial', type: 'system' as const },
		{ name: 'Times New Roman', type: 'system' as const },
	],
};

const LETTER_SPACING_VALUES = {
	POSITIVE: [ 1, 2.5, 5 ],
	NEGATIVE: [ -1, -2.5, -5 ],
	UNITS: [ 'px', 'em', 'rem', 'vw', 'vh', '%' ],
};

test.describe( 'V4 Typography Letter Spacing Tests @v4-tests', () => {
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

	async function setupWidgetWithTypography( widgetType: string ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const widgetId = await editor.addWidget( { widgetType, container: containerId } );
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		// Click "Show More" button to reveal letter spacing control
		const showMoreButton = page.locator( 'button', { hasText: 'Show More' } );
		await expect( showMoreButton ).toBeVisible( { timeout: timeouts.expect } );
		await showMoreButton.click();

		return { containerId, widgetId };
	}

	async function verifyLetterSpacing( selector: string, expectedValue: number, expectedUnit: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );

		// Wait for styles to be applied using explicit wait
		await expect( async () => {
			const computedStyles = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					letterSpacing: styles.letterSpacing,
					fontSize: parseFloat( styles.fontSize ),
					windowWidth: window.innerWidth,
				};
			} );

			// For 'normal' letter spacing (0), browsers might return 'normal' or '0px'
			if ( 0 === expectedValue ) {
				expect( [ 'normal', '0px', 'normal normal' ].includes( computedStyles.letterSpacing ) ).toBeTruthy();
				return;
			}

			// For non-zero values, verify the computed value
			// Handle different CSS letter-spacing formats
			const letterSpacingStr = computedStyles.letterSpacing;
			let computedValue;

			if ( 'normal' === letterSpacingStr || '0px' === letterSpacingStr ) {
				computedValue = 0;
			} else if ( letterSpacingStr.includes( '-' ) ) {
			// Extract numeric value from negative CSS value like "-1px"
				const numericPart = letterSpacingStr.replace( /[^0-9.]/g, '' );
				computedValue = -parseFloat( numericPart );
			} else {
			// Extract numeric value from positive CSS value like "1px"
				const numericPart = letterSpacingStr.replace( /[^0-9.]/g, '' );
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
			}

			// Compare the computed value in pixels with a tolerance
			expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
		} ).toPass( { timeout: timeouts.expect } );
	}

	test.describe( 'Letter Spacing Basic Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		test( 'Letter spacing control is present and functional', async () => {
			await setupWidgetWithTypography( testWidget );

			const letterSpacingLabel = page.locator( 'label', { hasText: 'Letter Spacing' } );
			await expect( letterSpacingLabel ).toBeVisible( { timeout: timeouts.expect } );

			// Test default value
			await verifyLetterSpacing( testWidgetConfig.selector, 0, 'px' );
		} );

		test( 'Positive letter spacing values', async () => {
			await setupWidgetWithTypography( testWidget );

			for ( const value of LETTER_SPACING_VALUES.POSITIVE ) {
				await editor.v4Panel.setLetterSpacing( value, 'px' );
				await verifyLetterSpacing( testWidgetConfig.selector, value, 'px' );
			}
		} );

		test( 'Negative letter spacing values', async () => {
			await setupWidgetWithTypography( testWidget );

			for ( const value of LETTER_SPACING_VALUES.NEGATIVE ) {
				await editor.v4Panel.setLetterSpacing( value, 'px' );
				// Elementor doesn't support negative letter spacing values in UI
				// So we verify that the value remains at normal (0) instead
				await verifyLetterSpacing( testWidgetConfig.selector, 0, 'px' );
			}
		} );

		// Note: Unit switching tests are covered in v4-typography-letter-spacing-units.test.ts
	} );

	test.describe( 'Letter Spacing with Different Font Families', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		test( 'Letter spacing with different system fonts', async () => {
			await setupWidgetWithTypography( testWidget );
			const testSpacing = 2;
			const testUnit = 'px';

			for ( const font of TEST_FONTS.SYSTEM ) {
				// Set font family
				await editor.v4Panel.setFontFamily( font.name, font.type );

				// Wait for font to be applied
				const frame = editor.getPreviewFrame();
				const element = frame.locator( testWidgetConfig.selector );
				await expect( async () => {
					const fontFamily = await element.evaluate( ( el ) =>
						window.getComputedStyle( el ).fontFamily,
					);
					expect( fontFamily.toLowerCase() ).toContain( font.name.toLowerCase() );
				} ).toPass( { timeout: timeouts.expect } );

				// Set letter spacing
				await editor.v4Panel.setLetterSpacing( testSpacing, testUnit );
				await verifyLetterSpacing( testWidgetConfig.selector, testSpacing, testUnit );
			}
		} );
	} );

	for ( const widget of WIDGET_CONFIGS ) {
		test.describe( `${ widget.type } Widget-Specific Letter Spacing Tests`, () => {
			test( 'Letter spacing persists in published page', async () => {
				await setupWidgetWithTypography( widget.type );

				const testValue = 2.5;
				const testUnit = 'px';
				await editor.v4Panel.setLetterSpacing( testValue, testUnit );
				await verifyLetterSpacing( widget.selector, testValue, testUnit );

				// Handle potential unsaved changes dialog
				page.once( 'dialog', ( dialog ) => dialog.accept() );
				await editor.publishAndViewPage();

				const publishedElement = page.locator( widget.selector );
				await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

				await expect( async () => {
					const publishedLetterSpacing = await publishedElement.evaluate( ( el ) => {
						return window.getComputedStyle( el ).letterSpacing;
					} );

					expect( parseFloat( publishedLetterSpacing ) ).toBeCloseTo( testValue, 1 );
					expect( publishedLetterSpacing ).toContain( testUnit );
				} ).toPass( { timeout: timeouts.expect } );
			} );
		} );
	}
} );
