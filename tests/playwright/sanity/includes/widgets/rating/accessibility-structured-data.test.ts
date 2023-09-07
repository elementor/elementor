import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import AxeBuilder from '@axe-core/playwright';
import {
	beforeAll,
	afterAll,
} from './helper';

test.describe( 'Accessibility & Structured data @rating', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		await beforeAll( browser, testInfo );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		await afterAll( browser, testInfo );
	} );

	test.only( 'Accessibility & Structured data', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await test.step( 'Add rating widget', async () => {
			await editor.addWidget( 'rating', container );
			await editor.setSliderControlValue( 'rating_scale', '7' );
			await editor.setNumberControlValue( 'rating_value', '3.543' );
			await editor.publishAndViewPage();
		} );

		await test.step( '@axe-core/playwright', async () => {
			const accessibilityScanResults = await new AxeBuilder( { page } )
				.include( '.elementor-widget-rating' )
				.analyze();

			await expect.soft( accessibilityScanResults.violations ).toEqual( [] );
		} );

		await test.step( 'Check aria & schema.org properties', async () => {
			const ratingWrapper = await page.locator( '.e-rating-wrapper' ),
				ratingWidget = await page.locator( '.e-rating' ),
				worstRating = await page.locator( '[itemprop="worstRating"]' ),
				bestRating = await page.locator( '[itemprop="bestRating"]' );

			await expect.soft( await ratingWrapper.getAttribute( 'aria-label' ) ).toEqual( 'Rated 3.54 out of 7' );
			await expect.soft( await ratingWrapper.getAttribute( 'content' ) ).toEqual( '3.54' );
			await expect.soft( await ratingWrapper.getAttribute( 'role' ) ).toEqual( 'img' );
			await expect.soft( await ratingWrapper.getAttribute( 'itemprop' ) ).toEqual( 'ratingValue' );

			await expect.soft( await ratingWidget.getAttribute( 'itemtype' ) ).toEqual( 'https://schema.org/Rating' );
			await expect.soft( await ratingWidget.getAttribute( 'itemprop' ) ).toEqual( 'reviewRating' );
			await expect.soft( await ratingWidget.getAttribute( 'itemscope' ) ).toEqual( '' );

			await expect.soft( await worstRating.getAttribute( 'content' ) ).toEqual( '0' );
			await expect.soft( await bestRating.getAttribute( 'content' ) ).toEqual( '7' );
		} );
	} );
} );
