import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Rating accessibility & structured data @rating', () => {
	test( 'Accessibility & Structured data', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await test.step( 'Add rating widget', async () => {
			await editor.addWidget( { widgetType: 'rating', container } );
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

			await expect.soft( ratingWrapper ).toHaveAttribute( 'aria-label', 'Rated 3.54 out of 7' );
			await expect.soft( ratingWrapper ).toHaveAttribute( 'content', '3.54' );
			await expect.soft( ratingWrapper ).toHaveAttribute( 'role', 'img' );
			await expect.soft( ratingWrapper ).toHaveAttribute( 'itemprop', 'ratingValue' );

			await expect.soft( ratingWidget ).toHaveAttribute( 'itemtype', 'https://schema.org/Rating' );
			await expect.soft( ratingWidget ).toHaveAttribute( 'itemprop', 'reviewRating' );
			await expect.soft( ratingWidget ).toHaveAttribute( 'itemscope', '' );

			await expect.soft( worstRating ).toHaveAttribute( 'content', '0' );
			await expect.soft( bestRating ).toHaveAttribute( 'content', '7' );
		} );
	} );
} );
