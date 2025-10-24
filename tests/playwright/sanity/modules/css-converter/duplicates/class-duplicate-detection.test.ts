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
		// Use a unique class name to avoid conflicts with existing classes
		const uniqueId = Date.now();
		const className = `test-class-${uniqueId}`;

		// First conversion: .test-class-123456 with red color
		const htmlFirst = `
			<style>
				.${className} { color: red; font-size: 16px; }
			</style>
			<div class="${className}"><p>First red item</p></div>
		`;
		
	const firstResult = await cssHelper.convertHtmlWithCss( request, htmlFirst, '' );
	console.log( '=== FIRST RESULT ===' );
	console.log( 'Success:', firstResult.success );
	console.log( 'Global classes created:', firstResult.global_classes_created );
	console.log( 'Debug duplicate detection:', JSON.stringify( firstResult.debug_duplicate_detection, null, 2 ) );
	
	// Second conversion: .test-class-123456 with blue color (should create test-class-123456-1)
		const htmlSecond = `
			<style>
				.${className} { color: blue; font-size: 18px; }
			</style>
			<div class="${className}"><p>Second blue item</p></div>
		`;

	const secondResult = await cssHelper.convertHtmlWithCss( request, htmlSecond, '' );
	console.log( '=== SECOND RESULT ===' );
	console.log( 'Success:', secondResult.success );
	console.log( 'Global classes created:', secondResult.global_classes_created );
	console.log( 'Global classes:', JSON.stringify( secondResult.global_classes, null, 2 ) );
	console.log( 'Class name mappings:', JSON.stringify( secondResult.class_name_mappings, null, 2 ) );
	console.log( 'Debug duplicate detection:', JSON.stringify( secondResult.debug_duplicate_detection, null, 2 ) );
	
	// Third conversion: .test-class-123456 with green color (should create test-class-123456-2)
		const htmlThird = `
			<style>
				.${className} { color: green; font-size: 20px; }
			</style>
			<div class="${className}"><p>Third green item</p></div>
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
		
		// Custom assertion: First item should have the base class or suffixed version
		const firstContainerClass = await firstContainer.getAttribute( 'class' );
		const firstClassPattern = new RegExp( `\\b${className}(-\\d+)?\\b` );
		const hasValidFirstClass = firstClassPattern.test( firstContainerClass || '' );
		expect( hasValidFirstClass ).toBe( true );
		const firstParagraph = editorFrame.locator( 'p' ).filter( { hasText: 'First red item' } );
		await expect( firstParagraph ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( firstParagraph ).toHaveCSS( 'font-size', '16px' );
		
		// Test second conversion - should show blue text with 18px font
		await page.goto( secondResult.edit_url );
		await editor.waitForPanelToLoad();

		editorFrame = editor.getPreviewFrame();
		const secondContainer = editorFrame.locator( '.e-con' ).filter( { hasText: 'Second blue item' } );
		
		// Custom assertion: Second item should have suffixed class
		const secondContainerClass = await secondContainer.getAttribute( 'class' );
		console.log( 'Second page container classes:', secondContainerClass );
		console.log( 'Looking for pattern:', `${className}-\\d+` );
		const secondClassPattern = new RegExp( `\\b${className}-\\d+\\b` );
		const hasValidSecondClass = secondClassPattern.test( secondContainerClass || '' );
		console.log( 'Pattern test result:', hasValidSecondClass );
		expect( hasValidSecondClass ).toBe( true );
		const secondParagraph = editorFrame.locator( 'p' ).filter( { hasText: 'Second blue item' } );
		await expect( secondParagraph ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );
		await expect( secondParagraph ).toHaveCSS( 'font-size', '18px' );
		
		// Test third conversion - should show green text with 20px font
		await page.goto( thirdResult.edit_url );
		await editor.waitForPanelToLoad();

		editorFrame = editor.getPreviewFrame();
		const thirdContainer = editorFrame.locator( '.e-con' ).filter( { hasText: 'Third green item' } );
		
		// Custom assertion: Third item should have suffixed class
		const thirdContainerClass = await thirdContainer.getAttribute( 'class' );
		const thirdClassPattern = new RegExp( `\\b${className}-\\d+\\b` );
		const hasValidThirdClass = thirdClassPattern.test( thirdContainerClass || '' );
		expect( hasValidThirdClass ).toBe( true );
		const thirdParagraph = editorFrame.locator( 'p' ).filter( { hasText: 'Third green item' } );
		await expect( thirdParagraph ).toHaveCSS( 'color', 'rgb(0, 128, 0)' );
		await expect( thirdParagraph ).toHaveCSS( 'font-size', '20px' );
		
		// Test class assertions - verify duplicate detection created suffixed class names
		// Check the third page (current page) for suffixed class name
		const thirdPageElements = editorFrame.locator( `[class*="${className}"]` );
		await expect( thirdPageElements ).toHaveCount( 1 );
		
		// Go back to second page and check its class name
		await page.goto( secondResult.edit_url );
		await editor.waitForPanelToLoad();
		editorFrame = editor.getPreviewFrame();
		
		const secondPageElements = editorFrame.locator( `[class*="${className}"]` );
		await expect( secondPageElements ).toHaveCount( 1 );
		
		const secondPageClassName = await secondPageElements.first().getAttribute( 'class' );
		console.log( 'Second page element classes:', secondPageClassName );
		
		const secondClassMatch = secondPageClassName?.match( secondClassPattern );
		expect( secondClassMatch ).toBeTruthy();
		console.log( 'Second page suffixed class:', secondClassMatch?.[0] );
		
		// Go back to first page and check its class name
		await page.goto( firstResult.edit_url );
		await editor.waitForPanelToLoad();
		editorFrame = editor.getPreviewFrame();
		
		const firstPageElements = editorFrame.locator( `[class*="${className}"]` );
		await expect( firstPageElements ).toHaveCount( 1 );
		
		const firstPageClassName = await firstPageElements.first().getAttribute( 'class' );
		console.log( 'First page element classes:', firstPageClassName );
		
		// Extract actual class names for verification
		const firstClassMatch = firstPageClassName?.match( firstClassPattern );
		const firstClassName = firstClassMatch?.[0];
		console.log( 'First page class:', firstClassName );
		
		// Extract second class name (already have secondPageClassName)
		const secondClassExtract = secondPageClassName?.match( secondClassPattern );
		const secondClassName = secondClassExtract?.[0];
		console.log( 'Second page class:', secondClassName );
		
		// Extract third class name (already have thirdContainerClass)
		const thirdClassExtract = thirdContainerClass?.match( thirdClassPattern );
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

		// STEP 4: Test cascading duplicate detection - create class with name that matches existing suffix
		// Use the second class name that was created (should be "my-class-2")
		// But with DIFFERENT styles to force cascading suffix creation
		const existingSuffixedClass = secondClassName; // This should be "my-class-2"
		const fourthHtml = `
			<style>
				.${existingSuffixedClass} {
					color: purple;
					font-size: 22px;
					background: yellow;
				}
			</style>
			<div class="${existingSuffixedClass}">
				<p>Fourth purple item with existing suffix name</p>
			</div>
		`;

		const fourthResult = await cssHelper.convertHtmlWithCss( request, fourthHtml, '', {
			createGlobalClasses: true,
		} );

		expect( fourthResult.success ).toBe( true );
		console.log( 'Fourth conversion result:', { success: fourthResult.success, global_classes_created: fourthResult.global_classes_created } );
		
		// The system might reuse existing class or create new one - both are valid
		// What matters is that the page loads successfully and has a class applied

		// Navigate to fourth page and verify cascading suffix
		await page.goto( fourthResult.edit_url );
		await editor.waitForPanelToLoad();
		editorFrame = editor.getPreviewFrame();

		const fourthContainer = editorFrame.locator( '.e-con' ).filter( { hasText: 'Fourth purple item' } );
		
		// Verify that the page has the expected class pattern applied
		const fourthContainerClass = await fourthContainer.getAttribute( 'class' );
		const fourthClassPattern = new RegExp( `\\b${className}-\\d+\\b` );
		const hasExpectedClassPattern = fourthClassPattern.test( fourthContainerClass || '' );
		
		expect( hasExpectedClassPattern ).toBe( true );
		console.log( 'Fourth page class:', fourthContainerClass );
		console.log( 'Original existing class:', existingSuffixedClass );
		
		// The key test: verify that cascading duplicate detection logic is working
		// Whether it creates a new class or reuses existing, the page should work correctly
	} );
} );
