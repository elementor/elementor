import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	addWidgetWithOpenTypographySection,
	verifySpacingEditor,
} from './typography-test-helpers';
import { WIDGET_CONFIGS, SPACING_VALUES, UNITS } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';
import { wpCli } from '../../../../assets/wp-cli';

const LETTER_SPACING_VALUES = {
	POSITIVE: SPACING_VALUES.POSITIVE,
	NEGATIVE: SPACING_VALUES.NEGATIVE,
	UNITS: SPACING_VALUES.UNITS,
};

test.describe( 'V4 Typography Letter Spacing Tests @v4-tests', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests );
	} );

	test.afterAll( async () => {
		await driver.wpAdmin.resetExperiments();
	} );

	test.beforeEach( async () => {
		await driver.createNewPage( true );
	} );

	test( 'Letter spacing basic functionality for heading', async () => {
		const widget = WIDGET_CONFIGS.HEADING;

		await test.step( 'Verify letter spacing control is present and functional', async () => {
			await addWidgetWithOpenTypographySection( driver, widget.type );
			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', 5, UNITS.px );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 5, expectedUnit: UNITS.px, cssProperty: 'letterSpacing' } );
		} );

		await test.step( 'Test positive letter spacing values', async () => {
			for ( const value of LETTER_SPACING_VALUES.POSITIVE ) {
				await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', value, UNITS.px );
				await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: value, expectedUnit: UNITS.px, cssProperty: 'letterSpacing' } );
			}
		} );
	} );

	test( 'Letter spacing for button', async () => {
		await test.step( 'Test letter spacing across different widget types', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await addWidgetWithOpenTypographySection( driver, widget.type );

			const testValue = 1.5;
			const testUnit = 'px';
			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', testValue, testUnit );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: testValue, expectedUnit: testUnit, cssProperty: 'letterSpacing' } );
		} );
	} );

	test( 'Letter spacing for paragraph on published page', async () => {
		await test.step( 'Test letter spacing on published page with paragraph widget - negative value', async () => {
			const widget = WIDGET_CONFIGS.PARAGRAPH;
			const testValue = -2;
			const testUnit = 'px';

			await addWidgetWithOpenTypographySection( driver, widget.type );
			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', testValue, testUnit );

			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: testValue, expectedUnit: testUnit, cssProperty: 'letterSpacing' } );
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
			await addWidgetWithOpenTypographySection( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', 2, UNITS.em );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 2, expectedUnit: UNITS.em, cssProperty: 'letterSpacing' } );
		} );

		await test.step( 'Test letter spacing with REM units', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await driver.createNewPage( true );
			await addWidgetWithOpenTypographySection( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', 3, UNITS.rem );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 3, expectedUnit: UNITS.rem, cssProperty: 'letterSpacing' } );
		} );

		await test.step( 'Test letter spacing with VW units', async () => {
			const widget = WIDGET_CONFIGS.PARAGRAPH;
			await driver.createNewPage( true );
			await addWidgetWithOpenTypographySection( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', 4, UNITS.vw );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 4, expectedUnit: UNITS.vw, cssProperty: 'letterSpacing' } );
		} );

		await test.step( 'Test letter spacing with VH units', async () => {
			const widget = WIDGET_CONFIGS.HEADING;
			await driver.createNewPage( true );
			await addWidgetWithOpenTypographySection( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', 1, UNITS.vh );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 1, expectedUnit: UNITS.vh, cssProperty: 'letterSpacing' } );
		} );

		await test.step( 'Test letter spacing with percentage units', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await driver.createNewPage( true );
			await addWidgetWithOpenTypographySection( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Letter spacing', 150, UNITS.percent );
			// Verify that it falls back to normal (0) since % is not supported
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 0, expectedUnit: UNITS.px, cssProperty: 'letterSpacing' } );
		} );
	} );
} );
