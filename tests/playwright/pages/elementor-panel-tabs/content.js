import EditorSelectors from '../../selectors/editor-selectors';
import { expect } from '@playwright/test';
const EditorPage = require( '../editor-page' );

export default class Content {
	constructor( page, testInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async setLink( link, options = { targetBlank: false, noFollow: false, customAttributes: undefined, linkTo: false } ) {
		if ( options.linkTo ) {
			await this.page.locator( EditorSelectors.image.linkSelect ).selectOption( 'Custom URL' );
		}

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
		await this.editorPage.getPreviewFrame().locator( EditorSelectors.siteTitle ).click();
	}

	async verifyLink( element, options = { target, href, rel, customAttributes } ) {
		await expect( element ).toHaveAttribute( 'target', options.target );
		await expect( element ).toHaveAttribute( 'href', options.href );
		await expect( element ).toHaveAttribute( 'rel', options.rel );
		await expect( element ).toHaveAttribute( options.customAttributes.key, options.customAttributes.value );
	}
}
