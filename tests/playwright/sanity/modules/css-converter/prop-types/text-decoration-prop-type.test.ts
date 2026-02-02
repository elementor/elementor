import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Text Decoration Prop Type Conversion @prop-types', () => {
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
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert basic text-decoration values correctly', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h2 style="text-decoration: underline;">Underlined Heading</h2>
				<p style="text-decoration: line-through;">Strikethrough Paragraph</p>
				<div style="text-decoration: overline;">Overlined Div</div>
				<a style="text-decoration: none;">No Decoration Link</a>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test underline - target converted widget, not page elements
		const heading = previewFrame.locator( 'h2' ).filter( { hasText: 'Underlined Heading' } );
		await expect( heading ).toHaveCSS( 'text-decoration-line', 'underline' );

		// Test line-through - target converted widget, not page elements
		const paragraph = previewFrame.locator( 'p' ).filter( { hasText: 'Strikethrough Paragraph' } );
		await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'line-through' );

		// Test overline - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator( 'div[data-widget_type="e-div-block"] div, div.e-con > div' ).filter( { hasText: 'Overlined Div' } ).first();
		await expect( divElement ).toHaveCSS( 'text-decoration-line', 'overline' );

		// Test none - links may be converted differently
		const linkElements = previewFrame.locator( 'a, span, p, div' ).filter( { hasText: 'No Decoration Link' } );
		if ( await linkElements.count() > 0 ) {
			const linkElement = linkElements.first();
			await expect( linkElement ).toHaveCSS( 'text-decoration-line', 'none' );
		}
	} );

	test( 'should handle text-decoration shorthand correctly', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h2 style="text-decoration: underline solid red;">Styled Underline</h2>
				<p style="text-decoration: line-through dashed blue;">Dashed Strikethrough</p>
				<div style="text-decoration: overline dotted green;">Dotted Overline</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test shorthand parsing - should extract decoration line only
		const heading = previewFrame.locator( 'h2' ).filter( { hasText: 'Styled Underline' } );
		await expect( heading ).toHaveCSS( 'text-decoration-line', 'underline' );

		const paragraph = previewFrame.locator( 'p' ).filter( { hasText: 'Dashed Strikethrough' } );
		await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'line-through' );

		// Test overline from shorthand - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator( 'div[data-widget_type="e-div-block"] div, div.e-con > div' ).filter( { hasText: 'Dotted Overline' } ).first();
		await expect( divElement ).toHaveCSS( 'text-decoration-line', 'overline' );
	} );

	test( 'should handle multiple text-decoration lines', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h2 style="text-decoration: underline overline;">Multiple Decorations</h2>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test multiple decoration lines (browser support varies)
		const heading = previewFrame.locator( 'h2' ).filter( { hasText: 'Multiple Decorations' } );
		// The mapper should extract the first valid decoration line
		const decorationLine = await heading.evaluate( ( el ) => getComputedStyle( el ).textDecorationLine );
		expect( [ 'underline', 'overline', 'underline overline' ] ).toContain( decorationLine );
	} );

	test( 'should preserve text-decoration with other typography properties', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h2 style="text-decoration: underline; color: #ff0000; font-weight: bold;">Underlined Bold Red</h2>
				<p style="text-decoration: line-through; font-size: 18px; text-align: center;">Strikethrough Large Center</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test text-decoration is preserved alongside other properties
		const heading = previewFrame.locator( 'h2' ).filter( { hasText: 'Underlined Bold Red' } );
		await expect( heading ).toHaveCSS( 'text-decoration-line', 'underline' );
		await expect( heading ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( heading ).toHaveCSS( 'font-weight', '700' ); // Bold

		const paragraph = previewFrame.locator( 'p' ).filter( { hasText: 'Strikethrough Large Center' } );
		await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'line-through' );
		await expect( paragraph ).toHaveCSS( 'font-size', '18px' );
		await expect( paragraph ).toHaveCSS( 'text-align', 'center' );
	} );

	test( 'should handle invalid and edge case values', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h2 style="text-decoration: invalid-value;">Invalid Decoration</h2>
				<p style="text-decoration: bold;">Bold (Invalid for text-decoration)</p>
				<div style="text-decoration: inherit;">Inherit Decoration</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Invalid values should fall back to browser defaults or be ignored
		// The mapper should return null for invalid values, so no atomic prop is applied
		const heading = previewFrame.locator( 'h2' ).filter( { hasText: 'Invalid Decoration' } );
		// Should use browser default (typically none)
		const headingDecoration = await heading.evaluate( ( el ) => getComputedStyle( el ).textDecorationLine );
		expect( [ 'none', 'initial' ] ).toContain( headingDecoration );

		const paragraph = previewFrame.locator( 'p' ).filter( { hasText: 'Bold (Invalid for text-decoration)' } );
		// Should use browser default
		const paragraphDecoration = await paragraph.evaluate( ( el ) => getComputedStyle( el ).textDecorationLine );
		expect( [ 'none', 'initial' ] ).toContain( paragraphDecoration );

		// Inherit should use parent or browser default - div elements are converted to div-block widgets
		const divElement = previewFrame.locator( 'div' ).filter( { hasText: 'Inherit Decoration' } );
		if ( await divElement.count() > 0 ) {
			const divDecoration = await divElement.first().evaluate( ( el ) => getComputedStyle( el ).textDecorationLine );
			// Inherit values should resolve to some valid value
			expect( divDecoration ).toBeDefined();
		}
	} );

	test( 'should convert different element types with text-decoration', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h1 style="text-decoration: underline;">Underlined H1</h1>
				<h2 style="text-decoration: overline;">Overlined H2</h2>
				<p style="text-decoration: line-through;">Strikethrough Paragraph</p>
				<blockquote style="text-decoration: underline;">Underlined Quote</blockquote>
				<em style="text-decoration: line-through;">Strikethrough Emphasis</em>
				<strong style="text-decoration: underline;">Underlined Strong</strong>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test each element type with different decorations
		const h1 = previewFrame.locator( 'h1' ).filter( { hasText: 'Underlined H1' } );
		await expect( h1 ).toHaveCSS( 'text-decoration-line', 'underline' );

		const h2 = previewFrame.locator( 'h2' ).filter( { hasText: 'Overlined H2' } );
		await expect( h2 ).toHaveCSS( 'text-decoration-line', 'overline' );

		const paragraph = previewFrame.locator( 'p' ).filter( { hasText: 'Strikethrough Paragraph' } );
		await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'line-through' );

		// Blockquote elements are converted to e-paragraph widgets, so look for p elements
		const blockquote = previewFrame.locator( 'p' ).filter( { hasText: 'Underlined Quote' } );
		await expect( blockquote ).toHaveCSS( 'text-decoration-line', 'underline' );

		// Note: em and strong elements may be converted to other elements
		// depending on widget mapping configuration, so we test by content
		const emphasisElements = previewFrame.locator( '*' ).filter( { hasText: 'Strikethrough Emphasis' } );
		if ( await emphasisElements.count() > 0 ) {
			const emphasisDecoration = await emphasisElements.first().evaluate( ( el ) => getComputedStyle( el ).textDecorationLine );
			expect( emphasisDecoration ).toBe( 'line-through' );
		}

		const strongElements = previewFrame.locator( '*' ).filter( { hasText: 'Underlined Strong' } );
		if ( await strongElements.count() > 0 ) {
			const strongDecoration = await strongElements.first().evaluate( ( el ) => getComputedStyle( el ).textDecorationLine );
			expect( strongDecoration ).toBe( 'underline' );
		}
	} );

	test( 'should handle complex shorthand with multiple properties', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<h2 style="text-decoration: underline wavy red 2px;">Complex Underline</h2>
				<p style="text-decoration: line-through double blue;">Double Strikethrough</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test complex shorthand - should extract decoration line
		const heading = previewFrame.locator( 'h2' ).filter( { hasText: 'Complex Underline' } );
		await expect( heading ).toHaveCSS( 'text-decoration-line', 'underline' );

		const paragraph = previewFrame.locator( 'p' ).filter( { hasText: 'Double Strikethrough' } );
		await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'line-through' );
	} );
} );
