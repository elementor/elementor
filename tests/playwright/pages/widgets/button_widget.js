import EditorPage from '../editor-page';
import EditorSelectors from '../../selectors/editor-selectors';
import { expect } from '@playwright/test';

export default class ButtonWidget {
	constructor( page, testInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async addWidget( defaultBtnName ) {
		await this.editorPage.addWidget( 'button' );
		await this.editorPage.getPreviewFrame().waitForSelector( EditorSelectors.getButtonByName( defaultBtnName ) );
	}

	async setButtonId( buttonId, buttonName ) {
		await this.page.locator( EditorSelectors.buttonIdInp ).type( buttonId );
		await expect( this.editorPage.getPreviewFrame().locator( EditorSelectors.getButtonByName( buttonName ) ) ).toHaveAttribute( 'id', buttonId );
	}

	async getButtonId( defaultBtnName, isPublished = true ) {
		if ( isPublished ) {
			return await this.page.locator( EditorSelectors.getButtonByName( defaultBtnName ) ).getAttribute( 'id' );
		}
		return await this.editorPage.getPreviewFrame().locator( EditorSelectors.getButtonByName( defaultBtnName ) ).getAttribute( 'id' );
	}
}
