import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Playing Cards @playing-cards', () => {
	let wpAdmin;
	let editor;

	test.beforeEach( async ( { page }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo );
		editor = await wpAdmin.openNewPage();
		await editor.addWidget( 'playing-cards' );
	} );

	test( 'Add widget', async () => {
		const widget = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.container );
		await expect( widget ).toBeVisible();
	} );

	test( 'Add a card', async ( { page } ) => {
		await page.click( EditorSelectors.playingCards.repeaterAdd );
		const cards = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.card );
		await expect( cards ).toHaveCount( 1 );
	} );

	test( 'Add more cards', async ( { page } ) => {
		// Arrange | Add several cards
		for ( let i = 0; i < 4; i++ ) {
			// Act
			await page.click( EditorSelectors.playingCards.repeaterAdd );
		}

		// Assert
		const cards = editor.getPreviewFrame().locator( EditorSelectors.playingCards.card );
		await expect( cards ).toHaveCount( 4 ); // Initial card + 3 more
	} );

	getTestCardPropertiesData().forEach( async ( item ) => {
		test( `Update card properties ${ item.suit }`, async ( { page } ) => {
			// Arrange
			await page.click( EditorSelectors.playingCards.repeaterAdd );

			// Act
			await setCardProps( editor, item.suit, item.number );

			// Assert
			const cardHeader = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.cardHeader );
			const cardBody = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.cardBody );

			await expect( cardHeader.first() ).toHaveText( item.number );
			await expect( cardBody.first() ).toHaveText( item.suit );
		} );
	} );

	test( 'Play event functionality', async ( { page } ) => {
		// Arrange
		await page.click( EditorSelectors.playingCards.repeaterAdd );
		const cardsContainer = editor.getPreviewFrame().locator( EditorSelectors.playingCards.cardControl );

		// Act
		await cardsContainer.click( EditorSelectors.playingCards.cardPlay );

		// Assert
		const cardsShuffle = cardsContainer.locator( EditorSelectors.playingCards.cardShuffle );
		await expect( cardsShuffle ).toBeVisible();
	} );

	test( 'Shuffle event functionality', async ( { page } ) => {
		// Arrange | Add several cards
		for ( let i = 0; i < 3; i++ ) {
			await page.click( EditorSelectors.playingCards.repeaterAdd );
		}

		const cardsContainer = editor.getPreviewFrame().locator( EditorSelectors.playingCards.cardControl );

		// Act
		await cardsContainer.click( EditorSelectors.playingCards.cardPlay );
		await cardsContainer.click( EditorSelectors.playingCards.cardShuffle );

		// Assert
		// initially we have 3 cards after shuffle it must be 6
		const cards = editor.getPreviewFrame().locator( EditorSelectors.playingCards.card );
		await expect( cards ).toHaveCount( 6 );
	} );
} );

function getTestCardPropertiesData() {
	return [
		{ suit: '♠', number: 'A' },
		{ suit: '♦', number: '4' },
		{ suit: '♥', number: 'K' },
		{ suit: '♣', number: '10' },
	];
}

async function setCardProps( editor, type, value ) {
	await editor.setSelectControlValue( 'card_suit', type );
	await editor.setSelectControlValue( 'card_number', value );
}

