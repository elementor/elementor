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

	async chooseImage( imageTitle ) {
		await this.page.locator( EditorSelectors.media.preview ).click();
		await this.page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await this.page.locator( EditorSelectors.media.imageByTitle( imageTitle ) ).click();
		await this.page.locator( EditorSelectors.media.selectBtn ).click();
	}

	async selectImageSize( widgetLocator, imageSize ) {
		await this.editorPage.getPreviewFrame().locator( widgetLocator ).click();
		await this.page.locator( EditorSelectors.image.imageSizeSelect ).selectOption( imageSize );
		await this.editorPage.getPreviewFrame().locator( EditorSelectors.pageTitle ).click();
	}

	async verifyImageSrc( args = { selector, imageTitle, isPublished } ) {
		const image = args.isPublished
			? await this.page.locator( args.selector )
			: await this.editorPage.getPreviewFrame().waitForSelector( args.selector );
		const src = await image.getAttribute( 'src' );
		const regex = new RegExp( args.imageTitle );
		expect( regex.test( src ) ).toEqual( true );
	}

	async setCustomImageSize( args = { selector, imageTitle, width, height } ) {
		await this.editorPage.getPreviewFrame().locator( args.selector ).click();
		await this.page.locator( EditorSelectors.image.imageSizeSelect ).selectOption( 'custom' );
		await this.page.locator( EditorSelectors.image.widthInp ).type( args.width );
		await this.page.locator( EditorSelectors.image.heightInp ).type( args.height );
		const regex = new RegExp( `http://(.*)/wp-content/uploads/elementor/thumbs/${ args.imageTitle }(.*)` );
		const response = this.page.waitForResponse( regex );
		await this.page.getByRole( 'button', { name: 'Apply' } ).click();
		await response;
	}
}
