import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { afterAll, beforeAll } from './helper';

test.describe( 'Rating style panel @rating', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		await beforeAll( browser, testInfo );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		await afterAll( browser, testInfo );
	} );

	test( 'Styling test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			ratingID = await editor.addWidget( 'rating', container ),
			ratingElement = await editor.selectElement( ratingID );

		await test.step( 'Set widget', async () => {
			await editor.setSliderControlValue( 'rating_scale', '5' );
            await editor.setNumberControlValue( 'rating_value', '3.5' );
		} );
	} );
} );
