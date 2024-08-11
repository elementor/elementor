import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';

export default class ContextMenu extends Content {
	async openContextMenu( widget: string ) {
		await this.editor
			.getPreviewFrame()
			.locator( EditorSelectors.getWidgetByName( widget ) )
			.click( { button: 'right' } );
	}
	async selectWidgetContextMenuItem( widget: string, menuItem: string ) {
		await this.openContextMenu( widget );
		await this.page.getByRole( 'menuitem', { name: menuItem } ).first().click();
	}
}
