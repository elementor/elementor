import EditorSelectors from '../../selectors/editor-selectors';
import { expect, type Frame, Locator, type Page, type TestInfo } from '@playwright/test';
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

	/**
	 * Set a link.
	 *
	 * @param {string}  link                - Link URL.
	 * @param {Object}  options             - Link options.
	 * @param {boolean} options.targetBlank - Optional. If true, set link to open in a new tab. Default is false.
	 * @param {boolean} options.noFollow    - Optional. If true, set link to have a nofollow attribute. Default is false.
	 * @param {boolean} options.linkTo      - Optional. If true, set link to custom URL. Default is false.
	 *
	 * @return {Promise<void>}
	 */
	async setLink( link: string, options : LinkOptions = { targetBlank: false, noFollow: false, linkTo: false } ): Promise<void> {
		if ( options.linkTo ) {
			await this.editor.setSelectControlValue( EditorSelectors.image.linkSelect, 'Custom URL' );
		}

		const urlInput = this.page.locator( options.linkInpSelector ).first();
		await urlInput.clear();
		await urlInput.fill( link );

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
				.fill( `${ options?.customAttributes.key }|${ options.customAttributes.value }` );
		}
		await this.editor.getPreviewFrame().locator( EditorSelectors.siteTitle ).click();
	}

	/**
	 * Verifies link (HTML `a` tag) attributes with expected values.
	 *
	 * @param {Locator} element                  - HTML `a` tag that contains link attributes.
	 * @param {Object}  options                  - Link attributes options.
	 * @param {string}  options.target           - Link `target` attribute
	 * @param {string}  options.href             - Link `href` attribute
	 * @param {string}  options.rel              - Link `rel` attribute
	 * @param {string}  options.customAttributes - Link custom attribute: `key|value`
	 * @param {string}  options.widget           - Widget name where we test link attributes
	 *
	 * @return {Promise<void>}
	 */
	async verifyLink( element: Locator, options: { target: string, href: string, rel: string, customAttributes: { key: string, value: string }, widget: string } ): Promise<void> {
		await expect( element ).toHaveAttribute( 'target', options.target );
		await expect( element ).toHaveAttribute( 'href', options.href );
		await expect( element ).toHaveAttribute( 'rel', options.rel );
		if ( options.widget !== 'text-path' ) {
			await expect( element ).toHaveAttribute( options.customAttributes.key, options.customAttributes.value );
		}
	}

	/**
	 * Set image size.
	 *
	 * @param {Object} args           - Image size arguments.
	 * @param {string} args.widget    - Widget selector.
	 * @param {string} args.select    - Select control selector.
	 * @param {string} args.imageSize - Image size.
	 *
	 * @return {Promise<void>}
	 */
	async selectImageSize( args: { widget: string, select: string, imageSize: string } ): Promise<void> {
		await this.editor.waitForPreviewFrame();
		const frame: Frame = this.editor.getPreviewFrame();
		await frame.locator( args.widget ).click();
		await this.page.locator( args.select ).selectOption( args.imageSize );
		await frame.locator( EditorSelectors.pageTitle ).click();
	}

	/**
	 * Verify image `src` attribute has expected values.
	 *
	 * @param {Object}  args             - Image src arguments.
	 * @param {string}  args.selector    - Image selector.
	 * @param {string}  args.imageTitle  - Image title.
	 * @param {boolean} args.isPublished - If true, the image is published.
	 * @param {boolean} args.isVideo     - If true, the widget is a video, otherwise an image.
	 *
	 * @return {Promise<void>}
	 */
	async verifyImageSrc( args: { selector: string, imageTitle: string, isPublished: boolean, isVideo: boolean } ): Promise<void> {
		const image = args.isPublished
			? this.page.locator( args.selector )
			: await this.editor.getPreviewFrame().waitForSelector( args.selector );
		const attribute = args.isVideo ? 'style' : 'src';
		const src = await image.getAttribute( attribute );
		const regex = new RegExp( args.imageTitle );
		expect( regex.test( src ) ).toEqual( true );
	}

	/**
	 * Set custom image size.
	 *
	 * @param {Object} args            - Custom image size arguments.
	 * @param {string} args.selector   - Image selector.
	 * @param {string} args.select     - Select control selector.
	 * @param {string} args.imageTitle - Image title.
	 * @param {string} args.width      - Image width.
	 * @param {string} args.height     - Image height.
	 *
	 * @return {Promise<void>}
	 */
	async setCustomImageSize( args: { selector: string, select: string, imageTitle: string, width: string, height: string } ): Promise<void> {
		await this.editor.getPreviewFrame().locator( args.selector ).click();
		await this.page.locator( args.select ).selectOption( 'custom' );
		await this.page.locator( EditorSelectors.image.widthInp ).fill( args.width );
		await this.page.locator( EditorSelectors.image.heightInp ).fill( args.height );
		const regex = new RegExp( `http://(.*)/wp-content/uploads/elementor/thumbs/${ args.imageTitle }(.*)` );
		const response = this.page.waitForResponse( regex );
		await this.page.getByRole( 'button', { name: 'Apply' } ).click();
		await response;
	}

	/**
	 * Upload SVG icon.
	 *
	 * @param {Object} options        - SVG options.
	 * @param {string} options.icon   - SVG icon.
	 * @param {string} options.widget - The widget to which to upload the SVG.
	 *
	 * @return {Promise<void>}
	 */
	async uploadSVG( options? : { icon?: string, widget?: string} ): Promise<void> {
		const _icon = options?.icon === undefined ? 'test-svg-wide' : options.icon;
		if ( 'text-path' === options?.widget ) {
			await this.page.locator( EditorSelectors.plusIcon ).click();
		} else {
			await this.editor.openPanelTab( 'content' );
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

	/**
	 * Parse link (HTML `a` tag) `src` attribute and gets Query Params and their values.
	 * The same as you copy src attribute value and put in Postman
	 *
	 * @param {string} src - Link `src` attribute value.
	 *
	 * @return {Record<string, string | number>} options: parsed query params with key|value
	 */
	parseSrc( src: string ): Record<string, string | number> {
		return src.split( '?' )[ 1 ].split( '&' ).reduce( ( acc, cur ) => {
			const [ key, value ] = cur.split( '=' );
			acc[ key ] = value;
			return acc;
		}, {} );
	}

	/**
	 * Verify video src attribute with expected values.
	 *
	 * @param {string} src                   - Video `src` attribute value.
	 * @param {Object} expectedValues        - Expected values for video src attribute.
	 * @param {string} expectedValues.q      - Video quality.
	 * @param {string} expectedValues.t      - Video start time.
	 * @param {string} expectedValues.z      - Video end time.
	 * @param {string} expectedValues.output - Video output.
	 * @param {string} expectedValues.iwloc  - Video location.
	 * @param {string} player                - Video player name. For instance 'youtube' or 'vimeo'.
	 *
	 * @return {void}
	 */
	verifySrcParams( src: string, expectedValues: { q: string; t: string; z: string; output: string; iwloc: string; }, player: string ): void {
		const videoOptions: Record< string, string | number> = this.parseSrc( src );
		if ( 'vimeo' === player ) {
			videoOptions.start = src.split( '#' )[ 1 ];
		}
		for ( const key in expectedValues ) {
			expect( videoOptions[ key ], { message: `Parameter is ${ key }` } ).toEqual( String( expectedValues[ key ] ) );
		}
	}
}

