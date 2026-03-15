import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import { DriverFactory } from '../../../drivers/driver-factory';
import type { EditorDriver } from '../../../drivers/editor-driver';
import { timeouts } from '../../../config/timeouts';

const BREAKPOINT_FONT_SIZES = {
	desktop: 32,
	tablet: 24,
	mobile: 16,
} as const;

const STATE_COLORS = {
	normal: '#ff0000',
	hover: '#00ff00',
} as const;

test.describe( 'Responsive Styles @v4-tests', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests );
		await driver.wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await driver?.wpAdmin?.resetExperiments();
	} );

	test.beforeEach( async () => {
		await driver.createNewPage( true );
	} );

	test( 'Breakpoint styles render correctly in editor and frontend', async () => {
		const containerId = await driver.editor.addElement( { elType: 'container' }, 'document' );
		await driver.editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		await driver.editor.v4Panel.openTab( 'style' );
		await driver.editor.v4Panel.style.openSection( 'Typography' );

		await test.step( 'Set desktop font size', async () => {
			await driver.editor.changeResponsiveView( 'desktop' );
			await driver.editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.desktop, 'px' );
		} );

		await test.step( 'Set tablet font size', async () => {
			await driver.editor.changeResponsiveView( 'tablet' );
			await driver.editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.tablet, 'px' );
		} );

		await test.step( 'Set mobile font size', async () => {
			await driver.editor.changeResponsiveView( 'mobile' );
			await driver.editor.v4Panel.style.setFontSize( BREAKPOINT_FONT_SIZES.mobile, 'px' );
		} );

		const selector = '.e-heading-base';

		await test.step( 'Verify desktop style in editor', async () => {
			await driver.editor.changeResponsiveView( 'desktop' );
			const element = driver.editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.desktop }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify tablet style in editor', async () => {
			await driver.editor.changeResponsiveView( 'tablet' );
			const element = driver.editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.tablet }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify mobile style in editor', async () => {
			await driver.editor.changeResponsiveView( 'mobile' );
			const element = driver.editor.getPreviewFrame().locator( selector );
			await expect( element ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.mobile }px`, { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend with viewport changes', async () => {
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await driver.page.setViewportSize( { width: 1400, height: 900 } );
			await expect( publishedElement ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.desktop }px` );

			await driver.page.setViewportSize( { width: 800, height: 600 } );
			await expect( publishedElement ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.tablet }px` );

			await driver.page.setViewportSize( { width: 375, height: 667 } );
			await expect( publishedElement ).toHaveCSS( 'font-size', `${ BREAKPOINT_FONT_SIZES.mobile }px` );
		} );
	} );

	test( 'State styles (hover) render correctly in editor and frontend', async () => {
		const containerId = await driver.editor.addElement( { elType: 'container' }, 'document' );
		await driver.editor.addWidget( { widgetType: 'e-button', container: containerId } );

		await driver.editor.v4Panel.openTab( 'style' );
		await driver.editor.v4Panel.style.openSection( 'Background' );

		await test.step( 'Set normal state background', async () => {
			await driver.editor.v4Panel.style.setBackgroundColor( STATE_COLORS.normal );
		} );

		await test.step( 'Set hover state background', async () => {
			await driver.editor.v4Panel.style.selectClassState( 'hover', 'local' );
			await driver.editor.v4Panel.style.openSection( 'Background' );
			await driver.editor.v4Panel.style.setBackgroundColor( STATE_COLORS.hover );
		} );

		const selector = '.e-button-base';
		const element = driver.editor.getPreviewFrame().locator( selector );

		await test.step( 'Verify normal state in editor', async () => {
			await driver.editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await expect( element ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)', { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify styles on frontend', async () => {
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );

			await publishedElement.hover();
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(0, 255, 0)' );
		} );
	} );

	test( 'Combined breakpoint + state styles render correctly', async () => {
		const containerId = await driver.editor.addElement( { elType: 'container' }, 'document' );
		await driver.editor.addWidget( { widgetType: 'e-button', container: containerId } );

		await driver.editor.v4Panel.openTab( 'style' );

		await test.step( 'Set desktop normal background', async () => {
			await driver.editor.changeResponsiveView( 'desktop' );
			await driver.editor.v4Panel.style.openSection( 'Background' );
			await driver.editor.v4Panel.style.setBackgroundColor( '#ff0000' );
		} );

		await test.step( 'Set desktop hover background', async () => {
			await driver.editor.v4Panel.style.selectClassState( 'hover', 'local' );
			await driver.editor.v4Panel.style.openSection( 'Background' );
			await driver.editor.v4Panel.style.setBackgroundColor( '#00ff00' );
		} );

		await test.step( 'Set mobile normal background', async () => {
			await driver.editor.v4Panel.style.selectClassState( 'normal', 'local' );
			await driver.editor.changeResponsiveView( 'mobile' );
			await driver.editor.v4Panel.style.openSection( 'Background' );
			await driver.editor.v4Panel.style.setBackgroundColor( '#0000ff' );
		} );

		await test.step( 'Set mobile hover background', async () => {
			await driver.editor.v4Panel.style.selectClassState( 'hover', 'local' );
			await driver.editor.v4Panel.style.openSection( 'Background' );
			await driver.editor.v4Panel.style.setBackgroundColor( '#ffff00' );
		} );

		const selector = '.e-button-base';

		await test.step( 'Verify combined styles on frontend', async () => {
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

			await driver.page.setViewportSize( { width: 1400, height: 900 } );
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
			await publishedElement.hover();
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(0, 255, 0)' );

			await driver.page.setViewportSize( { width: 375, height: 667 } );
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );
			await publishedElement.hover();
			await expect( publishedElement ).toHaveCSS( 'background-color', 'rgb(255, 255, 0)' );
		} );
	} );
} );
