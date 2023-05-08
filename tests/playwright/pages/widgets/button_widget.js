import EditorPage from '../editor-page';
import EditorSelectors from '../../selectors/editor-selectors';
import { expect } from '@playwright/test';

export default class ButtonWidget {
	constructor( page, testInfo ) {
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

	async setButtonLink( link, options = { targetBlank: false, noFollow: false, customAttributes: undefined } ) {
		const urlInput = this.page.locator( EditorSelectors.button.url );
		await urlInput.clear();
		await urlInput.type( link );
		await this.page.locator( EditorSelectors.button.linkOptions ).click();
		if ( options.targetBlank ) {
			await this.page.locator( EditorSelectors.button.targetBlankChbox ).check();
		}
		if ( options.targetBlank ) {
			await this.page.locator( EditorSelectors.button.noFollowChbox ).check();
		}
		if ( options.customAttributes ) {
			await this.page.locator( EditorSelectors.button.customAttributesInp ).type( `${ options.customAttributes.key }|${ options.customAttributes.value }` );
		}
		await this.editorPage.getPreviewFrame().getByRole( 'heading', { name: 'Hello world!' } ).nth( 0 ).click();
	}
}
