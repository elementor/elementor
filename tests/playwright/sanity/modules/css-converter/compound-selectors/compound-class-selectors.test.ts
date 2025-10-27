import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Compound Class Selectors @compound-selectors', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'Scenario 1: Simple compound selector (.first.second)', async ( { request, page } ) => {
		const htmlContent = `
			<style>
				.random {
					line-height: 2;
				}
				.first.second {
					color: red;
					font-size: 16px;
				}
			</style>
			<div class="random first second">
				Compound Element
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		// Simple success check
		expect( apiResult.success ).toBe( true );

		// Navigate to the created page
		await page.goto( apiResult.edit_url );
		await page.waitForSelector( '#elementor-preview-iframe', { timeout: 10000 } );
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// DOM assertions only
		const compoundElement = previewFrame.locator( '.first-and-second' );
		await expect( compoundElement ).toBeVisible();
		await expect( compoundElement ).toHaveText( 'Compound Element' );
		await expect( compoundElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( compoundElement ).toHaveCSS( 'font-size', '16px' );
	} );

	test( 'Scenario 2: Multiple compound selectors', async ( { request, page } ) => {
		const htmlContent = `
			<style>
				.btn.primary {
					background: blue;
					color: white;
				}
				.btn.secondary {
					background: gray;
					color: black;
				}
			</style>
			<button class="btn primary">Primary</button>
			<button class="btn secondary">Secondary</button>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		await page.waitForSelector( '#elementor-preview-iframe', { timeout: 10000 } );
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );
		
		// DOM assertions only
		const primaryButton = previewFrame.locator( '.btn-and-primary' );
		await expect( primaryButton ).toBeVisible();
		await expect( primaryButton ).toHaveText( 'Primary' );
		await expect( primaryButton ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );
		await expect( primaryButton ).toHaveCSS( 'color', 'rgb(255, 255, 255)' );
		
		const secondaryButton = previewFrame.locator( '.btn-and-secondary' );
		await expect( secondaryButton ).toBeVisible();
		await expect( secondaryButton ).toHaveText( 'Secondary' );
		await expect( secondaryButton ).toHaveCSS( 'background-color', 'rgb(128, 128, 128)' );
		await expect( secondaryButton ).toHaveCSS( 'color', 'rgb(0, 0, 0)' );
	} );


	test( 'Scenario 3: Class missing - compound not applied', async ( { request, page } ) => {
		const htmlContent = `
			<style>
				.first {
					font-size: 20px;
				}
				.second {
					line-height: 10px;
				}
				.first.second {
					color: red;
				}
			</style>
			<div class="first">Only first</div>
			<div class="second">Only second</div>
			<div class="first second">Both</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		await page.waitForSelector( '#elementor-preview-iframe', { timeout: 10000 } );
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );
		
		// DOM assertions only
		await expect( previewFrame.locator( '.first' ).first() ).toBeVisible();
		await expect( previewFrame.locator( '.second' ).first() ).toBeVisible();
		
		const bothClassesElement = previewFrame.locator( '.first-and-second' );
		await expect( bothClassesElement ).toBeVisible();
		await expect( bothClassesElement ).toHaveText( 'Both' );
		await expect( bothClassesElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
	} );

	test( 'Scenario 4: Order independence - normalized class name', async ( { request, page } ) => {
		const htmlContent = `
			<style>
				.first.second {
					color: red;
				}
				.second.first {
					font-size: 20px;
				}
			</style>
			<div class="first second">Text</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		await page.waitForSelector( '#elementor-preview-iframe', { timeout: 10000 } );
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// DOM assertions only - both selectors should apply to same compound class
		const element = previewFrame.locator( '.first-and-second' );
		await expect( element ).toBeVisible();
		await expect( element ).toHaveText( 'Text' );
		await expect( element ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( element ).toHaveCSS( 'font-size', '20px' );
	} );

	test( 'Scenario 5: Complex compound with multiple properties', async ( { request, page } ) => {
		const htmlContent = `
			<style>
				.card.featured {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					padding: 30px;
					border-radius: 12px;
					color: white;
					font-size: 18px;
				}
			</style>
			<div class="card featured">
				<h2>Featured Card</h2>
				<p>This is a featured card with compound styling</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );
		
		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		await page.waitForSelector( '#elementor-preview-iframe', { timeout: 10000 } );
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// DOM assertions only
		const cardElement = previewFrame.locator( '.card-and-featured' );
		await expect( cardElement ).toBeVisible();
		await expect( cardElement ).toHaveCSS( 'font-size', '18px' );
	} );


	test( 'Scenario 6: Compound with hyphenated class names', async ( { request, page } ) => {
		const htmlContent = `
			<style>
				.btn-primary.btn-large {
					padding: 25px 50px;
					font-size: 20px;
				}
			</style>
			<button class="btn-primary btn-large">Large Primary Button</button>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		await page.waitForSelector( '#elementor-preview-iframe', { timeout: 10000 } );
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// DOM assertions only
		const buttonElement = previewFrame.locator( '.btn-large-and-btn-primary' );
		await expect( buttonElement ).toBeVisible();
		await expect( buttonElement ).toHaveText( 'Large Primary Button' );
		await expect( buttonElement ).toHaveCSS( 'padding', '25px 50px' );
		await expect( buttonElement ).toHaveCSS( 'font-size', '20px' );
	} );






} );

