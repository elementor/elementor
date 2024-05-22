import EditorSelectors from '../../selectors/editor-selectors';
import { type Page, type TestInfo } from '@playwright/test';
import EditorPage from '../editor-page';

export default class Style {
	readonly page: Page;
	readonly editorPage: EditorPage;
	constructor( page: Page, testInfo: TestInfo ) {
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async setColorPicker( widget: string, color: string ) {
		await this.editorPage
			.getPreviewFrame()
			.locator( EditorSelectors.getWidgetByName( widget ) )
			.first()
			.click();
		await this.page.getByRole( 'button', { name: ' Style' } ).click();
		await this.page.getByRole( 'button', { name: 'toggle color picker dialog' } ).click();
		await this.page.getByRole( 'textbox', { name: 'color input field' } ).click();
		await this.page.locator( '.pcr-app.visible input.pcr-result' ).fill( color );
		await this.editorPage.openElementsPanel();
	}
}
