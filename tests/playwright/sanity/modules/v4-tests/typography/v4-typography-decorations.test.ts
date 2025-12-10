import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import { timeouts } from '../../../../config/timeouts';
import { addWidgetWithOpenTypographySection } from './typography-test-helpers';
import { WIDGET_CONFIGS, TYPOGRAPHY_DECORATIONS } from './typography-constants';
import { EditorAssertions } from '../../../../pages/editor-assertions';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';

test.describe( 'Atomic Widgets - Text Decoration @v4-tests', () => {
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

	test( 'Line decoration functionality', async () => {
		const widget = WIDGET_CONFIGS.HEADING;
		const decoration = TYPOGRAPHY_DECORATIONS.UNDERLINE;
		await addWidgetWithOpenTypographySection( driver, widget.type );

		const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
		await stylePanel.getByRole( 'button', { name: decoration.buttonName } ).click();

		await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
			{ property: decoration.cssProperty, value: decoration.activeValue },
		] );
	} );

	test( 'Text transform functionality', async () => {
		const widget = WIDGET_CONFIGS.PARAGRAPH;
		const decoration = TYPOGRAPHY_DECORATIONS.UPPERCASE;
		await addWidgetWithOpenTypographySection( driver, widget.type );

		const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
		await stylePanel.getByRole( 'button', { name: decoration.buttonName } ).click();

		await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
			{ property: decoration.cssProperty, value: decoration.activeValue },
		] );
	} );

	test( 'Direction control functionality', async () => {
		const widget = WIDGET_CONFIGS.BUTTON;
		const decoration = TYPOGRAPHY_DECORATIONS.RTL;
		await addWidgetWithOpenTypographySection( driver, widget.type );

		const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
		await stylePanel.getByRole( 'button', { name: decoration.buttonName } ).click();

		await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
			{ property: decoration.cssProperty, value: decoration.activeValue },
		] );
	} );

	test( 'Font style functionality', async () => {
		const widget = WIDGET_CONFIGS.HEADING;
		const decoration = TYPOGRAPHY_DECORATIONS.ITALIC;
		await addWidgetWithOpenTypographySection( driver, widget.type );

		const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
		await stylePanel.getByRole( 'button', { name: decoration.buttonName } ).click();

		await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
			{ property: decoration.cssProperty, value: decoration.activeValue },
		] );
	} );

	test( 'Text stroke functionality', async () => {
		const widget = WIDGET_CONFIGS.PARAGRAPH;
		const decoration = TYPOGRAPHY_DECORATIONS.TEXT_STROKE;
		await addWidgetWithOpenTypographySection( driver, widget.type );

		const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
		await stylePanel.getByRole( 'button', { name: decoration.addButtonName, exact: true } ).click();

		await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
			{ property: decoration.cssProperty, value: decoration.defaultValue },
		] );
	} );

	test( 'Integration: Multiple typography features on single widget', async () => {
		const widget = WIDGET_CONFIGS.HEADING;
		const { UNDERLINE, ITALIC, UPPERCASE, RTL, TEXT_STROKE } = TYPOGRAPHY_DECORATIONS;

		await test.step( 'Apply multiple typography features', async () => {
			await addWidgetWithOpenTypographySection( driver, widget.type );

			const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
			await stylePanel.getByRole( 'button', { name: UNDERLINE.buttonName } ).click();
			await stylePanel.getByRole( 'button', { name: ITALIC.buttonName } ).click();
			await stylePanel.getByRole( 'button', { name: UPPERCASE.buttonName } ).click();
			await stylePanel.getByRole( 'button', { name: RTL.buttonName } ).click();
			await stylePanel.getByRole( 'button', { name: TEXT_STROKE.addButtonName, exact: true } ).click();
		} );

		await test.step( 'Verify all features applied correctly', async () => {
			await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
				{ property: UNDERLINE.cssProperty, value: UNDERLINE.activeValue },
				{ property: ITALIC.cssProperty, value: ITALIC.activeValue },
				{ property: UPPERCASE.cssProperty, value: UPPERCASE.activeValue },
				{ property: RTL.cssProperty, value: RTL.activeValue },
				{ property: TEXT_STROKE.cssProperty, value: TEXT_STROKE.defaultValue },
			] );

			await EditorAssertions.verifyButtonsPressed( driver, [
				{ buttonName: UNDERLINE.buttonName, isPressed: true },
				{ buttonName: ITALIC.buttonName, isPressed: true },
				{ buttonName: UPPERCASE.buttonName, isPressed: true },
				{ buttonName: RTL.buttonName, isPressed: true },
			] );

			const removeStrokeButton = driver.page.getByRole( 'button', { name: TEXT_STROKE.removeButtonName } );
			await expect( removeStrokeButton ).toBeVisible();
		} );

		await test.step( 'Toggle features off', async () => {
			const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
			await stylePanel.getByRole( 'button', { name: UNDERLINE.buttonName } ).click();
			await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
				{ property: UNDERLINE.cssProperty, value: UNDERLINE.inactiveValue },
			] );
			await EditorAssertions.verifyButtonsPressed( driver, [
				{ buttonName: UNDERLINE.buttonName, isPressed: false },
			] );

			await stylePanel.getByRole( 'button', { name: TEXT_STROKE.removeButtonName } ).click();
			await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
				{ property: TEXT_STROKE.cssProperty, value: TEXT_STROKE.removedValue },
			] );
		} );

		await test.step( 'Verify remaining features still active', async () => {
			await EditorAssertions.verifyCSSProperties( driver, widget.selector, [
				{ property: ITALIC.cssProperty, value: ITALIC.activeValue },
				{ property: UPPERCASE.cssProperty, value: UPPERCASE.activeValue },
				{ property: RTL.cssProperty, value: RTL.activeValue },
			] );
		} );

		await test.step( 'Verify features persist on published page', async () => {
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( widget.selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.expect } );

			for ( const { property, value } of [
				{ property: ITALIC.cssProperty, value: ITALIC.activeValue },
				{ property: UPPERCASE.cssProperty, value: UPPERCASE.activeValue },
				{ property: RTL.cssProperty, value: RTL.activeValue },
			] ) {
				await expect( publishedElement ).toHaveCSS( property, value, { timeout: timeouts.expect } );
			}
		} );
	} );
} );

