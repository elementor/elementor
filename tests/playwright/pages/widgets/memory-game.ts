import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';

export default class MemoryGameWidget extends Content {
	async addWidget() {
		const widgetId = await this.editorPage.addWidget( 'memory-game' );
		return widgetId;
	}
	async selectContainer( option: string ) {
		await this.page.selectOption( EditorSelectors.memoryGame.container, option );
	}
	async selectCard( option: string ) {
		await this.page.selectOption( EditorSelectors.memoryGame.card, option );
	}
}
