import { type Page, type TestInfo } from '@playwright/test';
import EditorPage from '../editor-page';

export default class PlayingCardsContent {
	readonly page: Page;
	readonly editorPage: EditorPage;
	constructor( page: Page, testInfo: TestInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}
	async addNewCard( cardNumber: string, cardType: string ) {
		await this.page.getByRole( 'button', { name: 'Add Item' } ).click();
		await this.page.locator( '.elementor-control-playing_card_number select' ).nth( 1 ).selectOption( cardNumber );
		await this.page.locator( '.elementor-control-playing_card_type select' ).nth( 1 ).selectOption( cardType );
	}
}

