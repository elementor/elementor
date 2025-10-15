import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

/**
 * Base class for prop type tests that handles common setup and teardown
 * 
 * IMPORTANT: This class now uses text-based selectors instead of CSS class selectors
 * for improved test reliability. Use patterns like:
 * - frame.locator('p').filter({ hasText: /pattern/i })
 * - frame.locator('h2').filter({ hasText: /specific text/i })
 * 
 * Avoid using CSS class selectors like '.elementor-widget-e-paragraph p' as they
 * may not exist or may change between test runs.
 */
export abstract class BasePropTypeTest {
	protected wpAdmin: WpAdminPage;
	protected editor: EditorPage;
	protected cssHelper: CssConverterHelper;

	/**
	 * Sets up the test environment with atomic widgets experiments
	 */
	static setupTestSuite() {
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

		return { cssHelper };
	}

	/**
	 * Sets up the test instance for each test
	 */
	setupTestInstance() {
		test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
			this.wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		} );
	}

	/**
	 * Converts HTML with CSS and validates the result
	 * @param request - Playwright request context
	 * @param htmlContent - HTML content to convert
	 * @param cssOptions - Optional CSS converter options
	 * @returns Promise with postId and editUrl if successful, or skips test if failed
	 */
	protected async convertAndValidate(
		request: any,
		htmlContent: string,
		cssOptions: any = {}
	): Promise<{ postId: number; editUrl: string }> {
		const apiResult = await this.cssHelper.convertHtmlWithCss( request, htmlContent, cssOptions );
		
		const validation = this.cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			throw new Error( 'Test skipped due to API validation failure' );
		}

		return {
			postId: apiResult.post_id,
			editUrl: apiResult.edit_url
		};
	}

	/**
	 * Navigates to the editor and waits for it to load
	 * @param page - Playwright page
	 * @param editUrl - Editor URL
	 * @param testInfo - Test info from Playwright
	 */
	protected async navigateToEditor( page: any, editUrl: string, testInfo: any ): Promise<void> {
		await page.goto( editUrl );
		this.editor = new EditorPage( page, testInfo );
		await this.editor.waitForPanelToLoad();
	}

	/**
	 * Gets the preview frame from the editor
	 * @returns Elementor preview frame
	 */
	protected getPreviewFrame() {
		return this.editor.getPreviewFrame();
	}

	/**
	 * Creates a text-based selector using content filtering
	 * @param elementType - HTML element type (e.g., 'p', 'h2', 'div')
	 * @param textPattern - Regex pattern to match text content
	 * @returns Locator with text-based filtering
	 */
	protected createTextBasedSelector( frame: any, elementType: string, textPattern: RegExp ) {
		return frame.locator( elementType ).filter( { hasText: textPattern } );
	}

	/**
	 * Publishes the page and navigates to frontend
	 * @param page - Playwright page
	 * @returns Promise that resolves when frontend is loaded
	 */
	protected async publishAndNavigateToFrontend( page: any ): Promise<void> {
		await this.editor.saveAndReloadPage();
		const pageId = await this.editor.getPageId();
		await page.goto( `/?p=${ pageId }` );
		await page.waitForLoadState();
	}

	/**
	 * Runs CSS assertions for both editor and frontend
	 * @param testCases - Array of test cases with selectors and expected values
	 * @param page - Playwright page
	 * @param elementSelector - CSS selector for elements to test (use text-based selectors like 'p' with .filter())
	 */
	protected async runCssAssertions(
		testCases: Array<{ index: number; name: string; property: string; expected: string }>,
		page: any,
		elementSelector: string = 'p'
	): Promise<void> {
		const elementorFrame = this.getPreviewFrame();
		await elementorFrame.waitForLoadState();
		
		const elements = elementorFrame.locator( elementSelector );
		await elements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Editor verification
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const element = elements.nth( testCase.index );
				await expect( element ).toHaveCSS( testCase.property, testCase.expected );
			} );
		}

		// Frontend verification
		await test.step( 'Publish page and verify styles on frontend', async () => {
			await this.publishAndNavigateToFrontend( page );

			const frontendElements = page.locator( elementSelector );
			
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = frontendElements.nth( testCase.index );
					await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
				} );
			}
		} );
	}
}

/**
 * Interface for standardized prop type test configuration
 */
export interface PropTypeTestConfig {
	testName: string;
	htmlContent: string;
	testCases: Array<{
		index: number;
		name: string;
		property: string;
		expected: string;
	}>;
	elementSelector?: string; // Use text-based selectors like 'p' with .filter({ hasText: /pattern/i })
	textPattern?: RegExp; // Optional: regex pattern for text-based filtering
	elementType?: string; // Optional: HTML element type (defaults to 'p')
	cssOptions?: any;
}

/**
 * Factory function to create standardized prop type tests
 * @param config - Test configuration
 */
export function createPropTypeTest( config: PropTypeTestConfig ) {
	test( config.testName, async ( { page, request }, testInfo ) => {
		const cssHelper = new CssConverterHelper();
		const testInstance = new (class extends BasePropTypeTest {
			constructor() {
				super();
				this.cssHelper = cssHelper;
			}
		})();

		// Convert HTML and validate result
		const { postId, editUrl } = await testInstance.convertAndValidate(
			request,
			config.htmlContent,
			config.cssOptions || {}
		);

		// Navigate to editor
		await testInstance.navigateToEditor( page, editUrl, testInfo );

		// Run CSS assertions for both editor and frontend
		await testInstance.runCssAssertions(
			config.testCases,
			page,
			config.elementSelector || 'p'
		);
	} );
}
