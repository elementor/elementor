import { expect } from '@playwright/test';
import Content from '../elementor-panel-tabs/content';
import EditorSelectors from '../../selectors/editor-selectors';

export default class promotionsHelper extends Content {
	async widgetControlPromotionModalScreenshotTest( element: string ) {
		await this.page.locator( `.e-control-${ element }-promotion` ).click( { force: true } );
		const modalContainer = this.page.locator( '#elementor-element--promotion__dialog' );
		await expect.soft( modalContainer ).toHaveScreenshot( `${ element }-modal.png` );
		await this.page.locator( '.dialog-header .eicon-close' ).click();
	}

	async modalPromotionModalVisibilityTest( element: string ) {
		await this.page.locator( `.elementor-control-${ element }` ).click( { force: true } );
		const modalContainer = this.page.locator( EditorSelectors.panels.promotionCard );
		await expect.soft( modalContainer ).toBeVisible();
		await expect( modalContainer.getByText( 'PRO' ) ).toBeVisible();
		await modalContainer.getByRole( 'button', { name: 'close' } ).click();
		await expect.soft( modalContainer ).toBeHidden();
	}
}
