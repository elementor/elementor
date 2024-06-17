import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';
import { resolve } from 'path';

export default class ImageCarousel extends Content {
	async addWidget() {
		const widgetId = await this.editor.addWidget( 'image-carousel' );
		return widgetId;
	}

	async selectNavigation( option: string ) {
		await this.page.selectOption( EditorSelectors.imageCarousel.navigationSelect, option );
	}

	async setAutoplay( option = 'false' ) {
		await this.page.getByText( 'Additional Options' ).click();
		await this.page.setChecked( EditorSelectors.imageCarousel.autoplaySelect, option );
	}

	async addImageGallery( args?: {images?: string[], metaData?: boolean} ) {
		const defaultImages = [ 'A.jpg', 'B.jpg', 'C.jpg', 'D.jpg', 'E.jpg' ];

		await this.editor.openPanelTab( 'content' );
		await this.page.locator( EditorSelectors.imageCarousel.addGalleryBtn ).click();
		await this.page.getByRole( 'tab', { name: 'Media Library' } ).click();

		const _images = args?.images === undefined ? defaultImages : args.images;

		for ( const i in _images ) {
			await this.page.setInputFiles( EditorSelectors.media.imageInp, resolve( __dirname, `../../resources/${ _images[ i ] }` ) );
			if ( args?.metaData ) {
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

	async verifyCaption( expectedData: string[], captionCount = 3 ) {
		for ( let i = 0; i < captionCount; i++ ) {
			await expect( this.editor.getPreviewFrame()
				.locator( EditorSelectors.imageCarousel.imgCaption ).nth( i ) ).toHaveText( expectedData[ i ] );
		}
	}

	async waitForSlide( id: string, imageName: string ) {
		await this.page.locator( EditorSelectors.imageCarousel.activeSlide( id ) ).waitFor();
		await this.page.locator( EditorSelectors.imageCarousel.activeSlideImg( imageName ) ).waitFor();
	}
}
