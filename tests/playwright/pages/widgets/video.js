const EditorPage = require( '../editor-page' );
import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class VideoWidget extends Content {
	constructor( page, testInfo ) {
		super( page, testInfo );
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async setTime( startOrEnd, value ) {
		const label = `${ String( startOrEnd ).toUpperCase() } Time`;
		await this.page.getByLabel( label ).click();
		await this.page.getByLabel( label ).clear( { force: true } );
		await this.page.getByLabel( label ).type( value );
	}

	async selectSuggestedVideos( option ) {
		await this.page.locator( EditorSelectors.video.suggestedVideoSelect ).selectOption( option );
	}

	async getVideoSrc( isPublished ) {
		const page = true === isPublished ? this.page : this.editorPage.getPreviewFrame();
		const src = await page.locator( EditorSelectors.video.iframe ).getAttribute( 'src' );
		return src;
	}

	async selectVideoSource( option ) {
		await this.page.locator( EditorSelectors.video.videoSourceSelect ).selectOption( option );
	}

	async verifyVideoLightBox( isPublished ) {
		const page = true === isPublished ? this.page : this.editorPage.getPreviewFrame();
		await expect( page.locator( EditorSelectors.video.lightBoxSetting ) ).toBeVisible();
		await page.locator( EditorSelectors.video.image ).click( );
		await expect( page.locator( EditorSelectors.video.lightBoxDialog ) ).toBeVisible();
	}
}
