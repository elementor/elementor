import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import AxeBuilder from '@axe-core/playwright';

test.describe( 'Rating widget @rating', () => {
	test.describe( 'Rating experiment inactive', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = await new WpAdminPage( page, testInfo );

			await wpAdmin.setExperiments( {
				rating: 'inactive',
				container: 'active',
			} );

			await page.close();
		} );

		test.afterAll( async ( { browser }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				rating: 'inactive',
				container: 'inactive',
			} );

			await page.close();
		} );

		test( 'Rating widget should not appear in widgets panel', async ( { page }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				frame = editor.getPreviewFrame(),
				starRatingWrapper = await frame.locator( '.elementor-star-rating' ).first();

			await test.step( 'Check that Toggle and Accordion widgets appear when nested accordion experiment is off', async () => {
				// Act
				await editor.addWidget( 'star-rating', container );

				// Assert
				await expect.soft( await starRatingWrapper ).toHaveCount( 1 );
			} );
		} );
	} );

	test.describe( 'Rating experiment is active', () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = await new WpAdminPage( page, testInfo );

			await wpAdmin.setExperiments( {
				container: 'active',
				rating: 'active',
			} );

			await page.close();
		} );

		test.afterAll( async ( { browser }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				rating: 'inactive',
				container: 'inactive',
			} );

			await page.close();
		} );

		test( 'Widget panel test', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				starRatingWidgetInPanel = await page.locator( 'i.eicon-rating' ).first(),
				widgetPanelButton = await page.locator( '#elementor-panel-header-add-button .eicon-apps' ),
				widgetSearchBar = '#elementor-panel-elements-search-wrapper input#elementor-panel-elements-search-input';

			let ratingID,
				rating;

			await test.step( 'Check that Star Rating widget does not appear when rating experiment is on', async () => {
				// Act
				await editor.closeNavigatorIfOpen();
				widgetPanelButton.click();

				await page.waitForSelector( widgetSearchBar );
				await page.locator( widgetSearchBar ).fill( 'star-rating' );

				// Assert
				await expect.soft( starRatingWidgetInPanel ).toBeHidden();
			} );

			await test.step( 'Check that Rating widget is active', async () => {
				// Act
				ratingID = await editor.addWidget( 'rating', container );
				rating = await editor.selectElement( ratingID );

				// Assert
				await expect.soft( await rating ).toHaveCount( 1 );
			} );
		} );

		test.only( 'Functionality test', async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				ratingID = await editor.addWidget( 'rating', container ),
				ratingElement = await editor.selectElement( ratingID );

			await test.step( 'Rating Scale', async () => {
				await editor.setSliderControlValue( 'rating_scale', '3' );
				await expect.soft( await ratingElement.locator( '.e-icon' ) ).toHaveCount( 3 );
			} );

			await test.step( 'Rating Value', async () => {
				await editor.setNumberControlValue( 'rating_value', '1.543' );
				await expect.soft( await ratingElement.locator( '.e-icon >> nth=0' ).locator( '.e-icon-marked' ) ).toHaveCSS( '--e-rating-icon-marked-width', '100%' );
				await expect.soft( await ratingElement.locator( '.e-icon >> nth=1' ).locator( '.e-icon-marked' ) ).toHaveCSS( '--e-rating-icon-marked-width', '54%' );
				await expect.soft( await ratingElement.locator( '.e-icon >> nth=2' ).locator( '.e-icon-marked' ) ).toHaveCSS( '--e-rating-icon-marked-width', '0%' );
			} );

			await test.step( 'Icon Alignment Start', async () => {
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( 'rating-alignment-start.png' );

				await editor.togglePreviewMode();
			} );

			await test.step( 'Icon Alignment Center', async () => {
				await editor.setChooseControlValue( 'icon_alignment', 'eicon-align-center-h' );
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( 'rating-alignment-center.png' );

				await editor.togglePreviewMode();
			} );

			await test.step( 'Icon Alignment End', async () => {
				await editor.setChooseControlValue( 'icon_alignment', 'eicon-align-end-h' );
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( 'rating-alignment-end.png' );

				await editor.togglePreviewMode();
			} );
		} );

		test( 'Accessibility & Structured data', async ( { page }, testInfo ) => {
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
} );
