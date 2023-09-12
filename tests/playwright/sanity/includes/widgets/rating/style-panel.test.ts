import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { afterAll, beforeAll } from './helper';

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
				ratingElement = await editor.getPreviewFrame().locator( `.elementor-element-${ ratingId } .e-rating` );

			await test.step( 'Set widget', async () => {
				await editor.setSliderControlValue( 'rating_scale', '5' );
				await editor.setNumberControlValue( 'rating_value', '3.5' );
			} );

			await test.step( 'Set styling controls', async () => {
				await editor.activatePanelTab( 'style' );
				await editor.setSliderControlValue( 'icon_size', '50' );
				await editor.setSliderControlValue( 'icon_gap', '30' );
				await editor.setColorControlValue( '#FA0000', 'icon_color' );
				await editor.setColorControlValue( '#2200FF', 'icon_unmarked_color' );
			} );

			await test.step( 'Assert styling', async () => {
				await expect.soft( await ratingElement.locator( '.e-rating-wrapper' ) ).toHaveCSS( 'gap', '30px' );

				if ( 'active' === iconExperimentState ) {
					await expect.soft( await ratingElement.locator( '.e-icon >> nth=0' ).locator( 'svg >> nth=1' ) ).toHaveCSS( 'width', '50px' );
					await expect.soft( await ratingElement.locator( '.e-icon-marked >> nth=0' ).locator( 'svg' ) ).toHaveCSS( 'fill', 'rgb(250, 0, 0)' );
					await expect.soft( await ratingElement.locator( '.e-icon-unmarked >> nth=0' ).locator( 'svg' ) ).toHaveCSS( 'fill', 'rgb(34, 0, 255)' );
				} else {
					await expect.soft( await ratingElement.locator( '.e-icon >> nth=0' ).locator( 'i >> nth=1' ) ).toHaveCSS( 'font-size', '50px' );
					await expect.soft( await ratingElement.locator( '.e-icon-marked >> nth=0' ).locator( 'i' ) ).toHaveCSS( 'color', 'rgb(250, 0, 0)' );
					await expect.soft( await ratingElement.locator( '.e-icon-unmarked >> nth=0' ).locator( 'i' ) ).toHaveCSS( 'color', 'rgb(34, 0, 255)' );
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

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating-wrapper' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-styling-icon-with-negative-spacing-experiment-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
			} );
		} );
	} );
} );
