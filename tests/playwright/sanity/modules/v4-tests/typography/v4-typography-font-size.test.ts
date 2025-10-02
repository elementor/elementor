import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import { setupWidgetWithTypography, verifyFontSizeEditor, verifyFontSizeOnFrontend } from './typography-test-helpers';
import { WIDGET_CONFIGS, FONT_SIZES, UNITS, type Unit } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONT_SIZES = {
	EM_LARGE: 10,
	REM_MEDIUM: 1.5,
	VW_SMALL: 5,
	VH_SMALL: 5,
	PERCENT_LARGE: 150,
	EDGE_VERY_SMALL: 8,
	EDGE_VERY_LARGE: 100,
} as const;

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

	async function testFontSizeFunctionality( widgetType: string, widgetConfig: typeof WIDGET_CONFIGS.HEADING, size: number, unit: Unit ): Promise<void> {
		await setupWidgetWithTypography( driver, widgetType );

		const fontSizeLabel = driver.page.locator( 'label', { hasText: 'Font size' } );
		await expect( fontSizeLabel ).toBeVisible( { timeout: timeouts.expect } );

		await driver.editor.v4Panel.style.setFontSize( size, unit );
		await verifyFontSizeEditor( driver, widgetConfig.selector, size, unit );
		await verifyFontSizeOnFrontend( driver, widgetConfig.selector, size, unit );
	}

	test( 'Font size with all units and edge cases', async () => {
		await test.step( 'EM unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.EM_LARGE, UNITS.em );
		} );

		await test.step( 'REM unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.REM_MEDIUM, UNITS.rem );
		} );

		await test.step( 'VW unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.VW_SMALL, UNITS.vw );
		} );

		await test.step( 'VH unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.VH_SMALL, UNITS.vh );
		} );

		await test.step( '% unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.PERCENT_LARGE, UNITS.percent );
		} );

		await test.step( 'Very small font size', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.EDGE_VERY_SMALL, UNITS.px );
		} );

		await test.step( 'Very large font size', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, TEST_FONT_SIZES.EDGE_VERY_LARGE, UNITS.px );
		} );
	} );

	test( 'Font size across widgets with publishing', async () => {
		await test.step( 'Heading', async () => {
			await testFontSizeFunctionality( WIDGET_CONFIGS.HEADING.type, WIDGET_CONFIGS.HEADING, parseInt( FONT_SIZES.DESKTOP ), UNITS.px );
		} );

		await test.step( 'Button', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( WIDGET_CONFIGS.BUTTON.type, WIDGET_CONFIGS.BUTTON, parseInt( FONT_SIZES.MOBILE ), UNITS.px );
		} );
	} );
} );
