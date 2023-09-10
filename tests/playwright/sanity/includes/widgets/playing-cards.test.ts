import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import PlayingCardContent from '../../../pages/widgets/playing-cards-page';
test.describe( 'Playing Cards', () => {
	test( 'it should display 1 playing card on adding the widget on default', async ( { page }, testInfo ) => {
		const wpAdmin: WpAdminPage = new WpAdminPage( page, testInfo );
		const editor: EditorPage = new EditorPage( page, testInfo );
		// Creating new playing card
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'playing-cards' );
		await editor.publishAndViewPage();
		// Waiting for page to load
		await page.waitForLoadState( 'load' );
		// Tests
		const playingCardsWrapperElement = page.locator( '.e-playing-cards-wrapper' );
		const playingCardsElements = page.locator( '.e-playing-card' );
		await expect( playingCardsWrapperElement ).toBeVisible();
		await expect( playingCardsElements ).toHaveCount( 1 );
	} );

	test( 'it should be able to add another playing card with the right values', async ( { page }, testInfo ) => {
		const wpAdmin: WpAdminPage = new WpAdminPage( page, testInfo );
		const editor: EditorPage = new EditorPage( page, testInfo );
		const playingCardContent: PlayingCardContent = new PlayingCardContent( page, testInfo );
		// Creating new playing card
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'playing-cards' );
		await playingCardContent.addNewCard( 'J', '♦' );
		await editor.publishAndViewPage();
		// Waiting for page to load
		await page.waitForLoadState( 'load' );
		// Tests
		const playingCardsWrapperElement = page.locator( '.e-widget-playing-cards' );
		const playingCardsElements = page.locator( '.e-playing-card' );
		const firstPlayingCard = page.locator( '.e-widget-playing-cards' ).getByText( 'A♠' );
		const secondPlayingCard = page.locator( '.e-widget-playing-cards' ).getByText( 'J♦' );

		await expect( playingCardsWrapperElement ).toBeVisible();
		await expect( playingCardsElements ).toHaveCount( 2 );
		await expect( firstPlayingCard ).toBeVisible();
		await expect( secondPlayingCard ).toBeVisible();
		await expect( firstPlayingCard ).toHaveClass( 'e-playing-card-value e-playing-card-black' );
		await expect( secondPlayingCard ).toHaveClass( 'e-playing-card-value e-playing-card-red' );
	} );
} );
