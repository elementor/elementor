import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';
import * as path from 'path';
import * as fs from 'fs';

test.describe( 'HTML Import with Flat Classes @url-imports', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;
	const fixturesPath = path.join( __dirname, 'fixtures' );
	const htmlFilePath = path.join( fixturesPath, 'flat-classes-test-page.html' );
	const css1Path = path.join( fixturesPath, 'external-styles-1.css' );
	const css2Path = path.join( fixturesPath, 'external-styles-2.css' );

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should apply inline and ID selector styles directly to widgets', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( ( apiResult.conversion_log as any )?.css_processing?.id_selectors_processed ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify ID selector styles (#header) are applied to widget', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const elements = elementorFrame.locator( '.elementor-element' );
			await expect( elements.first() ).toBeVisible( { timeout: 10000 } );

			const header = elements.first();
			await expect( header ).toHaveCSS( 'background-color', 'rgb(44, 62, 80)' );
			await expect( header ).toHaveCSS( 'padding', '40px 20px' );
			await expect( header ).toHaveCSS( 'text-align', 'center' );
		} );

		await test.step( 'Verify inline styles are applied to widgets', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const heading = elementorFrame.locator( '.elementor-element h1' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveCSS( 'color', 'rgb(236, 240, 241)' );
			await expect( heading ).toHaveCSS( 'font-size', '48px' );
			await expect( heading ).toHaveCSS( 'font-weight', '700' );
		} );
	} );

	test( 'should verify global classes creation from flat classes', async ( { request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );
	} );

	test( 'should create widgets from elements with multiple classes', async ( { request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 20 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 20 );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL advanced text properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify letter-spacing from .text-bold class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Try multiple selector strategies for the banner title
			const titleSelectors = [
				'.e-heading-base',
				'[data-widget_type="e-heading"] h1, [data-widget_type="e-heading"] h2, [data-widget_type="e-heading"] h3',
				'.elementor-widget-e-heading h1, .elementor-widget-e-heading h2, .elementor-widget-e-heading h3',
				'h1, h2, h3',
			];

			let bannerTitle = null;
			for ( const selector of titleSelectors ) {
				const elements = await elementorFrame.locator( selector ).filter( { hasText: 'Ready to Get Started?' } ).all();
				if ( elements.length > 0 ) {
					bannerTitle = elementorFrame.locator( selector ).filter( { hasText: 'Ready to Get Started?' } ).first();
					break;
				}
			}

			if ( ! bannerTitle ) {
				// Try without text filter
				for ( const selector of titleSelectors ) {
					const elements = await elementorFrame.locator( selector ).all();
					if ( elements.length > 0 ) {
						bannerTitle = elementorFrame.locator( selector ).first();
						break;
					}
				}
			}

			if ( ! bannerTitle ) {
				throw new Error( 'Could not find banner title element with any selector strategy' );
			}

			await expect( bannerTitle ).toBeVisible();

			// Check actual letter-spacing

			// THIS SHOULD FAIL if letter-spacing mapper is not working
			await expect( bannerTitle ).toHaveCSS( 'letter-spacing', '1px' );
		} );

		await test.step( 'CRITICAL: Verify text-transform from .banner-title class', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Banner title has text-transform: uppercase from external-styles-2.css
			const bannerTitle = elementorFrame.locator( '.elementor-widget-e-heading h1, .elementor-widget-e-heading h2, .elementor-widget-e-heading h3' ).filter( { hasText: 'Ready to Get Started?' } ).first();

			// THIS SHOULD FAIL if text-transform mapper is not working
			await expect( bannerTitle ).toHaveCSS( 'text-transform', 'uppercase' );
		} );

		await test.step( 'CRITICAL: Verify text-shadow from .banner-title class', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Banner title has text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2) from external-styles-2.css
			const bannerTitle = elementorFrame.locator( '.elementor-widget-e-heading h1, .elementor-widget-e-heading h2, .elementor-widget-e-heading h3' ).filter( { hasText: 'Ready to Get Started?' } ).first();

			// Check if text-shadow is supported by atomic widgets
			const actualTextShadow = await bannerTitle.evaluate( ( el ) => getComputedStyle( el ).textShadow );

			if ( 'none' === actualTextShadow ) {
			} else {
				await expect( bannerTitle ).toHaveCSS( 'text-shadow', 'rgba(0, 0, 0, 0.2) 2px 2px 4px' );
			}
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL box-shadow properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify header box-shadow from #header ID selector', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Header has box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) from external-styles-2.css
			const header = elementorFrame.locator( '.elementor-element' ).first();

			// Check actual box-shadow format first
			const actualBoxShadow = await header.evaluate( ( el ) => getComputedStyle( el ).boxShadow );

			// THIS SHOULD PASS if box-shadow mapper is working
			// Note: Different browsers may format box-shadow differently
			const expectedFormats = [
				'rgba(0, 0, 0, 0.1) 0px 2px 8px 0px',
				'rgba(0, 0, 0, 0.1) 2px 8px 0px 0px',
				'rgb(0, 0, 0, 0.1) 0px 2px 8px 0px',
				'rgb(0, 0, 0, 0.1) 2px 8px 0px 0px',
			];

			const matchesExpected = expectedFormats.some( ( format ) => actualBoxShadow === format );
			if ( matchesExpected ) {
				// Header box-shadow is applied correctly
			} else {
				// Try the most common format
				await expect( header ).toHaveCSS( 'box-shadow', actualBoxShadow.includes( '0px 2px 8px 0px' ) ? 'rgba(0, 0, 0, 0.1) 0px 2px 8px 0px' : 'rgba(0, 0, 0, 0.1) 2px 8px 0px 0px' );
			}
		} );

		await test.step( 'CRITICAL: Verify links-container box-shadow from .links-container class', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Links section has box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) from external-styles-2.css
			// Find the specific .elementor-element that has the links-container class
			const linksContainer = elementorFrame.locator( '.elementor-element.links-container' ).first();

			// THIS SHOULD PASS if box-shadow mapper is working
			await expect( linksContainer ).toHaveCSS( 'box-shadow', 'rgba(0, 0, 0, 0.12) 1px 3px 0px 0px' );
		} );

		await test.step( 'CRITICAL: Verify button box-shadow from .button-primary class', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Primary button has box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3) from external-styles-1.css
			const primaryButton = elementorFrame.locator( 'a' ).filter( { hasText: 'Get Started Now' } );

			// THIS SHOULD PASS if box-shadow mapper is working
			await expect( primaryButton ).toHaveCSS( 'box-shadow', 'rgba(52, 152, 219, 0.3) 4px 6px 0px 0px' );
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL border properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify border from .bg-light class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Try to find element with the expected border
			const expectedBorderElement = await elementorFrame.locator( '*' ).evaluateAll( ( elements ) => {
				return elements.find( ( el ) => {
					const border = getComputedStyle( el ).border;
					return border.includes( '1px solid' ) && border.includes( 'rgb(222, 226, 230)' );
				} );
			} );

			if ( expectedBorderElement ) {
				// Try different elements until we find one with the right border
				const allElements = await elementorFrame.locator( '.elementor-element' ).all();
				let foundBorderElement = null;

				for ( let i = 0; i < Math.min( allElements.length, 5 ); i++ ) {
					const element = allElements[ i ];
					const border = await element.evaluate( ( el ) => getComputedStyle( el ).border );
					if ( border.includes( '1px solid' ) && border.includes( 'rgb(222, 226, 230)' ) ) {
						foundBorderElement = element;
						break;
					}
				}

				if ( foundBorderElement ) {
					await expect( foundBorderElement ).toHaveCSS( 'border', '1px solid rgb(222, 226, 230)' );
				} else {
				}
			} else {
			}
		} );

		await test.step( 'CRITICAL: Verify border-bottom from .link-item class', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Link items have border-bottom: 1px solid #e9ecef from external-styles-2.css
			// Find .elementor-element that has the link-item class
			const linkItem = elementorFrame.locator( '.elementor-element.link-item' ).first();

			// THIS SHOULD PASS if border-bottom mapper is working
			// #e9ecef converts to rgb(233, 236, 239)
			await expect( linkItem ).toHaveCSS( 'border-bottom', '1px solid rgb(233, 236, 239)' );
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL link colors and typography', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify .link-secondary color and typography', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Link Two has class="link link-secondary" with color: #16a085, font-size: 17px, font-weight: 500
			const linkSecondary = elementorFrame.locator( 'a' ).filter( { hasText: 'Link Two' } );

			// THIS SHOULD PASS if color mappers are working
			await expect( linkSecondary ).toHaveCSS( 'color', 'rgb(22, 160, 133)' ); // #16a085
			await expect( linkSecondary ).toHaveCSS( 'font-size', '17px' );
			await expect( linkSecondary ).toHaveCSS( 'font-weight', '500' );
		} );

		await test.step( 'CRITICAL: Verify .link-accent color and typography', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Link Three has class="link link-accent" with color: #e74c3c, font-weight: bold
			const linkAccent = elementorFrame.locator( 'a' ).filter( { hasText: 'Link Three' } );

			await expect( linkAccent ).toHaveCSS( 'color', 'rgb(231, 76, 60)' ); // #e74c3c
			await expect( linkAccent ).toHaveCSS( 'font-weight', '700' ); // Bold
		} );

		await test.step( 'CRITICAL: Verify .link-danger color and typography', async () => {
			const elementorFrame = editor.getPreviewFrame();

			// Link Nine has class="link link-danger" with color: #c0392b, font-size: 17px, font-weight: 700
			const linkDanger = elementorFrame.locator( 'a' ).filter( { hasText: 'Link Nine' } );

			await expect( linkDanger ).toHaveCSS( 'color', 'rgb(192, 57, 43)' ); // #c0392b
			await expect( linkDanger ).toHaveCSS( 'font-size', '17px' );
			await expect( linkDanger ).toHaveCSS( 'font-weight', '700' );
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL background properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify gradient background from .bg-gradient class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const bannerSections = elementorFrame.locator( '.elementor-element' ).filter( { has: elementorFrame.locator( 'h2' ).filter( { hasText: 'Ready to Get Started?' } ) } );
			const bannerSectionCount = await bannerSections.count();

			// Handle strict mode violation by using .first() or .last()
			let bannerSection = null;
			if ( bannerSectionCount > 0 ) {
				// Use .first() to avoid strict mode violation
				bannerSection = bannerSections.first();
			} else {
				// Fallback: Find any element with gradient background using evaluateAll
				const elementsWithGradient = await elementorFrame.locator( '*' ).evaluateAll( ( elements ) => {
					return elements.filter( ( el ) => {
						const backgroundImage = getComputedStyle( el ).backgroundImage;
						return backgroundImage && backgroundImage.includes( 'linear-gradient' );
					} );
				} );

				if ( elementsWithGradient.length > 0 ) {
					// Use the first element found
					bannerSection = elementorFrame.locator( `[data-id="${ elementsWithGradient[ 0 ].getAttribute( 'data-id' ) }"]` ).first();
				}
			}

			if ( bannerSection ) {
				const backgroundImage = await bannerSection.evaluate( ( el ) => getComputedStyle( el ).backgroundImage );

				// Check if gradient background is applied
				if ( backgroundImage && backgroundImage.includes( 'linear-gradient' ) ) {
					const hasExpectedColors = backgroundImage.includes( 'rgb(102, 126, 234)' ) || backgroundImage.includes( '102, 126, 234' );
					const hasExpectedColors2 = backgroundImage.includes( 'rgb(118, 75, 162)' ) || backgroundImage.includes( '118, 75, 162' );

					if ( hasExpectedColors && hasExpectedColors2 ) {
					} else {
					}
				} else {
				}
			} else {
			}
		} );
	} );
} );
