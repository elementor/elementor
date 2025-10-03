import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	setupWidgetWithTypography,
	verifyFontFamilyOnFrontend,
} from './typography-test-helpers';
import { WIDGET_CONFIGS, FONT_FAMILIES } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONTS = {
	SYSTEM: [
		{ name: FONT_FAMILIES.system, type: 'system' as const },
		{ name: FONT_FAMILIES.systemAlt, type: 'system' as const },
	],
	GOOGLE: [
		{ name: FONT_FAMILIES.google, type: 'google' as const },
		{ name: 'Open Sans', type: 'google' as const },
	],
} as const;

// Test configuration for different widgets
const WIDGET_TEST_CONFIGS = [
	{ type: 'e-heading', config: WIDGET_CONFIGS.HEADING },
	{ type: 'e-paragraph', config: WIDGET_CONFIGS.PARAGRAPH },
	{ type: 'e-button', config: WIDGET_CONFIGS.BUTTON },
] as const;

test.describe( 'V4 Typography Font Family Tests @v4-tests', () => {
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

	async function testFontFamilyFunctionality( widgetType: string, widgetConfig: typeof WIDGET_CONFIGS.HEADING, fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		await setupWidgetWithTypography( driver, widgetType );

		const fontFamilyLabel = driver.page.locator( 'label', { hasText: 'Font family' } );
		await expect( fontFamilyLabel ).toBeVisible( { timeout: timeouts.expect } );

		await driver.editor.v4Panel.style.setFontFamily( fontName, fontType );

		const frame = driver.editor.getPreviewFrame();
		if ( ! frame ) {
			throw new Error( 'Preview frame is not available' );
		}

		const element = frame.locator( widgetConfig.selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );
		await expect( element ).toHaveCSS( 'font-family', new RegExp( fontName, 'i' ), { timeout: timeouts.expect } );
	}

	async function testFontFamilyWithPublishing( widgetType: string, widgetConfig: typeof WIDGET_CONFIGS.HEADING, fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		await setupWidgetWithTypography( driver, widgetType );

		const fontFamilyLabel = driver.page.locator( 'label', { hasText: 'Font family' } );
		await expect( fontFamilyLabel ).toBeVisible( { timeout: timeouts.expect } );

		await driver.editor.v4Panel.style.setFontFamily( fontName, fontType );

		const frame = driver.editor.getPreviewFrame();
		if ( ! frame ) {
			throw new Error( 'Preview frame is not available' );
		}

		const element = frame.locator( widgetConfig.selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );
		await expect( element ).toHaveCSS( 'font-family', new RegExp( fontName, 'i' ), { timeout: timeouts.expect } );

		await verifyFontFamilyOnFrontend( driver, widgetConfig.selector, fontName );
	}

	test( 'Font family control with different fonts and widgets', async () => {
		await test.step( 'Basic system font', async () => {
			await testFontFamilyFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, FONT_FAMILIES.system );
		} );

		await test.step( 'Alternative system font', async () => {
			await driver.createNewPage( true );
			await testFontFamilyFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, FONT_FAMILIES.systemAlt );
		} );

		await test.step( 'Google font', async () => {
			await driver.createNewPage( true );
			await testFontFamilyFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, FONT_FAMILIES.google, 'google' );
		} );
	} );

	test( 'Font family across different widget types', async () => {
		await test.step( 'Heading widget', async () => {
			await testFontFamilyFunctionality( WIDGET_TEST_CONFIGS[ 0 ].type, WIDGET_TEST_CONFIGS[ 0 ].config, FONT_FAMILIES.system );
		} );

		await test.step( 'Paragraph widget', async () => {
			await driver.createNewPage( true );
			await testFontFamilyFunctionality( WIDGET_TEST_CONFIGS[ 1 ].type, WIDGET_TEST_CONFIGS[ 1 ].config, FONT_FAMILIES.system );
		} );

		await test.step( 'Button widget', async () => {
			await driver.createNewPage( true );
			await testFontFamilyFunctionality( WIDGET_TEST_CONFIGS[ 2 ].type, WIDGET_TEST_CONFIGS[ 2 ].config, FONT_FAMILIES.system );
		} );
	} );

	test.skip( 'Font family across widgets with publishing', async () => {
		await test.step( 'Heading', async () => {
			await testFontFamilyWithPublishing( WIDGET_CONFIGS.HEADING.type, WIDGET_CONFIGS.HEADING, FONT_FAMILIES.system );
		} );

		await test.step( 'Paragraph', async () => {
			await driver.createNewPage( true );
			await testFontFamilyWithPublishing( WIDGET_CONFIGS.PARAGRAPH.type, WIDGET_CONFIGS.PARAGRAPH, FONT_FAMILIES.systemAlt );
		} );

		await test.step( 'Button', async () => {
			await driver.createNewPage( true );
			await testFontFamilyWithPublishing( WIDGET_CONFIGS.BUTTON.type, WIDGET_CONFIGS.BUTTON, FONT_FAMILIES.trebuchet );
		} );
	} );
} );
