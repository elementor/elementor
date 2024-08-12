import EditorSelectors from '../../selectors/editor-selectors';
import { expect, Locator, type Page, type TestInfo } from '@playwright/test';
import EditorPage from '../editor-page';
import path from 'path';
import { LinkOptions } from '../../types/types';

export default class Content {
	readonly page: Page;
	readonly editor: EditorPage;
	constructor( page: Page, testInfo: TestInfo ) {
		this.page = page;
		this.editor = new EditorPage( this.page, testInfo );
	}

	async selectLinkSource( option: string ) {
		await this.page.locator( EditorSelectors.image.linkSelect ).selectOption( option );
	}

	async setLink( link: string, options : LinkOptions = { targetBlank: false, noFollow: false, linkTo: false } ) {
		if ( options.linkTo ) {
			await this.selectLinkSource( 'Custom URL' );
		}

		const urlInput = this.page.locator( options.linkInpSelector ).first();
		await urlInput.clear();
		await urlInput.type( link );

		const wheel = this.page.locator( EditorSelectors.button.linkOptions ).first();
		if ( await wheel.isVisible() ) {
			await wheel.click();
		}

		if ( options.targetBlank ) {
			await this.page.locator( EditorSelectors.button.targetBlankChbox ).first().check();
		}

		if ( options.noFollow ) {
			await this.page.locator( EditorSelectors.button.noFollowChbox ).first().check();
		}
		if ( options.customAttributes ) {
			await this.page
				.locator( EditorSelectors.button.customAttributesInp )
				.first()
				.type( `${ options?.customAttributes.key }|${ options.customAttributes.value }` );
		}
		await this.editor.getPreviewFrame().locator( EditorSelectors.siteTitle ).click();
	}

	/**
	 * @description Function verifies link ("a" HTML tag) attributes with expected values
	 * @param {*}      element                  "a" HTML tag that contains link attributes
	 * @param {Object} options
	 * @param {*}      options.target           link target attribute
	 * @param {string} options.href             link href attribute
	 * @param {string} options.rel              link rel attribute
	 * @param {string} options.customAttributes link custom attribute: key|value
	 * @param {string} options.widget           widget name where we test link attributes
	 */
	async verifyLink( element: Locator,
		options: { target:string, href: string, rel: string, customAttributes: {key: string, value: string}, widget: string } ) {
		await expect( element ).toHaveAttribute( 'target', options.target );
		await expect( element ).toHaveAttribute( 'href', options.href );
		await expect( element ).toHaveAttribute( 'rel', options.rel );
		if ( options.widget !== 'text-path' ) {
			await expect( element ).toHaveAttribute( options.customAttributes.key, options.customAttributes.value );
		}
	}

	async chooseImage( imageTitle: string ) {
		await this.page.locator( EditorSelectors.media.preview ).click();
		await this.page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await this.page.locator( EditorSelectors.media.imageByTitle( imageTitle ) ).click();
		await this.page.locator( EditorSelectors.media.selectBtn ).click();
	}

	async selectImageSize( args: { widget: string, select: string, imageSize: string } ) {
		await this.editor.getPreviewFrame().locator( args.widget ).click();
		await this.page.locator( args.select ).selectOption( args.imageSize );
		await this.editor.getPreviewFrame().locator( EditorSelectors.pageTitle ).click();
	}

	async verifyImageSrc( args: { selector: string, imageTitle: string, isPublished: boolean, isVideo: boolean } ) {
		const image = args.isPublished
			? this.page.locator( args.selector )
			: await this.editor.getPreviewFrame().waitForSelector( args.selector );
		const attribute = args.isVideo ? 'style' : 'src';
		const src = await image.getAttribute( attribute );
		const regex = new RegExp( args.imageTitle );
		expect( regex.test( src ) ).toEqual( true );
	}

	async setCustomImageSize( args: { selector: string, select: string, imageTitle: string, width: string, height: string } ) {
		await this.editor.getPreviewFrame().locator( args.selector ).click();
		await this.page.locator( args.select ).selectOption( 'custom' );
		await this.page.locator( EditorSelectors.image.widthInp ).type( args.width );
		await this.page.locator( EditorSelectors.image.heightInp ).type( args.height );
		const regex = new RegExp( `http://(.*)/wp-content/uploads/elementor/thumbs/${ args.imageTitle }(.*)` );
		const response = this.page.waitForResponse( regex );
		await this.page.getByRole( 'button', { name: 'Apply' } ).click();
		await response;
	}

	async setLightBox( option: string ) {
		await this.page.getByRole( 'combobox', { name: 'Lightbox' } ).selectOption( option );
		await this.editor.getPreviewFrame().locator( EditorSelectors.siteTitle ).click();
	}

	async toggleControls( controlSelectors: string[] ) {
		for ( const i in controlSelectors ) {
			await this.page.locator( controlSelectors[ i ] )
				.locator( '..' )
				.locator( EditorSelectors.video.switch ).click();
		}
	}

	async uploadSVG( options? : { icon?: string, widget?: string} ) {
		const _icon = options?.icon === undefined ? 'test-svg-wide' : options.icon;
		if ( 'text-path' === options?.widget ) {
			await this.page.locator( EditorSelectors.plusIcon ).click();
		} else {
			await this.page.getByRole( 'button', { name: 'Content' } ).click();
			const mediaUploadControl = this.page.locator( EditorSelectors.media.preview ).first();
			await mediaUploadControl.hover();
			await mediaUploadControl.waitFor();
			await this.page.getByText( 'Upload SVG' ).first().click();
		}
		const regex = new RegExp( _icon );
		const response = this.page.waitForResponse( regex );
		await this.page.setInputFiles( EditorSelectors.media.imageInp, path.resolve( __dirname, `../../resources/${ _icon }.svg` ) );
		await response;
		await this.page.getByRole( 'button', { name: 'Insert Media' } )
			.or( this.page.getByRole( 'button', { name: 'Select' } ) ).nth( 1 ).click();
	}

	async addNewTab( tabName: string, text: string ) {
		const itemCount = await this.page.locator( EditorSelectors.item ).count();
		await this.page.getByRole( 'button', { name: 'Add Item' } ).click();
		await this.page.getByRole( 'textbox', { name: 'Title' } ).click();
		await this.page.getByRole( 'textbox', { name: 'Title' } ).fill( tabName );
		const textEditor = this.page.frameLocator( EditorSelectors.tabs.textEditorIframe ).nth( itemCount );
		await textEditor.locator( 'html' ).click();
		await textEditor.getByText( 'Tab Content' ).click();
		await textEditor.locator( EditorSelectors.tabs.body ).fill( text );
	}

	/**
	 * @description This function parses link ("a" tag) src attribute and gets Query Params and their values.
	 * The same as you copy src attribute value and put in Postman
	 * @param {string} src
	 * @return {Object} options: parsed query params with key|value
	 */
	parseSrc( src: string ) {
		const options = src.split( '?' )[ 1 ].split( '&' ).reduce( ( acc, cur ) => {
			const [ key, value ] = cur.split( '=' );
			acc[ key ] = value;
			return acc;
		}, {} );
		return options;
	}

	verifySrcParams( src: string,
		expectedValues: { q: string; t: string; z: string; output: string; iwloc: string; }, player: string ) {
		const videoOptions: Record< string, string | number> = this.parseSrc( src );
		if ( 'vimeo' === player ) {
			videoOptions.start = src.split( '#' )[ 1 ];
		}
		for ( const key in expectedValues ) {
			expect( videoOptions[ key ], { message: `Parameter is ${ key }` } ).toEqual( String( expectedValues[ key ] ) );
		}
	}
}

