import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class VideoWidget extends Content {
	async setTime( startOrEnd: string, value: string ) {
		const label = `${ String( startOrEnd ).toUpperCase() } Time`;
		await this.page.getByLabel( label ).click();
		await this.page.getByLabel( label ).clear( { force: true } );
		await this.page.getByLabel( label ).type( value );
	}

	async getVideoSrc( isPublished: boolean ) {
		const page = true === isPublished ? this.page : this.editor.getPreviewFrame();
		const src = await page.locator( EditorSelectors.video.iframe ).getAttribute( 'src' );
		return src;
	}

	async verifyVideoLightBox( isPublished: boolean ) {
		const page = true === isPublished ? this.page : this.editor.getPreviewFrame();
		await expect( page.locator( EditorSelectors.video.lightBoxSetting ) ).toBeVisible();
		await page.locator( EditorSelectors.video.image ).click( );
		await expect( page.locator( EditorSelectors.video.lightBoxDialog ) ).toBeVisible();
	}
}
