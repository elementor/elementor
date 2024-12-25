import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class ButtonWidget extends Content {
	/**
	 * Add a button widget to the editor.
	 *
	 * @param {string} buttonName - Button name.
	 *
	 * @return {Promise<void>}
	 */
	async addWidget( buttonName: string ): Promise<void> {
		await this.editor.addWidget( 'button' );
		await this.editor.getPreviewFrame().waitForSelector( EditorSelectors.button.getByName( buttonName ) );
	}

	/**
	 * Set the button widget id.
	 *
	 * @param {string} buttonId   - Button ID.
	 * @param {string} buttonName - Button name.
	 *
	 * @return {Promise<void>}
	 */
	async setButtonId( buttonId: string, buttonName: string ): Promise<void> {
		await this.page.locator( EditorSelectors.button.id ).type( buttonId );
		await expect( this.editor.getPreviewFrame().locator( EditorSelectors.button.getByName( buttonName ) ) ).toHaveAttribute( 'id', buttonId );
	}

	/**
	 * Get the button widget ID.
	 *
	 * @param {string}  buttonName  - Button name.
	 * @param {boolean} isPublished - Optional. Whether the page is published. Default is true.
	 *
	 * @return {Promise<string>}
	 */
	async getButtonId( buttonName: string, isPublished: boolean = true ): Promise<string> {
		if ( isPublished ) {
			return await this.page.locator( EditorSelectors.button.getByName( buttonName ) ).getAttribute( 'id' );
		}
		return await this.editor.getPreviewFrame().locator( EditorSelectors.button.getByName( buttonName ) ).getAttribute( 'id' );
	}
}
