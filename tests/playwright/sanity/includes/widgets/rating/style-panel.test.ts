import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { afterAll, beforeAll } from './helper';
import _path from 'path';

const iconExperimentStates = [ 'inactive', 'active' ];

iconExperimentStates.forEach( ( iconExperimentState ) => {
	test.describe( `Rating style panel - Icon Experiment: ${ iconExperimentState } @rating`, () => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			await beforeAll( browser, testInfo, iconExperimentState );
		} );

		test.afterAll( async ( { browser }, testInfo ) => {
			await afterAll( browser, testInfo );
		} );

		test( `Styling test - Icon Experiment: ${ iconExperimentState }`, async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				ratingId = await editor.addWidget( 'rating', container ),
				ratingElement = editor.getPreviewFrame().locator( `.elementor-element-${ ratingId } .e-rating` );

			await test.step( 'Set widget', async () => {
				await editor.setSliderControlValue( 'rating_scale', '5' );
				await editor.setNumberControlValue( 'rating_value', '3.5' );
			} );

			await test.step( 'Set styling controls', async () => {
				await editor.openPanelTab( 'style' );
				await editor.setSliderControlValue( 'icon_size', '50' );
				await editor.setSliderControlValue( 'icon_gap', '30' );
				await editor.setColorControlValue( 'icon_color', '#FA0000' );
				await editor.setColorControlValue( 'icon_unmarked_color', '#2200FF' );
			} );

			await test.step( 'Assert styling', async () => {
				await expect.soft( ratingElement.locator( '.e-icon >> nth=0' ) ).toHaveCSS( 'margin-inline-end', '30px' );

				if ( 'active' === iconExperimentState ) {
					await expect.soft( ratingElement.locator( '.e-icon >> nth=0' ).locator( 'svg >> nth=1' ) ).toHaveCSS( 'width', '50px' );
					await expect.soft( ratingElement.locator( '.e-icon-marked >> nth=0' ).locator( 'svg' ) ).toHaveCSS( 'fill', 'rgb(250, 0, 0)' );
					await expect.soft( ratingElement.locator( '.e-icon-unmarked >> nth=0' ).locator( 'svg' ) ).toHaveCSS( 'fill', 'rgb(34, 0, 255)' );
				} else {
					await expect.soft( ratingElement.locator( '.e-icon >> nth=0' ).locator( 'i >> nth=1' ) ).toHaveCSS( 'font-size', '50px' );
					await expect.soft( ratingElement.locator( '.e-icon-marked >> nth=0' ).locator( 'i' ) ).toHaveCSS( 'color', 'rgb(250, 0, 0)' );
					await expect.soft( ratingElement.locator( '.e-icon-unmarked >> nth=0' ).locator( 'i' ) ).toHaveCSS( 'color', 'rgb(34, 0, 255)' );
				}
			} );

			await test.step( 'Assert styling with screenshot', async () => {
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-styling-icon-experiment-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
			} );

			await test.step( 'Assert styling with negative spacing value', async () => {
				await editor.setSliderControlValue( 'icon_gap', '-5' );

				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-styling-icon-with-negative-spacing-experiment-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
				await editor.setSliderControlValue( 'icon_gap', '' );
			} );

			await test.step( 'Assert styling of asymmetric Font Awesome icon has same size with font experiment on and off', async () => {
				await editor.openPanelTab( 'content' );
				await page.locator( '.elementor-control-icons--inline__icon >> nth=0' ).click();
				await page.locator( `.elementor-icons-manager__tab__item__content .fa-address-card` ).first().click();

				if ( 'active' === iconExperimentState ) {
					await expect.soft( ratingElement.locator( '.e-icon >> nth=0' ).locator( 'svg >> nth=1' ) ).toHaveCSS( 'height', '50px' );
				} else {
					await expect.soft( ratingElement.locator( '.e-icon >> nth=0' ).locator( 'i >> nth=1' ) ).toHaveCSS( 'font-size', '50px' );
					await expect.soft( ratingElement.locator( '.e-icon >> nth=0' ).locator( 'i >> nth=1' ) ).toHaveCSS( 'height', '50px' );
				}
			} );
		} );

		test( `Rating flex-wrap styling: ${ iconExperimentState }`, async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage();

			await test.step( 'Load Template', async () => {
				const filePath = _path.resolve( __dirname, `../../../../templates/rating-flex-wrap.json` );
				await editor.loadTemplate( filePath, false );
				await editor.getPreviewFrame().waitForSelector( '.e-rating' );
				await editor.closeNavigatorIfOpen();
			} );

			await test.step( 'Assert flex-wrap screenshot inside the editor', async () => {
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-flex-wrap-editor-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
			} );

			await test.step( 'Assert flex-wrap with center alignment screenshot inside the editor', async () => {
				await editor.getPreviewFrame().locator( '.e-rating' ).click();
				await page.locator( '.elementor-control-icon_alignment .eicon-align-end-h' ).click();

				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-flex-wrap-alignment-center-editor-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();

				await editor.getPreviewFrame().locator( '.e-rating' ).click();
				await page.locator( '.elementor-control-icon_alignment .eicon-align-start-h' ).click();
			} );

			await test.step( 'Assert flex-wrap screenshot on the front end', async () => {
				await editor.publishAndViewPage();
				await page.waitForSelector( '.e-rating' );

				expect.soft( await page.locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-flex-wrap-frontend-${ iconExperimentState }.png` );
			} );
		} );
	} );
} );
