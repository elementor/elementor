import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Letter Spacing Prop Type Integration @prop-types', () => {
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
		// await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert letter-spacing properties and verify styles', async ( { page, request } ) => {
		
		const combinedCssContent = `
			<div>
				<h1 style="letter-spacing: 1px;" data-test="letter-spacing-1px">Letter spacing 1px</h1>
				<h2 style="letter-spacing: 2px;" data-test="letter-spacing-2px">Letter spacing 2px</h2>
				<p style="letter-spacing: 0.5px;" data-test="letter-spacing-half">Letter spacing 0.5px</p>
				<p style="letter-spacing: 1.5px;" data-test="letter-spacing-decimal">Letter spacing 1.5px</p>
				<p style="letter-spacing: 0.1em;" data-test="letter-spacing-em">Letter spacing 0.1em</p>
				<p style="letter-spacing: normal;" data-test="letter-spacing-normal">Letter spacing normal</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();


		// Define test cases for letter-spacing properties - target by text content to avoid page elements
		const testCases = [
			{ 
				name: 'letter-spacing: 1px on h1', 
				property: 'letter-spacing', 
				expected: '1px',
				selector: 'h1',
				text: 'Letter spacing 1px'
			},
			{ 
				name: 'letter-spacing: 2px on h2', 
				property: 'letter-spacing', 
				expected: '2px',
				selector: 'h2',
				text: 'Letter spacing 2px'
			},
			{ 
				name: 'letter-spacing: 0.5px on p', 
				property: 'letter-spacing', 
				expected: '0.5px',
				selector: 'p',
				text: 'Letter spacing 0.5px'
			},
			{ 
				name: 'letter-spacing: 1.5px on p', 
				property: 'letter-spacing', 
				expected: '1.5px',
				selector: 'p',
				text: 'Letter spacing 1.5px'
			},
			{ 
				name: 'letter-spacing: 0.1em on p', 
				property: 'letter-spacing', 
				expected: '1.6px', // 0.1em at 16px font size = 1.6px
				selector: 'p',
				text: 'Letter spacing 0.1em'
			},
		];

		// Editor verification
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				// Target converted widget by text content to avoid page elements
				const element = elementorFrame.locator( testCase.selector ).filter({ hasText: testCase.text });
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				// Get actual computed style for debugging
				const actualValue = await element.evaluate( ( el ) => {
					return window.getComputedStyle( el ).letterSpacing;
				} );


				// Verify the letter-spacing CSS property
				await expect( element ).toHaveCSS( testCase.property, testCase.expected );
			} );
		}

		await test.step( 'Publish page and verify letter-spacing styles on frontend', async () => {
			
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					// Target converted widget by text content to avoid page elements
					const frontendElement = page.locator( testCase.selector ).filter({ hasText: testCase.text });

					// Get actual computed style for debugging
					const actualValue = await frontendElement.evaluate( ( el ) => {
						return window.getComputedStyle( el ).letterSpacing;
					} );


					// Verify the letter-spacing CSS property on frontend
					await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
				} );
			}
		} );
	} );
} );
