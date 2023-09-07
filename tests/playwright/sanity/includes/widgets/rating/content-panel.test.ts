import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { afterAll, beforeAll } from './helper';

test.describe( 'Rating content panel @rating', () => {
	const iconExperimentStates = [ 'inactive', 'active' ];

	iconExperimentStates.forEach( ( iconExperimentState ) => {
		test.beforeAll( async ( { browser }, testInfo ) => {
			await beforeAll( browser, testInfo, iconExperimentState );
		} );

		test.afterAll( async ( { browser }, testInfo ) => {
			await afterAll( browser, testInfo );
		} );

		test( `Functionality test - Icon Experiment: ${ iconExperimentState }`, async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo ),
				editor = await wpAdmin.openNewPage(),
				container = await editor.addElement( { elType: 'container' }, 'document' ),
				ratingId = await editor.addWidget( 'rating', container ),
				ratingElement = await editor.getPreviewFrame().locator( `.elementor-element-${ ratingId } .e-rating` );

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
				} ) ).toMatchSnapshot( `rating-alignment-start-icon-experiment-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
			} );

			await test.step( 'Icon Alignment Center', async () => {
				await editor.setChooseControlValue( 'icon_alignment', 'eicon-align-center-h' );
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-alignment-center-icon-experiment-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
			} );

			await test.step( 'Icon Alignment End', async () => {
				await editor.setChooseControlValue( 'icon_alignment', 'eicon-align-end-h' );
				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame().locator( '.e-rating' ).screenshot( {
					type: 'png',
				} ) ).toMatchSnapshot( `rating-alignment-end-icon-experiment-${ iconExperimentState }.png` );

				await editor.togglePreviewMode();
			} );
		} );
	} );
} );
