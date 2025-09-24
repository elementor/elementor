import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	WIDGET_CONFIGS,
	FONT_SIZES,
	setupTypographyTestSuite,
	teardownTypographyTestSuite,
	beforeEachTypographyTest,
	setupWidgetWithTypography,
	verifyFontSizePreview,
	verifyFontSizeWithPublishing,
	type TypographyTestSetup,
} from './typography-test-helpers';
import { timeouts } from '../../../../config/timeouts';

test.describe( 'V4 Typography Font Size Tests @v4-tests', () => {
	let setup: TypographyTestSetup;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		setup = await setupTypographyTestSuite( browser, apiRequests, testInfo );
	} );

	test.afterAll( async () => {
		await teardownTypographyTestSuite( setup );
	} );

	test.beforeEach( async () => {
		await beforeEachTypographyTest( setup );
	} );

	// Optimized helper function to test responsive behavior
	async function testResponsiveBehavior( widgetType: string ) {
		await setupWidgetWithTypography( setup.driver, widgetType );

		// Set desktop size
		await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: FONT_SIZES.DESKTOP } );

		// Switch to tablet and set size
		await setup.driver.editor.changeResponsiveView( 'tablet' );
		await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: FONT_SIZES.TABLET } );

		// Verify tablet size
		let typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.TABLET );

		// Switch to mobile and set size
		await setup.driver.editor.changeResponsiveView( 'mobile' );
		await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: FONT_SIZES.MOBILE } );

		// Verify mobile size
		typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.MOBILE );

		// Switch back to desktop and verify all values persist
		await setup.driver.editor.changeResponsiveView( 'desktop' );
		typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.DESKTOP );

		await setup.driver.editor.changeResponsiveView( 'tablet' );
		typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.TABLET );

		await setup.driver.editor.changeResponsiveView( 'mobile' );
		typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
		expect( typographyValues.fontSize ).toBe( FONT_SIZES.MOBILE );
	}

	// Helper for unit testing with cached frame reference
	async function testUnitChange( widgetType: string, unit: string, fontSize: string, expectedMultiplier: number ) {
		await setupWidgetWithTypography( setup.driver, widgetType );
		await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize } );
		await setup.driver.editor.v4Panel.style.typography.setFontSizeUnit( unit );

		const frame = setup.driver.editor.getPreviewFrame();
		const element = frame.locator( WIDGET_CONFIGS[ widgetType.toUpperCase().replace( '-', '_' ) ].selector );

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

	// Common functionality tests - run once with e-heading (most representative widget)
	// These test panel behavior, not widget-specific rendering
	test.describe( 'Common Font Size Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.HEADING;

		test( 'Numeric input accepts valid font sizes', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );

			// Test regular number
			await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: '24' } );
			let typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '24' );

			// Test decimal number
			await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: '24.5' } );
			typographyValues = await setup.driver.editor.v4Panel.style.typography.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '24.5' );

			// Use preview-only verification for better performance
			await verifyFontSizePreview( setup.driver, testWidgetConfig.selector, '24.5' );
		} );

		test( 'Responsive font size behavior', async () => {
			await testResponsiveBehavior( testWidget );
		} );

		test( 'Font size VH unit change', async () => {
			await testUnitChange( testWidget, 'vh', '10', 0.1 );
		} );

		test( 'Font size % unit change', async () => {
			await testUnitChange( testWidget, '%', '50', 0.5 );
		} );

		test( 'Font size VW unit change', async () => {
			await testUnitChange( testWidget, 'vw', '10', 0.1 );
		} );

		test( 'Font size stepper functionality', async () => {
			// Arrange
			await setupWidgetWithTypography( setup.driver, testWidget );

			const INITIAL_FONT_SIZE = 20;
			const DEFAULT_STEP = 1;

			const input = setup.driver.page.locator( 'label', { hasText: 'Font size' } )
				.locator( 'xpath=following::input[1]' );

			// Act - Set initial value
			await input.fill( INITIAL_FONT_SIZE.toString() );

			// Act - Get step value and increase via ArrowUp
			const stepAttr = await input.getAttribute( 'step' );
			const step = stepAttr && stepAttr !== 'any' ? parseFloat( stepAttr ) : DEFAULT_STEP;

			await input.press( 'ArrowUp' );

			// Assert - Value should increase by step amount
			const expectedIncreasedValue = ( INITIAL_FONT_SIZE + step ).toString();
			await expect( input ).toHaveValue( expectedIncreasedValue );

			// Act - Decrease value via ArrowDown
			await input.press( 'ArrowDown' );

			// Assert - Value should return to initial
			await expect( input ).toHaveValue( INITIAL_FONT_SIZE.toString() );
		} );

		test( 'Panel-only unit switching functionality', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );
			const units = [ 'px', 'em', 'rem', 'vw', '%' ];

			for ( const unit of units ) {
				await setup.driver.editor.v4Panel.style.typography.setFontSizeUnit( unit );
				const unitButton = setup.driver.page.getByRole( 'button', { name: new RegExp( `^${ unit }$`, 'i' ) } ).first();
				const unitButtonText = await unitButton.textContent();
				expect( unitButtonText.toLowerCase() ).toBe( unit.toLowerCase() );
			}
		} );
	} );

	// Widget-specific tests - these need to run for each widget as they test rendering/visual behavior
	// Only tests that verify widget-specific rendering differences
	const widgetConfigs = [
		{ type: 'e-heading', config: WIDGET_CONFIGS.HEADING },
		{ type: 'e-paragraph', config: WIDGET_CONFIGS.PARAGRAPH },
		{ type: 'e-button', config: WIDGET_CONFIGS.BUTTON },
	];

	for ( const widget of widgetConfigs ) {
		test.describe( `${ widget.type } Widget-Specific Rendering Tests`, () => {
			test( 'Font size persists after publishing', async () => {
				await setupWidgetWithTypography( setup.driver, widget.type );
				await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: '22' } );
				// This test specifically needs publishing verification per widget
				await verifyFontSizeWithPublishing( setup.driver, widget.config.selector, '22' );
			} );

			test( 'Font size unit change with screenshots', async () => {
				await setupWidgetWithTypography( setup.driver, widget.type );
				await setup.driver.editor.v4Panel.style.typography.setTypography( { fontSize: '10' } );
				await setup.driver.editor.v4Panel.style.typography.setFontSizeUnit( 'em' );

				const selector = widget.config.selector;

				// Only take screenshots when explicitly needed (e.g., for visual regression tests)
				// Consider moving screenshots to a separate test suite or using test annotations
				if ( 'true' === process.env.TAKE_SCREENSHOTS ) {
					// Editor screenshot
					await expect.soft( setup.driver.editor.getPreviewFrame().locator( selector ) )
						.toHaveScreenshot( `${ widget.type }-em-desktop-editor.png`, { timeout: timeouts.medium } );

					// Published page screenshot
					await setup.driver.editor.publishAndViewPage();
					await expect.soft( setup.driver.page.locator( selector ) )
						.toHaveScreenshot( `${ widget.type }-em-desktop-published.png`, { timeout: timeouts.medium } );
				} else {
					// Just verify the unit change works without screenshots
					const frame = setup.driver.editor.getPreviewFrame();
					const element = frame.locator( selector );
					await expect( element ).toBeVisible();
				}
			} );
		} );
	}
} );
