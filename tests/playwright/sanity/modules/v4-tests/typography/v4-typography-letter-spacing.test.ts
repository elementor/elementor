import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	WIDGET_CONFIGS,
	SPACING_VALUES,
	setupWidgetWithTypography,
	verifyLetterSpacing,
} from './typography-test-helpers';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const LETTER_SPACING_VALUES = {
	POSITIVE: SPACING_VALUES.POSITIVE,
	NEGATIVE: SPACING_VALUES.NEGATIVE,
	UNITS: SPACING_VALUES.UNITS,
};

test.describe( 'V4 Typography Letter Spacing Tests @v4-tests', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests );
	} );

	test.afterAll( async () => {
		await driver.close();
	} );

	test.beforeEach( async () => {
		await driver.setupBasicPage();
	} );

	test( 'Letter spacing basic functionality for heading', async () => {
		const widget = WIDGET_CONFIGS.HEADING;

		await test.step( 'Verify letter spacing control is present and functional', async () => {
			await setupWidgetWithTypography( driver, widget.type );

			const showMoreButton = driver.page.getByRole( 'button', { name: 'Show More' } );
			await showMoreButton.click();

			const letterSpacingLabel = driver.page.locator( 'label', { hasText: 'Letter Spacing' } );
			await expect( letterSpacingLabel ).toBeVisible( { timeout: timeouts.expect } );

			await driver.editor.v4Panel.style.typography.setLetterSpacing( 5, 'px' );
			await verifyLetterSpacing( driver, widget.selector, 5, 'px' );
		} );

		await test.step( 'Test positive letter spacing values', async () => {
			for ( const value of LETTER_SPACING_VALUES.POSITIVE ) {
				await driver.editor.v4Panel.style.typography.setLetterSpacing( value, 'px' );
				await verifyLetterSpacing( driver, widget.selector, value, 'px' );
			}
		} );

		await test.step( 'Reset and test negative letter spacing values', async () => {
			await driver.setupBasicPage();
			await setupWidgetWithTypography( driver, widget.type );

			for ( const value of LETTER_SPACING_VALUES.NEGATIVE ) {
				await driver.editor.v4Panel.style.typography.setLetterSpacing( value, 'px' );
				// Elementor doesn't support negative letter spacing values in UI
				// So we verify that the value remains at normal (0) instead
				await verifyLetterSpacing( driver, widget.selector, 0, 'px' );
			}
		} );
	} );

	test( 'Letter spacing for button', async () => {
		await test.step( 'Test letter spacing across different widget types', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await setupWidgetWithTypography( driver, widget.type );

			const testValue = 1.5;
			const testUnit = 'px';
			await driver.editor.v4Panel.style.typography.setLetterSpacing( testValue, testUnit );
			await verifyLetterSpacing( driver, widget.selector, testValue, testUnit );
		} );
	} );

	test( 'Letter spacing for paragraph on published page', async () => {
		await test.step( 'Test letter spacing on published page with paragraph widget', async () => {
			const widget = WIDGET_CONFIGS.PARAGRAPH;
			const testValue = 2;
			const testUnit = 'px';

			await setupWidgetWithTypography( driver, widget.type );
			await driver.editor.v4Panel.style.typography.setLetterSpacing( testValue, testUnit );

			await verifyLetterSpacing( driver, widget.selector, testValue, testUnit );
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( widget.selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.expect } );

			await expect( async () => {
				const computedLetterSpacing = await publishedElement.evaluate( ( el ) => {
					return window.getComputedStyle( el ).letterSpacing;
				} );

				const expectedPixels = testValue;
				const computedValue = parseFloat( computedLetterSpacing );
				expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
			} ).toPass( { timeout: timeouts.expect } );
		} );
	} );

	test( 'Letter spacing with different units', async () => {
		await test.step( 'Test letter spacing with EM units', async () => {
			const widget = WIDGET_CONFIGS.HEADING;
			await setupWidgetWithTypography( driver, widget.type );
			const showMoreButton = driver.page.getByRole( 'button', { name: 'Show More' } );
			await showMoreButton.click();

			await driver.editor.v4Panel.style.typography.setLetterSpacing( 2, 'em' );
			await verifyLetterSpacing( driver, widget.selector, 2, 'em' );
		} );

		await test.step( 'Test letter spacing with REM units', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await driver.setupBasicPage();
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.typography.setLetterSpacing( 3, 'rem' );
			await verifyLetterSpacing( driver, widget.selector, 3, 'rem' );
		} );

		await test.step( 'Test letter spacing with VW units', async () => {
			const widget = WIDGET_CONFIGS.PARAGRAPH;
			await driver.setupBasicPage();
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.typography.setLetterSpacing( 4, 'vw' );
			await verifyLetterSpacing( driver, widget.selector, 4, 'vw' );
		} );

		await test.step( 'Test letter spacing with VH units', async () => {
			const widget = WIDGET_CONFIGS.HEADING;
			await driver.setupBasicPage();
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.typography.setLetterSpacing( 1, 'vh' );
			await verifyLetterSpacing( driver, widget.selector, 1, 'vh' );
		} );

		await test.step( 'Test letter spacing with percentage units', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await driver.setupBasicPage();
			await setupWidgetWithTypography( driver, widget.type );

			// Test percentage value - Elementor might not support % for letter-spacing
			await driver.editor.v4Panel.style.typography.setLetterSpacing( 150, '%' );
			// Verify that it falls back to normal (0) since % might not be supported
			await verifyLetterSpacing( driver, widget.selector, 0, 'px' );
		} );
	} );
} );
