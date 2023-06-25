const EditorPage = require( '../editor-page' );
import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class ButtonWidget extends Content {
	constructor( page, testInfo ) {
		super( page, testInfo );
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async addWidget( buttonName ) {
		await this.editorPage.addWidget( 'button' );
		await this.editorPage.getPreviewFrame().waitForSelector( EditorSelectors.button.getByName( buttonName ) );
	}

	async setButtonId( buttonId, buttonName ) {
		await this.page.locator( EditorSelectors.button.id ).type( buttonId );
		await expect( this.editorPage.getPreviewFrame().locator( EditorSelectors.button.getByName( buttonName ) ) ).toHaveAttribute( 'id', buttonId );
	}

	async getButtonId( buttonName, isPublished = true ) {
		if ( isPublished ) {
			return await this.page.locator( EditorSelectors.button.getByName( buttonName ) ).getAttribute( 'id' );
		}
		return await this.editorPage.getPreviewFrame().locator( EditorSelectors.button.getByName( buttonName ) ).getAttribute( 'id' );
	}
}
