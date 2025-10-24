import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import { CssConverterHelper } from '../helper';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';

test.describe( 'Class Duplicate Detection @duplicate-detection', () => {
	let cssHelper: CssConverterHelper;
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should generate unique class names for duplicate class definitions', async ( { page, request }, testInfo ) => {
		// First conversion: .my-class with red color
		const htmlFirst = `
			<style>
				.my-class { color: red; font-size: 16px; }
			</style>
			<div class="my-class"><p>First red item</p></div>
		`;
		
		const firstResult = await cssHelper.convertHtmlWithCss( request, htmlFirst, '' );
		
		// Second conversion: .my-class with blue color (should create my-class-2)
		const htmlSecond = `
			<style>
				.my-class { color: blue; font-size: 18px; }
			</style>
			<div class="my-class"><p>Second blue item</p></div>
		`;
		
		const secondResult = await cssHelper.convertHtmlWithCss( request, htmlSecond, '' );
		
		// Third conversion: .my-class with green color (should create my-class-3)
		const htmlThird = `
			<style>
				.my-class { color: green; font-size: 20px; }
			</style>
			<div class="my-class"><p>Third green item</p></div>
		`;
		
		const thirdResult = await cssHelper.convertHtmlWithCss( request, htmlThird, '' );
		// await page.pause();
		console.log( 'First conversion result:', {
			success: firstResult.success,
			global_classes_created: firstResult.global_classes_created,
		} );
		
		console.log( 'Second conversion result:', {
			success: secondResult.success,
			global_classes_created: secondResult.global_classes_created,
		} );
		
		console.log( 'Third conversion result:', {
			success: thirdResult.success,
			global_classes_created: thirdResult.global_classes_created,
		} );
		
		// Test first conversion - should show red text with 16px font
		await page.goto( firstResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();
		// await page.pause();
		let editorFrame = editor.getPreviewFrame();
		const firstContainer = editorFrame.locator( '.e-con' ).filter( { hasText: 'First red item' } );
		
		// Custom assertion: First item should have .my-class or .my-class-{int}
		const firstContainerClass = await firstContainer.getAttribute( 'class' );
		const hasValidFirstClass = /\bmy-class(-\d+)?\b/.test( firstContainerClass || '' );
		expect( hasValidFirstClass ).toBe( true );
		const firstParagraph = editorFrame.locator( 'p' ).filter( { hasText: 'First red item' } );
		await expect( firstParagraph ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( firstParagraph ).toHaveCSS( 'font-size', '16px' );
		
		// Test second conversion - should show blue text with 18px font
		await page.goto( secondResult.edit_url );
		await editor.waitForPanelToLoad();

		editorFrame = editor.getPreviewFrame();
		const secondContainer = editorFrame.locator( '.e-con' ).filter( { hasText: 'Second blue item' } );
		
		// Custom assertion: Second item should have .my-class-{int}
		const secondContainerClass = await secondContainer.getAttribute( 'class' );
		const hasValidSecondClass = /\bmy-class-\d+\b/.test( secondContainerClass || '' );
		expect( hasValidSecondClass ).toBe( true );
		const secondParagraph = editorFrame.locator( 'p' ).filter( { hasText: 'Second blue item' } );
		await expect( secondParagraph ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );
		await expect( secondParagraph ).toHaveCSS( 'font-size', '18px' );
		
		// Test third conversion - should show green text with 20px font
		await page.goto( thirdResult.edit_url );
		await editor.waitForPanelToLoad();

		editorFrame = editor.getPreviewFrame();
		const thirdContainer = editorFrame.locator( '.e-con' ).filter( { hasText: 'Third green item' } );
		
		// Custom assertion: Third item should have .my-class-{int}
		const thirdContainerClass = await thirdContainer.getAttribute( 'class' );
		const hasValidThirdClass = /\bmy-class-\d+\b/.test( thirdContainerClass || '' );
		expect( hasValidThirdClass ).toBe( true );
		const thirdParagraph = editorFrame.locator( 'p' ).filter( { hasText: 'Third green item' } );
		await expect( thirdParagraph ).toHaveCSS( 'color', 'rgb(0, 128, 0)' );
		await expect( thirdParagraph ).toHaveCSS( 'font-size', '20px' );
		
		// Test class assertions - verify duplicate detection created suffixed class names
		// Check the third page (current page) for suffixed class name
		const thirdPageElements = editorFrame.locator( '[class*="my-class"]' );
		await expect( thirdPageElements ).toHaveCount( 1 );
		
		// Go back to second page and check its class name
		await page.goto( secondResult.edit_url );
		await editor.waitForPanelToLoad();
		editorFrame = editor.getPreviewFrame();
		
		const secondPageElements = editorFrame.locator( '[class*="my-class"]' );
		await expect( secondPageElements ).toHaveCount( 1 );
		
		const secondPageClassName = await secondPageElements.first().getAttribute( 'class' );
		console.log( 'Second page element classes:', secondPageClassName );
		
		const secondClassMatch = secondPageClassName?.match( /my-class-\d+/ );
		expect( secondClassMatch ).toBeTruthy();
		console.log( 'Second page suffixed class:', secondClassMatch?.[0] );
		
		// Go back to first page and check its class name
		await page.goto( firstResult.edit_url );
		await editor.waitForPanelToLoad();
		editorFrame = editor.getPreviewFrame();
		
		const firstPageElements = editorFrame.locator( '[class*="my-class"]' );
		await expect( firstPageElements ).toHaveCount( 1 );
		
		const firstPageClassName = await firstPageElements.first().getAttribute( 'class' );
		console.log( 'First page element classes:', firstPageClassName );
		
		// Extract actual class names for verification
		const firstClassMatch = firstPageClassName?.match( /\bmy-class(-\d+)?\b/ );
		const firstClassName = firstClassMatch?.[0];
		console.log( 'First page class:', firstClassName );
		
		// Extract second class name (already have secondPageClassName)
		const secondClassExtract = secondPageClassName?.match( /\bmy-class-\d+\b/ );
		const secondClassName = secondClassExtract?.[0];
		console.log( 'Second page class:', secondClassName );
		
		// Extract third class name (already have thirdContainerClass)
		const thirdClassExtract = thirdContainerClass?.match( /\bmy-class-\d+\b/ );
		const thirdClassName = thirdClassExtract?.[0];
		console.log( 'Third page class:', thirdClassName );
		
		// Verify all three pages have different class names
		expect( firstClassName ).toBeTruthy();
		expect( secondClassName ).toBeTruthy();
		expect( thirdClassName ).toBeTruthy();
		
		const allClassNames = [firstClassName, secondClassName, thirdClassName];
		const uniqueClassNames = [...new Set( allClassNames )];
		expect( uniqueClassNames.length ).toBe( 3 );
		console.log( 'All unique class names:', uniqueClassNames );
	} );
} );
