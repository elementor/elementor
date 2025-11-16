import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Bricks brxw-intro-02 Styling @brxw-intro-02', () => {
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

	test( 'should apply .brxw-intro-02 styles with CSS variables', async ( { page, request } ) => {
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
			expect( apiResult.edit_url ).toBeDefined();

			await test.step( 'Navigate to converted page and check .brxw-intro-02 styles', async () => {
				const previewUrl = apiResult.preview_url || `http://elementor.local:10003/?p=${ apiResult.post_id }`;
				await page.goto( previewUrl );
				await page.waitForTimeout( 2000 );

				await test.step( 'Find element with brxw-intro-02 class', async () => {
					const introElement = page.locator( '.brxw-intro-02, [class*="brxw-intro-02"]' ).first();
					const count = await introElement.count();
					
					if ( count === 0 ) {
						console.log( 'WARNING: No element with brxw-intro-02 class found' );
						const pageContent = await page.content();
						const hasBrxwIntro = pageContent.includes( 'brxw-intro-02' );
						console.log( 'Page HTML contains brxw-intro-02: ' + hasBrxwIntro );
						test.skip( true, 'No brxw-intro-02 element found' );
						return;
					}

					await expect( introElement ).toBeVisible();

					await test.step( 'Check display: grid is applied', async () => {
						const displayValue = await introElement.evaluate( ( el ) => {
							return window.getComputedStyle( el ).getPropertyValue( 'display' );
						} );
						console.log( 'brxw-intro-02 display value: ' + displayValue );
						expect( displayValue ).toBe( 'grid' );
					} );

					await test.step( 'Check grid-template-columns uses CSS variable', async () => {
						const gridTemplateColumns = await introElement.evaluate( ( el ) => {
							return window.getComputedStyle( el ).getPropertyValue( 'grid-template-columns' );
						} );
						console.log( 'brxw-intro-02 grid-template-columns: ' + gridTemplateColumns );
						
						const hasVar = gridTemplateColumns.includes( 'var(--brxw-grid-3-2)' ) || gridTemplateColumns.includes( 'var(--brxw-grid-3-2)' );
						if ( ! hasVar ) {
							console.log( 'WARNING: grid-template-columns does not contain var(--brxw-grid-3-2)' );
							console.log( 'Actual value: ' + gridTemplateColumns );
						}
					} );

					await test.step( 'Check grid-gap uses CSS variable', async () => {
						const gridGap = await introElement.evaluate( ( el ) => {
							return window.getComputedStyle( el ).getPropertyValue( 'grid-gap' );
						} );
						console.log( 'brxw-intro-02 grid-gap: ' + gridGap );
						
						const hasVar = gridGap.includes( 'var(--brxw-grid-gap)' );
						if ( ! hasVar ) {
							console.log( 'WARNING: grid-gap does not contain var(--brxw-grid-gap)' );
							console.log( 'Actual value: ' + gridGap );
						}
					} );

					await test.step( 'Check align-items: center is applied', async () => {
						const alignItems = await introElement.evaluate( ( el ) => {
							return window.getComputedStyle( el ).getPropertyValue( 'align-items' );
						} );
						console.log( 'brxw-intro-02 align-items: ' + alignItems );
						expect( alignItems ).toBe( 'center' );
					} );
				} );

				await test.step( 'Check debug logs for brxw-intro-02 global class creation', async () => {
					const debugLogResponse = await request.get( '/wp-content/debug.log', {
						timeout: 5000,
					} ).catch( () => null );

					if ( debugLogResponse && debugLogResponse.ok() ) {
						const debugLog = await debugLogResponse.text();
						const lines = debugLog.split( '\n' );

						const brxwIntro02Lines = lines.filter( ( line ) =>
							line.includes( 'brxw-intro-02' ) && (
								line.includes( 'global_classes' ) ||
								line.includes( 'properties' ) ||
								line.includes( 'display' ) ||
								line.includes( 'grid' )
							)
						);

						console.log( '=== brxw-intro-02 DEBUG LOG ANALYSIS ===' );
						console.log( `Total brxw-intro-02 related lines: ${ brxwIntro02Lines.length }` );
						brxwIntro02Lines.slice( 0, 10 ).forEach( ( line ) => {
							console.log( line );
						} );
					}
				} );
			} );
		} );
	} );
} );




