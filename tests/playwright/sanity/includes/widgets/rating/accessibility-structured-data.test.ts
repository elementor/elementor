import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Accessibility & Structured data @rating', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Accessibility & Structured data', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await test.step( 'Add rating widget', async () => {
			await editor.addWidget( 'rating', container );
			await editor.setSliderControlValue( 'rating_scale', '7' );
			await editor.setNumberControlValue( 'rating_value', '3.543' );
			await editor.publishAndViewPage();
		} );

		await test.step( '@axe-core/playwright', async () => {
			await editor.axeCoreAccessibilityTest( page, '.elementor-widget-rating' );
		} );

		await test.step( 'Check aria & schema.org properties', async () => {
			const ratingWrapper = page.locator( '.e-rating-wrapper' ),
				ratingWidget = page.locator( '.e-rating' ),
				worstRating = page.locator( '[itemprop="worstRating"]' ),
				bestRating = page.locator( '[itemprop="bestRating"]' );

			expect.soft( await ratingWrapper.getAttribute( 'aria-label' ) ).toEqual( 'Rated 3.54 out of 7' );
			expect.soft( await ratingWrapper.getAttribute( 'content' ) ).toEqual( '3.54' );
			expect.soft( await ratingWrapper.getAttribute( 'role' ) ).toEqual( 'img' );
			expect.soft( await ratingWrapper.getAttribute( 'itemprop' ) ).toEqual( 'ratingValue' );

			expect.soft( await ratingWidget.getAttribute( 'itemtype' ) ).toEqual( 'https://schema.org/Rating' );
			expect.soft( await ratingWidget.getAttribute( 'itemprop' ) ).toEqual( 'reviewRating' );
			expect.soft( await ratingWidget.getAttribute( 'itemscope' ) ).toEqual( '' );

			expect.soft( await worstRating.getAttribute( 'content' ) ).toEqual( '0' );
			expect.soft( await bestRating.getAttribute( 'content' ) ).toEqual( '7' );
		} );
	} );
} );
