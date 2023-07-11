const EditorPage = require( '../editor-page' );
import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';

export default class GoogleMaps extends Content {
	constructor( page, testInfo ) {
		super( page, testInfo );
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async setGoogleMapsParams( args = { location, zoom, height } ) {
		await this.page.locator( EditorSelectors.googleMaps.location ).fill( args.location );
		await this.page.getByLabel( 'Zoom' ).fill( args.zoom );
		await this.page.getByRole( 'spinbutton', { name: 'Height' } ).fill( String( args.height ) );
		await this.editorPage.waitForIframeToLoaded( 'google_maps' );
	}

	async getSrc( isPublished = false ) {
		const page = isPublished ? this.page : this.editorPage.getPreviewFrame();
		const src = await page.locator( 'iframe' ).getAttribute( 'src' );
		return src;
	}

	async getHeight( isPublished = false ) {
		const page = isPublished ? this.page : this.editorPage.getPreviewFrame();
		const box = await page.locator( 'iframe' ).boundingBox();
		return box.height;
	}
}
