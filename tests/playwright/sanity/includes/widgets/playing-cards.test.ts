import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import Content from '../../../pages/elementor-panel-tabs/content';

test.describe( 'Playing cards tests', () => {
	const cardsData = [
		{
			value: '4',
			suit: 'club',
		},
		{
			value: '13',
			suit: 'heart',
		},
		{
			value: '1',
			suit: 'diamond',
		},
		{
			value: '8',
			suit: 'spade',
		},
	];

	test( 'Add playing cards to editor', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			playingCardId = await editor.addWidget( 'playing-cards', container );
		const elPlayingCards = await editor.getPreviewFrame().locator( `.elementor-element-${ playingCardId }` );
		new Content( page, testInfo );

		// Arrange
		for ( let i = 0; i < cardsData.length - 2; i++ ) {
			await page.locator( '.elementor-repeater-add' ).click();
		}

		const first = await page.locator( '.elementor-repeater-fields' ).nth( 0 );
		const second = await page.locator( '.elementor-repeater-fields' ).nth( 1 );
		const third = await page.locator( '.elementor-repeater-fields' ).nth( 2 );
		const fourth = await page.locator( '.elementor-repeater-fields' ).nth( 3 );
		const cardsControls = [ first, second, third, fourth ];

		// Act
		for ( let i = 0; i < cardsData.length; i++ ) {
			const cardData = cardsData[ i ];
			const cardControl = cardsControls[ i ];
			await cardControl.click();
			await cardControl.locator( 'select' ).first().selectOption( cardData.value );
			await cardControl.locator( 'select' ).nth( 1 ).selectOption( cardData.suit );
		}

		// Assert
		await page.waitForTimeout( 2500 );
		expect( await elPlayingCards.screenshot( {
			type: 'png',
		} ) ).toMatchSnapshot( 'playing-cards-data.png' );
	} );

	test( 'Playing cards styling', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			playingCardId = await editor.addWidget( 'playing-cards', container );

		editor.getPreviewFrame().locator( `.elementor-element-${ playingCardId }` );
		new Content( page, testInfo );

		// Arrange
		for ( let i = 0; i < cardsData.length - 2; i++ ) {
			await page.locator( '.elementor-repeater-add' ).click();
		}

		const first = await page.locator( '.elementor-repeater-fields' ).nth( 0 );
		const second = await page.locator( '.elementor-repeater-fields' ).nth( 1 );
		const third = await page.locator( '.elementor-repeater-fields' ).nth( 2 );
		const fourth = await page.locator( '.elementor-repeater-fields' ).nth( 3 );
		const cardsControls = [ first, second, third, fourth ];

		// Act
		for ( let i = 0; i < cardsData.length; i++ ) {
			const cardData = cardsData[ i ];
			const cardControl = cardsControls[ i ];
			await cardControl.click();
			await cardControl.locator( 'select' ).first().selectOption( cardData.value );
			await cardControl.locator( 'select' ).nth( 1 ).selectOption( cardData.suit );
		}

		await page.waitForTimeout( 2500 );
		await editor.activatePanelTab( 'style' );
		await page.locator( '.elementor-control-suit_section' ).click();
		await page.locator( '.pcr-button' ).first().click();
		await page.locator( '.pcr-result' ).first().fill( 'rgb(0, 92, 255)' );
		await page.locator( '.pcr-button' ).first().click();
		await page.locator( '.pcr-button' ).nth( 1 ).click();
		await page.locator( '.pcr-result' ).nth( 3 ).fill( 'rgb(0, 92, 255)' );
		await page.locator( '.pcr-button' ).nth( 1 ).click();
		await editor.publishAndViewPage();

		// Assert
		const thirdCard = await page.getByRole( 'article' ).filter( { hasText: 'A A ♦ ♦ ♦' } ).locator( '.e-card-content' ).first();
		const secondCard = await page.getByRole( 'article' ).filter( { hasText: 'K K ♥ ♥' } ).locator( '.e-card-content' ).first();
		expect.soft( secondCard ).toHaveCSS( 'color', 'rgb(0, 92, 255)' );
		expect.soft( thirdCard ).toHaveCSS( 'color', 'rgb(0, 92, 255)' );
		await page.waitForTimeout( 1000 );
	} );
} );
