import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	WIDGET_CONFIGS,
	SPACING_VALUES,
	setupWidgetWithTypography,
	verifySpacingEditor,
} from './typography-test-helpers';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const WORD_SPACING_VALUES = {
	POSITIVE: SPACING_VALUES.POSITIVE,
	NEGATIVE: SPACING_VALUES.NEGATIVE,
	UNITS: SPACING_VALUES.UNITS,
};

test.describe( 'V4 Typography Word Spacing Tests @v4-tests', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests );
		await driver.wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await driver.wpAdmin.resetExperiments();
	} );

	test.beforeEach( async () => {
		await driver.createNewPage( true );
	} );

	test( 'Word spacing basic functionality for heading', async () => {
		const widget = WIDGET_CONFIGS.HEADING;

		await test.step( 'Verify word spacing control is present and functional', async () => {
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', 10, 'px' );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 10, expectedUnit: 'px', cssProperty: 'wordSpacing' } );
		} );

		await test.step( 'Reset and test negative word spacing values', async () => {
			await driver.createNewPage( true );
			await setupWidgetWithTypography( driver, widget.type );

			for ( const value of WORD_SPACING_VALUES.NEGATIVE ) {
				await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', value, 'px' );
				await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: value, expectedUnit: 'px', cssProperty: 'wordSpacing' } );
			}
		} );
	} );

	test( 'Word spacing for button', async () => {
		await test.step( 'Test word spacing across different widget types', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await setupWidgetWithTypography( driver, widget.type );

			const testValue = 2.5;
			const testUnit = 'px';
			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', testValue, testUnit );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: testValue, expectedUnit: testUnit, cssProperty: 'wordSpacing' } );
		} );
	} );

	test( 'Word spacing for paragraph on published page', async () => {
		await test.step( 'Test word spacing on published page with paragraph widget', async () => {
			const widget = WIDGET_CONFIGS.PARAGRAPH;
			const testValue = 3;
			const testUnit = 'px';

			await setupWidgetWithTypography( driver, widget.type );
			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', testValue, testUnit );

			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: testValue, expectedUnit: testUnit, cssProperty: 'wordSpacing' } );
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( widget.selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.expect } );

			await expect( async () => {
				const computedWordSpacing = await publishedElement.evaluate( ( el ) => {
					return window.getComputedStyle( el ).wordSpacing;
				} );

				const expectedPixels = testValue;
				const computedValue = parseFloat( computedWordSpacing );
				expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
			} ).toPass( { timeout: timeouts.expect } );
		} );
	} );

	test( 'Word spacing with different units', async () => {
		await test.step( 'Test word spacing with EM units', async () => {
			const widget = WIDGET_CONFIGS.HEADING;
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', 3, 'em' );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 3, expectedUnit: 'em', cssProperty: 'wordSpacing' } );
		} );

		await test.step( 'Test word spacing with REM units', async () => {
			const widget = WIDGET_CONFIGS.BUTTON;
			await driver.createNewPage( true );
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', 5, 'rem' );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 5, expectedUnit: 'rem', cssProperty: 'wordSpacing' } );
		} );

		await test.step( 'Test word spacing with VW units', async () => {
			const widget = WIDGET_CONFIGS.PARAGRAPH;
			await driver.createNewPage( true );
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', 7, 'vw' );
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 7, expectedUnit: 'vw', cssProperty: 'wordSpacing' } );
		} );

		await test.step( 'Test word spacing with percentage units', async () => {
			const widget = WIDGET_CONFIGS.HEADING;
			await driver.createNewPage( true );
			await setupWidgetWithTypography( driver, widget.type );

			await driver.editor.v4Panel.style.setSpacingValue( 'Word spacing', 100, '%' );
			// Verify that it falls back to normal (0) since % is not supported
			await verifySpacingEditor( { driver, selector: widget.selector, expectedValue: 0, expectedUnit: 'px', cssProperty: 'wordSpacing' } );
		} );
	} );
} );
