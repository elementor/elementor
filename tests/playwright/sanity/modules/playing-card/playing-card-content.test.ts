import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
test.describe( 'Playing Card Content Tests @playing-card', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: 'inactive',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: 'active',
		} );

		await page.close();
	} );

	test( 'Playing Card widget addition', async ( { page }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await test.step( 'Check that the widget can be added', async () => {
			// Act
			await editor.addWidget( 'playing-card', container );

			// Assert
			const frame = editor.getPreviewFrame();
			const playingCardWrapper = frame.locator( '.e-playing-cards-wrapper' );
			await expect.soft( playingCardWrapper ).toHaveCount( 1 );
		} );

		await test.step( 'Check that multiple cards can be added', async () => {
			// Act
			const frame = editor.getPreviewFrame();
			const addCardButton = page.locator( '.elementor-repeater-add' ).first();
			await addCardButton.click();

			// Assert
			const playingCards = frame.locator( '.e-playing-cards-wrapper-item' );
			await expect.soft( playingCards ).toHaveCount( 2 );
		} );
	} );

	test( 'Playing Card suit and number', async ( { page }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		await test.step( 'Check that the playing card matches screenshot', async () => {
			// Act
			await editor.addWidget( 'playing-card', container );
			await page.locator( '.elementor-repeater-row-item-title' ).click();
			await page.locator( '[data-setting="card_number"]' ).selectOption( { label: '9' } );
			await page.locator( '[data-setting="card_suit"]' ).selectOption( { label: 'Club' } );
			const frame = editor.getPreviewFrame();
			const playingCardWrapper = frame.locator( '.e-playing-cards-wrapper' ).first();

			// Assert
			await expect.soft( playingCardWrapper ).toHaveCount( 1 );
			expect( await page.screenshot() ).toMatchSnapshot( 'playing-card-suit-and-number.png' );
		} );
	} );
} );
