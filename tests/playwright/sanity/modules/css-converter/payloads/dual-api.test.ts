import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Dual API Support @payloads', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdminPage.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should support Widget Converter API (Option 1)', async ( { page, request } ) => {
		const cssContent = '.test-class { font-size: 1rem; color: #aaaaaa; background-color: #f0f0f0; padding: 20px; }';

		const apiResult = await cssHelper.convertCssOnly( request, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();
		expect( apiResult.edit_url ).toBeDefined();
		expect( apiResult.global_classes_created ).toBeGreaterThanOrEqual( 0 );

		await test.step( 'Verify Widget Converter API response structure', async () => {
			expect( apiResult ).toHaveProperty( 'widgets_created' );
			expect( apiResult ).toHaveProperty( 'global_classes_created' );
			expect( apiResult ).toHaveProperty( 'variables_created' );
			expect( apiResult ).toHaveProperty( 'post_id' );
			expect( apiResult ).toHaveProperty( 'edit_url' );
		} );

		await test.step( 'Navigate to editor and verify conversion', async () => {
			await page.goto( apiResult.edit_url );
			editor = new EditorPage( page, wpAdmin.testInfo );
			await editor.waitForPanelToLoad();

			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
		} );
	} );

	test( 'should support CSS Classes API (Option 2)', async ( { request } ) => {
		const cssContent = '.test-class-2 { font-size: 1.2rem; color: #333333; margin: 10px; }';

		const apiResult = await cssHelper.convertCssToClasses( request, cssContent, true );

		const validation = cssHelper.validateCssClassesResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.global_classes_created ).toBeGreaterThanOrEqual( 0 );

		await test.step( 'Verify CSS Classes API response structure', async () => {
			expect( apiResult ).toHaveProperty( 'success' );
			expect( apiResult ).toHaveProperty( 'global_classes_created' );
			expect( apiResult ).toHaveProperty( 'classes' );
			expect( Array.isArray( apiResult.classes ) ).toBe( true );
		} );

		await test.step( 'Verify created classes structure', async () => {
			if ( apiResult.classes && apiResult.classes.length > 0 ) {
				const firstClass = apiResult.classes[0];
				expect( firstClass ).toHaveProperty( 'name' );
				expect( firstClass ).toHaveProperty( 'id' );
				expect( firstClass ).toHaveProperty( 'properties' );
			}
		} );
	} );

	test( 'should compare both APIs with same CSS input', async ( { page, request } ) => {
		const cssContent = '.comparison-class { font-size: 16px; color: #ff6b6b; padding: 15px; margin: 5px; }';

		const dualResult = await cssHelper.convertWithBothApis( request, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateDualApiResult( dualResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		await test.step( 'Compare API responses', async () => {
			expect( dualResult.widgetConverter ).toBeDefined();
			expect( dualResult.cssClasses ).toBeDefined();

			// Both should succeed
			expect( dualResult.widgetConverter!.success ).toBe( true );
			expect( dualResult.cssClasses!.success ).toBe( true );

			// Widget converter should create more comprehensive results
			expect( dualResult.widgetConverter!.post_id ).toBeDefined();
			expect( dualResult.widgetConverter!.edit_url ).toBeDefined();

			// CSS classes should focus on class creation
			expect( dualResult.cssClasses!.classes ).toBeDefined();
		} );

		await test.step( 'Verify Widget Converter result in editor', async () => {
			if ( dualResult.widgetConverter ) {
				await page.goto( dualResult.widgetConverter.edit_url );
				editor = new EditorPage( page, wpAdmin.testInfo );
				await editor.waitForPanelToLoad();

				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
			}
		} );

		await test.step( 'Take comparison screenshot', async () => {
			if ( dualResult.widgetConverter ) {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'dual-api-comparison.png' );
			}
		} );
	} );

	test( 'should handle complex CSS with both APIs', async ( { page, request } ) => {
		const complexCss = `
			.complex-header { 
				font-size: 2rem; 
				color: #2c3e50; 
				font-weight: bold; 
				text-align: center;
				margin-bottom: 20px;
				padding: 30px;
				background: linear-gradient(45deg, #667eea, #764ba2);
				border-radius: 12px;
				box-shadow: 0 4px 15px rgba(0,0,0,0.1);
			}
			.complex-content { 
				font-size: 16px; 
				line-height: 1.6; 
				color: #555;
				padding: 20px;
				background-color: #f8f9fa;
			}
		`;

		await test.step( 'Test Widget Converter with complex CSS', async () => {
			const widgetResult = await cssHelper.convertCssOnly( request, complexCss, {
				createGlobalClasses: true,
			} );

			const validation = cssHelper.validateApiResult( widgetResult );
			if ( !validation.shouldSkip ) {
				expect( widgetResult.success ).toBe( true );
				expect( widgetResult.global_classes_created ).toBeGreaterThanOrEqual( 0 );

				// Navigate to editor to verify complex styles
				await page.goto( widgetResult.edit_url );
				editor = new EditorPage( page, wpAdmin.testInfo );
				await editor.waitForPanelToLoad();

				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
				await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'complex-css-widget-converter.png' );
			}
		} );

		await test.step( 'Test CSS Classes API with complex CSS', async () => {
			const classesResult = await cssHelper.convertCssToClasses( request, complexCss, true );

			const validation = cssHelper.validateCssClassesResult( classesResult );
			if ( !validation.shouldSkip ) {
				expect( classesResult.success ).toBe( true );
				expect( classesResult.global_classes_created ).toBeGreaterThanOrEqual( 0 );

				if ( classesResult.classes && classesResult.classes.length > 0 ) {
					// Verify that complex properties are captured
					const hasComplexProperties = classesResult.classes.some( cls => 
						cls.properties && Object.keys( cls.properties ).length > 3
					);
					expect( hasComplexProperties ).toBe( true );
				}
			}
		} );
	} );
} );
