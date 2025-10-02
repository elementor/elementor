import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import { setupWidgetWithTypography, verifyFontSizeEditor, verifyFontSizeOnFrontend } from './typography-test-helpers';
import { WIDGET_CONFIGS, FONT_SIZES, UNITS, type Unit } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const WIDGET_TEST_CONFIGS = [
	{ type: 'e-heading', config: WIDGET_CONFIGS.HEADING },
	{ type: 'e-paragraph', config: WIDGET_CONFIGS.PARAGRAPH },
	{ type: 'e-button', config: WIDGET_CONFIGS.BUTTON },
] as const;

test.describe( 'V4 Typography Font Size Tests @v4-tests', () => {
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

	// Helper function to test font size functionality
	async function testFontSizeFunctionality( widgetType: string, widgetConfig: typeof WIDGET_CONFIGS.HEADING, size: number, unit: Unit ): Promise<void> {
		await setupWidgetWithTypography( driver, widgetType );

		// Verify font size control is present
		const fontSizeLabel = driver.page.locator( 'label', { hasText: 'Font size' } );
		await expect( fontSizeLabel ).toBeVisible( { timeout: timeouts.expect } );

		// Set font size
		await driver.editor.v4Panel.style.setFontSize( size, unit );

		// Verify font size in editor
		await verifyFontSizeEditor( driver, widgetConfig.selector, size, unit );

		// Verify font size on frontend
		await verifyFontSizeOnFrontend( driver, widgetConfig.selector, size, unit );
	}

	test( 'Font size with all units and edge cases', async () => {
		await test.step( 'PX unit', async () => {
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, parseInt( FONT_SIZES.DESKTOP ), UNITS.px );
		} );

		await test.step( 'EM unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 10, UNITS.em );
		} );

		await test.step( 'REM unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 1.5, UNITS.rem );
		} );

		await test.step( 'VW unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 5, UNITS.vw );
		} );

		await test.step( 'VH unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 5, UNITS.vh );
		} );

		await test.step( '% unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 150, UNITS.percent );
		} );

		await test.step( 'Very small font size', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 8, UNITS.px );
		} );

		await test.step( 'Very large font size', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, 100, UNITS.px );
		} );
	} );

	test( 'Font size across widgets with publishing', async () => {
		await test.step( 'Heading', async () => {
			await testFontSizeFunctionality( WIDGET_CONFIGS.HEADING.type, WIDGET_CONFIGS.HEADING, parseInt( FONT_SIZES.DESKTOP ), UNITS.px );
		} );

		await test.step( 'Paragraph', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( WIDGET_CONFIGS.PARAGRAPH.type, WIDGET_CONFIGS.PARAGRAPH, parseInt( FONT_SIZES.TABLET ), UNITS.px );
		} );

		await test.step( 'Button', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( WIDGET_CONFIGS.BUTTON.type, WIDGET_CONFIGS.BUTTON, parseInt( FONT_SIZES.MOBILE ), UNITS.px );
		} );
	} );
} );
