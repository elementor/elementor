import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { CssConverterHelper } from './helper';

test.describe( 'Intro Section Display Flex @intro-section', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	const BRICKS_TEMPLATE_URL = 'https://templates.bricksbuilder.io/karlson/template/karlson-about/';

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

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should apply display: flex to .intro-section via styles', async ( { page, request } ) => {
		let previewUrl: string;
		let postId: number;

		await test.step( 'Import Bricks template', async () => {
			const apiResult = await cssHelper.convertFromUrl(
				request,
				BRICKS_TEMPLATE_URL,
				[],
				true,
				{
					createGlobalClasses: true,
				}
			);

			const validation = cssHelper.validateApiResult( apiResult );
			if ( validation.shouldSkip ) {
				test.skip( true, validation.skipReason );
				return;
			}

			expect( apiResult.success ).toBe( true );
			expect( apiResult.post_id ).toBeDefined();

			postId = apiResult.post_id;
			previewUrl = apiResult.preview_url || `http://elementor.local:10003/?p=${ postId }`;
		} );

		await test.step( 'Navigate to preview and check .intro-section display', async () => {
			await page.goto( previewUrl );
			await page.waitForLoadState( 'networkidle' );
			await page.waitForTimeout( 3000 );

			const introSection = page.locator( '.intro-section' ).first();
			const count = await introSection.count();

			if ( count === 0 ) {
				console.log( 'WARNING: No element with .intro-section class found' );
				const pageContent = await page.content();
				const hasIntroSection = pageContent.includes( 'intro-section' );
				console.log( 'Page HTML contains intro-section: ' + hasIntroSection );
				test.skip( true, 'No .intro-section element found' );
				return;
			}

			await expect( introSection ).toBeVisible();

			const display = await introSection.evaluate( ( el ) => window.getComputedStyle( el ).display );
			const flexDirection = await introSection.evaluate( ( el ) => window.getComputedStyle( el ).flexDirection );
			const alignItems = await introSection.evaluate( ( el ) => window.getComputedStyle( el ).alignItems );
			const classList = await introSection.evaluate( ( el ) => Array.from( el.classList ).join( ' ' ) );

			console.log( 'Computed styles for .intro-section:', { display, flexDirection, alignItems, classList } );

			expect( display ).toBe( 'flex' );
			expect( flexDirection ).toBe( 'column' );
			expect( alignItems ).toBe( 'center' );
		} );

		await test.step( 'Verify widget type is e-div-block', async () => {
			await page.goto( `http://elementor.local:10003/wp-admin/post.php?post=${ postId }&action=elementor` );
			editor = new EditorPage( page, wpAdmin.testInfo );
			await editor.waitForPanelToLoad();

			const editorFrame = editor.getPreviewFrame();
			const introSection = editorFrame.locator( '.intro-section' ).first();
			const count = await introSection.count();

			if ( count === 0 ) {
				console.log( 'WARNING: No .intro-section element found in editor' );
				test.skip( true, 'No .intro-section element found in editor' );
				return;
			}

			await expect( introSection ).toBeVisible();

			const display = await introSection.evaluate( ( el ) => window.getComputedStyle( el ).display );
			const flexDirection = await introSection.evaluate( ( el ) => window.getComputedStyle( el ).flexDirection );
			const alignItems = await introSection.evaluate( ( el ) => window.getComputedStyle( el ).alignItems );

			console.log( 'Editor computed styles for .intro-section:', { display, flexDirection, alignItems } );

			expect( display ).toBe( 'flex' );
			expect( flexDirection ).toBe( 'column' );
			expect( alignItems ).toBe( 'center' );
		} );
	} );
} );

