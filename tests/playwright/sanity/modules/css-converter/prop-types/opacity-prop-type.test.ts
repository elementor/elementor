import { test, expect } from '@playwright/test';
import EditorPage from '../../../../../pages/editor-page';
import { convertHtmlWithCss } from '../../../../../helpers/css-converter-helper';
import WpAdminPage from '../../../../../pages/wp-admin-page';

test.describe( 'Opacity Prop Type Integration @prop-types', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;

	test.beforeEach( async ( { page } ) => {
		editor = new EditorPage( page );
		wpAdmin = new WpAdminPage( page );

		await wpAdmin.login();
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );
	} );

	test.afterEach( async () => {
		await wpAdmin.resetExperiments();
	} );

	test( 'should convert opacity properties and verify styling', async ( { page } ) => {
		const combinedCssContent = `
			<div>
				<p style="opacity: 0.5;" data-test="decimal-opacity">Decimal opacity</p>
				<p style="opacity: 75%;" data-test="percentage-opacity">Percentage opacity</p>
				<p style="opacity: 1;" data-test="full-opacity">Full opacity</p>
				<p style="opacity: 0;" data-test="zero-opacity">Zero opacity</p>
				<p style="opacity: 0.25;" data-test="quarter-opacity">Quarter opacity</p>
			</div>
		`;

		const apiResult = await convertHtmlWithCss( page, combinedCssContent, '' );
		const postId = apiResult.post_id;

		expect( postId ).toBeDefined();

		await editor.gotoPostId( postId );

		// Define test cases for both editor and frontend verification
		const testCases = [
			{
				index: 0,
				name: 'opacity: 0.5',
				expected: '0.5'
			},
			{
				index: 1,
				name: 'opacity: 75%',
				expected: '0.75'
			},
			{
				index: 2,
				name: 'opacity: 1',
				expected: '1'
			},
			{
				index: 3,
				name: 'opacity: 0',
				expected: '0'
			},
			{
				index: 4,
				name: 'opacity: 0.25',
				expected: '0.25'
			},
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await expect( element ).toHaveCSS( 'opacity', testCase.expected );
			} );
		}

		// Frontend verification
		await editor.saveAndReloadPage();
		await page.goto( `/?p=${ postId }` );

		// Frontend verification using same test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } on frontend`, async () => {
				const element = page.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'attached', timeout: 5000 } );

				await expect( element ).toHaveCSS( 'opacity', testCase.expected );
			} );
		}
	} );
} );
