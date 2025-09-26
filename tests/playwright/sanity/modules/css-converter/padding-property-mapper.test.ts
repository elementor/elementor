import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { CssConverterHelper } from './helper';

test.describe( 'Padding Property Mapper Integration @css-converter', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async () => {
		cssHelper = new CssConverterHelper();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test.only( 'should convert single padding value and verify styling in editor and frontend', async ( { page, request } ) => {
		const cssContent = '<div><p style=\"padding-block: 20px;\">Test content with padding</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, cssContent );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify padding styling in editor', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();
			const elementWithPadding = elementorFrame.locator( '[data-element_type]' ).last();

			await elementWithPadding.waitFor( { state: 'visible', timeout: 10000 } );

			const editorComputedStyle = await elementWithPadding.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( editorComputedStyle.paddingTop ).toBe( '20px' );
			expect( editorComputedStyle.paddingRight ).toBe( '20px' );
			expect( editorComputedStyle.paddingBottom ).toBe( '20px' );
			expect( editorComputedStyle.paddingLeft ).toBe( '20px' );
		} );

		await test.step( 'Publish page and verify frontend styling', async () => {
			await editor.publishAndViewPage();

			const frontendElement = page.locator( '[data-element_type]' ).first();
			await frontendElement.waitFor( { state: 'visible', timeout: 10000 } );

			const frontendComputedStyle = await frontendElement.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( frontendComputedStyle.paddingTop ).toBe( '20px' );
			expect( frontendComputedStyle.paddingRight ).toBe( '20px' );
			expect( frontendComputedStyle.paddingBottom ).toBe( '20px' );
			expect( frontendComputedStyle.paddingLeft ).toBe( '20px' );
		} );
	} );

	test( 'should convert padding shorthand (2 values) and verify styling', async ( { page, request } ) => {
		const cssContent = '<div><p style="padding: 10px 20px;">Test content with shorthand padding</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, cssContent );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify shorthand padding in editor', async () => {
			// Wait for the Elementor iframe to be available
			await page.waitForSelector( 'iframe[name="elementor-preview-iframe"]', { timeout: 30000 } );

			// Wait for the Elementor iframe to be available
			await page.waitForSelector( 'iframe[name="elementor-preview-iframe"]', { timeout: 30000 } );

			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();
			const element = elementorFrame.locator( '[data-element_type]' ).first();

			const computedStyle = await element.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( computedStyle.paddingTop ).toBe( '10px' );
			expect( computedStyle.paddingRight ).toBe( '20px' );
			expect( computedStyle.paddingBottom ).toBe( '10px' );
			expect( computedStyle.paddingLeft ).toBe( '20px' );
		} );

		await test.step( 'Verify shorthand padding on frontend', async () => {
			await editor.publishAndViewPage();

			const frontendElement = page.locator( '[data-element_type]' ).first();

			const frontendStyle = await frontendElement.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( frontendStyle.paddingTop ).toBe( '10px' );
			expect( frontendStyle.paddingRight ).toBe( '20px' );
			expect( frontendStyle.paddingBottom ).toBe( '10px' );
			expect( frontendStyle.paddingLeft ).toBe( '20px' );
		} );
	} );

	test( 'should convert padding with mixed units and verify styling', async ( { page, request } ) => {
		const cssContent = '<div><p style="padding: 1em 2rem 3% 40px;">Mixed units padding</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, cssContent );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify mixed units padding in editor', async () => {
			// Wait for the Elementor iframe to be available
			await page.waitForSelector( 'iframe[name="elementor-preview-iframe"]', { timeout: 30000 } );

			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();
			const element = elementorFrame.locator( '[data-element_type]' ).first();

			const computedStyle = await element.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( parseFloat( computedStyle.paddingTop ) ).toBeGreaterThan( 0 );
			expect( parseFloat( computedStyle.paddingRight ) ).toBeGreaterThan( 0 );
			expect( parseFloat( computedStyle.paddingBottom ) ).toBeGreaterThan( 0 );
			expect( computedStyle.paddingLeft ).toBe( '40px' );
		} );

		await test.step( 'Verify mixed units padding on frontend', async () => {
			await editor.publishAndViewPage();

			const frontendElement = page.locator( '[data-element_type]' ).first();

			const frontendStyle = await frontendElement.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( parseFloat( frontendStyle.paddingTop ) ).toBeGreaterThan( 0 );
			expect( parseFloat( frontendStyle.paddingRight ) ).toBeGreaterThan( 0 );
			expect( parseFloat( frontendStyle.paddingBottom ) ).toBeGreaterThan( 0 );
			expect( frontendStyle.paddingLeft ).toBe( '40px' );
		} );
	} );

	test( 'should handle zero padding values correctly', async ( { page, request } ) => {
		const cssContent = '<div><p style="padding: 0;">Zero padding content</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, cssContent );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify zero padding in editor', async () => {
			// Wait for the Elementor iframe to be available
			await page.waitForSelector( 'iframe[name="elementor-preview-iframe"]', { timeout: 30000 } );

			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();
			const element = elementorFrame.locator( '[data-element_type]' ).first();

			const computedStyle = await element.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( computedStyle.paddingTop ).toBe( '0px' );
			expect( computedStyle.paddingRight ).toBe( '0px' );
			expect( computedStyle.paddingBottom ).toBe( '0px' );
			expect( computedStyle.paddingLeft ).toBe( '0px' );
		} );

		await test.step( 'Verify zero padding on frontend', async () => {
			await editor.publishAndViewPage();

			const frontendElement = page.locator( '[data-element_type]' ).first();

			const frontendStyle = await frontendElement.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					paddingTop: style.paddingTop,
					paddingRight: style.paddingRight,
					paddingBottom: style.paddingBottom,
					paddingLeft: style.paddingLeft,
				};
			} );

			expect( frontendStyle.paddingTop ).toBe( '0px' );
			expect( frontendStyle.paddingRight ).toBe( '0px' );
			expect( frontendStyle.paddingBottom ).toBe( '0px' );
			expect( frontendStyle.paddingLeft ).toBe( '0px' );
		} );
	} );
} );
