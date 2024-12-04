import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';

export default class ContextMenu extends Content {
	/**
	 * Open context menu for a given widget.
	 *
	 * @param {string} widget - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async openContextMenu( widget: string ) {
		await this.editor
			.getPreviewFrame()
			.locator( EditorSelectors.getWidgetByName( widget ) )
			.click( { button: 'right' } );
	}

	/**
	 * Select a widget and open a given context menu item.
	 *
	 * @param {string} widget   - Element ID.
	 * @param {string} menuItem - Context menu to open.
	 *
	 * @return {Promise<void>}
	 */
	async selectWidgetContextMenuItem( widget: string, menuItem: string ) {
		await this.openContextMenu( widget );
		await this.page.getByRole( 'menuitem', { name: menuItem } ).first().click();
	}

	/**
	 * Open context menu for an element and copy it.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async copyElement( elementId: string ) {
		const element = this.editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.click( { button: 'right' } );

		const copyListItemSelector = '.elementor-context-menu-list__item-copy:visible';
		await this.page.waitForSelector( copyListItemSelector );
		await this.page.locator( copyListItemSelector ).click();
	}

	/**
	 * Paste an element inside the editor, on a given selector.
	 *
	 * @param {string} selector - Element selector.
	 *
	 * @return {Promise<void>}
	 */
	async pasteElement( selector: string ) {
		await this.editor.getPreviewFrame().locator( selector ).click( { button: 'right' } );

		const pasteSelector = '.elementor-context-menu-list__group-paste .elementor-context-menu-list__item-paste';
		await this.page.locator( pasteSelector ).click();
	}

	/**
	 * Open context menu for an element and paste styling setting on the element.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async pasteStyleElement( elementId: string ) {
		const element = this.editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.click( { button: 'right' } );

		const pasteListItemSelector = '.elementor-context-menu-list__item-pasteStyle:visible';
		await this.page.waitForSelector( pasteListItemSelector );
		await this.page.locator( pasteListItemSelector ).click();
	}
}
