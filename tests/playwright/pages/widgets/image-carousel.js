const EditorPage = require( '../editor-page' );
import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
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

	async populateImageCarousel( images ) {
		const defaultImages = [ 'A.jpg', 'B.jpg', 'C.jpg', 'D.jpg', 'E.jpg' ];

		await this.editorPage.activatePanelTab( 'content' );
		await this.page.locator( EditorSelectors.imageCarousel.addGalleryBtn ).click();
		await this.page.getByRole( 'tab', { name: 'Media Library' } ).click();

		const _images = images === undefined ? defaultImages : images;

		for ( const i in _images ) {
			await this.page.setInputFiles( EditorSelectors.media.imageInp, resolve( __dirname, `../../resources/${ _images[ i ] }` ) );
		}
		await this.page.locator( EditorSelectors.media.addGalleryButton ).click();
		await this.page.locator( 'text=Insert gallery' ).click();
	}
}
