const EditorPage = require( '../editor-page' );
import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';
import { resolve } from 'path';

export default class ImageCarousel extends Content {
	constructor( page, testInfo ) {
		super( page, testInfo );
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async addWidget() {
		const widgetId = await this.editorPage.addWidget( 'image-carousel' );
		return widgetId;
	}

	async selectNavigation( option ) {
		await this.page.selectOption( EditorSelectors.imageCarousel.navigationSelect, option );
	}

	async setAutoplay( option = 'no' ) {
		await this.page.getByText( 'Additional Options' ).click();
		await this.page.selectOption( EditorSelectors.imageCarousel.autoplaySelect, option );
	}

	async addImageGallery( images, metaData = false ) {
		const defaultImages = [ 'A.jpg', 'B.jpg', 'C.jpg', 'D.jpg', 'E.jpg' ];

		await this.editorPage.activatePanelTab( 'content' );
		await this.page.locator( EditorSelectors.imageCarousel.addGalleryBtn ).click();
		await this.page.getByRole( 'tab', { name: 'Media Library' } ).click();

		const _images = images === undefined ? defaultImages : images;

		for ( const i in _images ) {
			await this.page.setInputFiles( EditorSelectors.media.imageInp, resolve( __dirname, `../../resources/${ _images[ i ] }` ) );
			if ( metaData ) {
				await this.addTestImageMetaData();
			}
		}

		await this.page.locator( EditorSelectors.media.addGalleryButton ).click();
		await this.page.locator( 'text=Insert gallery' ).click();
	}

	async addTestImageMetaData( args = { caption: 'Test caption!', description: 'Test description!' } ) {
		await this.page.locator( EditorSelectors.media.images ).first().click();
		await this.page.locator( EditorSelectors.media.imgCaption ).clear();
		await this.page.locator( EditorSelectors.media.imgCaption ).type( args.caption );

		await this.page.locator( EditorSelectors.media.images ).first().click();
		await this.page.locator( EditorSelectors.media.imgDescription ).clear();
		await this.page.locator( EditorSelectors.media.imgDescription ).type( args.description );
	}

	async verifyCaption( expectedData, captionCount = 3 ) {
		for ( let i = 0; i < captionCount; i++ ) {
			await expect( this.editorPage.getPreviewFrame()
				.locator( EditorSelectors.imageCarousel.imgCaption ).nth( i ) ).toHaveText( expectedData[ i ] );
		}
	}

	async waitForSlide( id, imageName ) {
		await this.page.locator( EditorSelectors.imageCarousel.activeSlide( id ) ).waitFor();
		await this.page.locator( EditorSelectors.imageCarousel.activeSlideImg( imageName ) ).waitFor();
	}
}
