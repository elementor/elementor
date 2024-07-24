import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';

export default class GoogleMaps extends Content {
	async setGoogleMapsParams( args : { location: string, zoom: string, height: string } ) {
		await this.page.locator( EditorSelectors.googleMaps.location ).fill( args.location );
		await this.page.getByLabel( 'Zoom' ).fill( args.zoom );
		await this.page.getByRole( 'spinbutton', { name: 'Height' } ).fill( args.height );
		await this.editor.waitForIframeToLoaded( 'google_maps' );
	}

	async getSrc( isPublished = false ) {
		const page = isPublished ? this.page : this.editor.getPreviewFrame();
		const src = await page.locator( 'iframe' ).getAttribute( 'src' );
		return src;
	}

	async getHeight( isPublished = false ) {
		const page = isPublished ? this.page : this.editor.getPreviewFrame();
		const box = await page.locator( 'iframe' ).boundingBox();
		return box.height;
	}
}
