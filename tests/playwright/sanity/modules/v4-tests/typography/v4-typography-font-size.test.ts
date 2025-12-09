import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import { addWidgetWithOpenTypographySection, verifyFontSizeEditor, verifyFontSizeOnFrontend } from './typography-test-helpers';
import { WIDGET_CONFIGS, FONT_SIZES, UNITS, type Unit } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONT_SIZES = {
	PX_MEDIUM: 24,
	REM_MEDIUM: 1.5,
	VW_MEDIUM: 5,
	REM_FRACTIONAL: 0.5,
	PX_VERY_LARGE: 200,
} as const;

test.describe( 'V4 Typography Font Size Tests @v4-tests', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests, {
			experiments: [ 'e_atomic_elements' ],
		} );
	} );

	test.afterAll( async () => {
		await driver.wpAdmin.resetExperiments();
	} );

	test.beforeEach( async () => {
		await driver.createNewPage( true );
	} );

	async function testFontSizeFunctionality( params: {
		widgetConfig: typeof WIDGET_CONFIGS.HEADING;
		size: number;
		unit: Unit;
		testOnFrontend: boolean;
	} ): Promise<void> {
		const { widgetConfig, size, unit, testOnFrontend } = params;

		await addWidgetWithOpenTypographySection( driver, widgetConfig.type );

		const fontSizeLabel = driver.page.locator( 'label', { hasText: 'Font size' } );
		await expect( fontSizeLabel ).toBeVisible( { timeout: timeouts.expect } );

		await driver.editor.v4Panel.style.setFontSize( size, unit );

		if ( testOnFrontend ) {
			await verifyFontSizeOnFrontend( driver, widgetConfig.selector, size, unit );
		} else {
			await verifyFontSizeEditor( driver, widgetConfig.selector, size, unit );
		}
	}

	test( 'Font size - Basic functionality', async () => {
		await test.step( 'PX unit', async () => {
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				size: TEST_FONT_SIZES.PX_MEDIUM,
				unit: UNITS.px,
				testOnFrontend: false,
			} );
		} );

		await test.step( 'REM unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				size: TEST_FONT_SIZES.REM_MEDIUM,
				unit: UNITS.rem,
				testOnFrontend: false,
			} );
		} );

		await test.step( 'VW unit', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				size: TEST_FONT_SIZES.VW_MEDIUM,
				unit: UNITS.vw,
				testOnFrontend: false,
			} );
		} );
	} );

	test( 'Font size - Edge cases', async () => {
		await test.step( 'Fractional value', async () => {
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				size: TEST_FONT_SIZES.REM_FRACTIONAL,
				unit: UNITS.rem,
				testOnFrontend: false,
			} );
		} );

		await test.step( 'Very large value', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				size: TEST_FONT_SIZES.PX_VERY_LARGE,
				unit: UNITS.px,
				testOnFrontend: false,
			} );
		} );
	} );

	test( 'Font size across widgets with publishing', async () => {
		await test.step( 'Heading', async () => {
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				size: parseInt( FONT_SIZES.DESKTOP ),
				unit: UNITS.rem,
				testOnFrontend: true,
			} );
		} );

		await test.step( 'Button', async () => {
			await driver.createNewPage( true );
			await testFontSizeFunctionality( {
				widgetConfig: WIDGET_CONFIGS.BUTTON,
				size: parseInt( FONT_SIZES.MOBILE ),
				unit: UNITS.px,
				testOnFrontend: true,
			} );
		} );
	} );
} );
