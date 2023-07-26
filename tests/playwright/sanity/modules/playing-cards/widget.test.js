import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import { blackColour, cardTypes, purpleColour, redColour, setCardProps, whiteColour } from './helper';

test.describe( 'Playing Cards @playing-cards', () => {
	test( 'Playing Cards widget functionality', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add widget', async () => {
			await editor.addWidget( 'playing-cards' );

			const widget = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.container );

			expect( await widget.first() ).toBeVisible();
		} );

		await test.step( 'Add a card', async () => {
			const addItemButton = await page.locator( '.elementor-repeater-add' );

			await addItemButton.click();

			await expect( await editor.getPreviewFrame().locator( `${ EditorSelectors.playingCards.container } ${ EditorSelectors.playingCards.card }` ) ).toHaveCount( 1 );
		} );

		const card = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.card );
		const cardHeader = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.cardHeader );
		const cardBody = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.cardBody );

		await test.step( 'Update card properties (Diamonds 3)', async () => {
			await setCardProps( editor, 'diamond', '3' );

			await expect( card ).toHaveCSS( 'color', redColour );
			await expect( cardHeader ).toHaveText( '3' );
			await expect( cardBody ).toHaveText( cardTypes.diamond );
		} );

		await test.step( 'Update card properties (Hearts 4)', async () => {
			await setCardProps( editor, 'heart', '4' );

			await expect( card ).toHaveCSS( 'color', redColour );
			await expect( cardHeader ).toHaveText( '4' );
			await expect( cardBody ).toHaveText( cardTypes.heart );
		} );

		await test.step( 'Update card properties (Clubs K)', async () => {
			await setCardProps( editor, 'club', 'K' );

			await expect( card ).toHaveCSS( 'color', blackColour );
			await expect( cardHeader ).toHaveText( 'K' );
			await expect( cardBody ).toHaveText( cardTypes.club );
		} );

		await test.step( 'Update card properties (Spades A)', async () => {
			await setCardProps( editor, 'spade', 'A' );

			await expect( card ).toHaveCSS( 'color', blackColour );
			await expect( cardHeader ).toHaveText( 'A' );
			await expect( cardBody ).toHaveText( cardTypes.spade );
		} );

		await test.step( 'Add more cards', async () => {
			const addItemButton = await page.locator( '.elementor-repeater-add' );

			await addItemButton.click();
			await addItemButton.click();

			const cards = await editor.getPreviewFrame().locator( `${ EditorSelectors.playingCards.container } ${ EditorSelectors.playingCards.card }` )

			await expect( cards ).toHaveCount( 3 );
		} );
	} );

	test( 'Playing Cards widget styling', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();
		let card = null;

		await test.step( 'Add the widget and a card', async () => {
			await editor.addWidget( 'playing-cards' );
			const addItemButton = await page.locator( '.elementor-repeater-add' );

			await addItemButton.click();

			card = await editor.getPreviewFrame().locator( EditorSelectors.playingCards.card );

			await expect( card ).toBeVisible();
		} );

		await test.step( 'Select the styling tab', async () => {
			await editor.activatePanelTab( 'style' );
		} );

		await test.step( 'Update background colour', async () => {
			await editor.setColorControlValue( blackColour, 'card_background' );

			await expect( card ).toHaveCSS( 'background-color', blackColour );
		} );

		await test.step( 'Update background colour', async () => {
			await editor.setColorControlValue( redColour, 'card_border_color' );

			await expect( card ).toHaveCSS( 'border', `1px solid ${ redColour }` );
		} );

		await test.step( 'Update spades and clubs colour', async () => {
			await editor.setColorControlValue( purpleColour, 'card_spade_club_color' );

			await expect( card ).toHaveCSS( 'color', purpleColour );
		} );

		await test.step( 'Change card type to hearts', async () => {
			await editor.activatePanelTab( 'content' );
			await page.locator( EditorSelectors.item ).first().click();

			await setCardProps( editor, 'heart', '2' );

			await editor.activatePanelTab( 'style' );
		} );

		await test.step( 'Update hearts and diamonds colour', async () => {
			await editor.setColorControlValue( whiteColour, 'card_heart_diamond_color' );

			await expect( card ).toHaveCSS( 'color', whiteColour );
		} );
	} );
} );
