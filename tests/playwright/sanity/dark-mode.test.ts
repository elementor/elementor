import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';

test( 'navigator empty placeholder should be in dark mode', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.setExperiments( {
		container: true,
	} );

	const editor = await wpAdmin.openNewPage();

	// Act.
	await editor.addElement( { elType: 'container' }, 'document' );
	await editor.setDisplayMode( 'dark' );
	const navigator = editor.page.locator( '#elementor-navigator' );
	await navigator.locator( '.elementor-navigator__element__list-toggle' ).click();

	// Assert
	expect( await navigator.screenshot( {
		type: 'jpeg',
		quality: 70,
	} ) ).toMatchSnapshot( 'navigator-empty-dark-mode.jpg' );
} );
