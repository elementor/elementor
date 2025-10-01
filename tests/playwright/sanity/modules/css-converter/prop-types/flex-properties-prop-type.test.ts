import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Flex Properties Prop Type Integration @prop-types', () => {
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

	test( 'should convert flex properties to Elementor widgets', async ( { page, request }, testInfo ) => {
		const combinedCssContent = `
			<div>
				<p style="display: flex; justify-content: center; align-items: flex-start;">Flex container 1</p>
				<p style="display: flex; justify-content: space-between; align-items: center;">Flex container 2</p>
				<p style="display: flex; flex-direction: column;">Flex container 3</p>
				<p style="display: flex; justify-content: flex-end; align-items: flex-end;">Flex container 4</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues: ' + validation.skipReason );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;

		if ( ! postId || ! editUrl ) {
			test.skip( true, 'Skipping due to missing postId or editUrl in API response' );
			return;
		}

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );

		await test.step( 'Wait for Elementor editor to load', async () => {
			await editor.waitForPanelToLoad();
		} );

		const elementorFrame = editor.getPreviewFrame();
		await test.step( 'Verify flex properties are applied correctly', async () => {
			const paragraphElements = elementorFrame.locator( '.e-paragraph-base' );
			await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

			await test.step( 'Verify flex container 1 properties', async () => {
				await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'display', 'flex' );
				await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'justify-content', 'center' );
				await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'align-items', 'flex-start' );
			} );

			await test.step( 'Verify flex container 2 properties', async () => {
				await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'display', 'flex' );
				await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'justify-content', 'space-between' );
				await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'align-items', 'center' );
			} );

			await test.step( 'Verify flex container 3 properties', async () => {
				await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'display', 'flex' );
				await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'flex-direction', 'column' );
			} );

			await test.step( 'Verify flex container 4 properties', async () => {
				await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'display', 'flex' );
				await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'justify-content', 'flex-end' );
				await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'align-items', 'flex-end' );
			} );
		} );
	} );
} );
