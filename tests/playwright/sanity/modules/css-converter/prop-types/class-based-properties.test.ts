import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Class-Based Properties Test @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
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

	test( 'should test EXACT structure from flat-classes-test-page.html', async ( { page, request } ) => {
		console.log( '🔍 DEBUG: Testing exact structure from flat-classes-test-page.html' );
		
		// EXACT structure from the original failing test
		const combinedCssContent = `
			<h2 class="banner-title text-bold" style="color: #2c3e50;">Ready to Get Started?</h2>
			<style>
				.text-bold {
					font-weight: 700;
					letter-spacing: 1px;
				}
				.banner-title {
					font-size: 36px;
					margin-bottom: 30px;
					text-transform: uppercase;
					text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
				}
			</style>
		`;

		console.log( '🔍 DEBUG: Converting HTML with class-based letter-spacing and text-transform' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		console.log( '🔍 DEBUG: API Result:', {
			success: apiResult.success,
			post_id: apiResult.post_id,
			widgets_created: apiResult.widgets_created,
			global_classes_created: apiResult.global_classes_created
		} );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 DEBUG: Skipping test due to validation failure:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}
		
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		console.log( '🔍 DEBUG: Navigating to editor URL:', editUrl );
		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		console.log( '🔍 DEBUG: Editor loaded, testing class-based properties' );

		await test.step( 'Test class-based letter-spacing and text-transform', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const heading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Ready to Get Started?' } );
			await heading.waitFor( { state: 'visible', timeout: 10000 } );

			// Get all computed styles for debugging
			const computedStyles = await heading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					text: el.textContent.trim(),
					letterSpacing: styles.letterSpacing,
					textTransform: styles.textTransform,
					fontSize: styles.fontSize,
					fontWeight: styles.fontWeight,
					color: styles.color,
					textShadow: styles.textShadow
				};
			} );

			console.log( '🔍 DEBUG: Class-based computed styles:', computedStyles );

			// Test the specific properties that were failing in the original test
			console.log( '🔍 DEBUG: Testing letter-spacing from .text-bold class' );
			console.log( `🔍 DEBUG: Expected: 1px, Actual: ${ computedStyles.letterSpacing }` );
			
			console.log( '🔍 DEBUG: Testing text-transform from .banner-title class' );
			console.log( `🔍 DEBUG: Expected: uppercase, Actual: ${ computedStyles.textTransform }` );

			// These are the assertions that were failing in the original test
			await expect( heading ).toHaveCSS( 'letter-spacing', '1px' );
			await expect( heading ).toHaveCSS( 'text-transform', 'uppercase' );
			
			// Also test other properties to ensure they're working
			await expect( heading ).toHaveCSS( 'font-size', '36px' );
			await expect( heading ).toHaveCSS( 'font-weight', '700' );
			await expect( heading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' );

			console.log( '✅ SUCCESS: All class-based properties are working correctly!' );
		} );

		await test.step( 'Test on frontend as well', async () => {
			console.log( '🔍 DEBUG: Publishing and testing on frontend' );
			
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			console.log( '🔍 DEBUG: Navigating to frontend page ID:', pageId );
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			const frontendHeading = page.locator( '.e-heading-base' ).filter( { hasText: 'Ready to Get Started?' } );

			// Get frontend computed styles for debugging
			const frontendStyles = await frontendHeading.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					text: el.textContent.trim(),
					letterSpacing: styles.letterSpacing,
					textTransform: styles.textTransform,
					fontSize: styles.fontSize,
					fontWeight: styles.fontWeight,
					color: styles.color
				};
			} );

			console.log( '🔍 DEBUG: Frontend computed styles:', frontendStyles );

			// Test the same properties on frontend
			await expect( frontendHeading ).toHaveCSS( 'letter-spacing', '1px' );
			await expect( frontendHeading ).toHaveCSS( 'text-transform', 'uppercase' );
			await expect( frontendHeading ).toHaveCSS( 'font-size', '36px' );
			await expect( frontendHeading ).toHaveCSS( 'font-weight', '700' );
			await expect( frontendHeading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' );

			console.log( '✅ SUCCESS: All class-based properties working on frontend too!' );
		} );
	} );
} );
