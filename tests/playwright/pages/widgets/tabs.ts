import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';

export default class TabsWidget extends Content {
	/**
	 * Create new tab ans set the tab name and tab content.
	 *
	 * @param {string} tabName    - Tab name.
	 * @param {string} tabContent - Tab content.
	 *
	 * @return {Promise<void>}
	 */
	async createNewTab( tabName: string, tabContent: string ): Promise<void> {
		const itemCount = await this.page.locator( EditorSelectors.item ).count();
		await this.page.getByRole( 'button', { name: 'Add Item' } ).click();
		const tabTitle = this.page.getByRole( 'textbox', { name: 'Title' } );
		await tabTitle.click();
		await tabTitle.fill( tabName );
		const textEditor = this.page.frameLocator( EditorSelectors.tabs.textEditorIframe ).nth( itemCount );
		await textEditor.locator( 'html' ).click();
		await textEditor.getByText( 'Tab Content' ).click();
		await textEditor.locator( EditorSelectors.tabs.body ).fill( tabContent );
	}
}
