import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	addWidgetWithOpenTypographySection,
	verifyFontFamilyOnFrontend,
} from './typography-test-helpers';
import { WIDGET_CONFIGS, FONT_FAMILIES } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONTS = {
	SYSTEM_DEFAULT: FONT_FAMILIES.system,
	GOOGLE: FONT_FAMILIES.google,
} as const;

test.describe( 'V4 Typography Font Family Tests @v4-tests', () => {
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

	async function testFontFamilyFunctionality( params: {
		widgetConfig: typeof WIDGET_CONFIGS.HEADING;
		fontName: string;
		fontType: 'system' | 'google';
		testOnFrontend: boolean;
	} ): Promise<void> {
		const { widgetConfig, fontName, fontType, testOnFrontend } = params;

		await addWidgetWithOpenTypographySection( driver, widgetConfig.type );

		const fontFamilyLabel = driver.page.locator( 'label', { hasText: 'Font family' } );
		await expect( fontFamilyLabel ).toBeVisible( { timeout: timeouts.expect } );

		await driver.editor.v4Panel.style.setFontFamily( fontName, fontType );

		const frame = driver.editor.getPreviewFrame();
		const element = frame.locator( widgetConfig.selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );
		await expect( element ).toHaveCSS( 'font-family', new RegExp( fontName, 'i' ), { timeout: timeouts.expect } );

		if ( testOnFrontend ) {
			await verifyFontFamilyOnFrontend( driver, widgetConfig.selector, fontName );
		}
	}

	test( 'Font family - Basic functionality', async () => {
		await test.step( 'System font', async () => {
			await testFontFamilyFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				fontName: TEST_FONTS.SYSTEM_DEFAULT,
				fontType: 'system',
				testOnFrontend: false,
			} );
		} );

		await test.step( 'Google font', async () => {
			await driver.createNewPage( true );
			await testFontFamilyFunctionality( {
				widgetConfig: WIDGET_CONFIGS.HEADING,
				fontName: TEST_FONTS.GOOGLE,
				fontType: 'google',
				testOnFrontend: false,
			} );
		} );
	} );

	test( 'Font family - Frontend verification', async () => {
		await testFontFamilyFunctionality( {
			widgetConfig: WIDGET_CONFIGS.HEADING,
			fontName: TEST_FONTS.SYSTEM_DEFAULT,
			fontType: 'system',
			testOnFrontend: true,
		} );
	} );
} );
