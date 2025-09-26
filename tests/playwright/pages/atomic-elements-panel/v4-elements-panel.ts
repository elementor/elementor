import BasePage from '../base-page';
import { type Page, type TestInfo } from '@playwright/test';
import EditorPage from '../editor-page';
import StyleTab from './style-tab';
import GeneralTab from './genetal-tab';

export default class v4Panel extends BasePage {
	readonly inputField: string;
	readonly editor: EditorPage;
	readonly style: StyleTab;
	readonly general: GeneralTab;

	constructor( page: Page, testInfo: TestInfo, editor: EditorPage ) {
		super( page, testInfo );
		this.inputField = 'input[class*="MuiInputBase"]';
		this.editor = editor;
		this.style = new StyleTab( page, testInfo );
		this.general = new GeneralTab( page, testInfo );
	}

	async fillField( nth: number, text: string ): Promise<void> {
		await this.page.locator( this.inputField ).nth( nth ).fill( text );
	}

	async setWidgetSize( options: { width?: number, height?: number, minWidth?: number, minHeight?: number, maxWidth?: number, maxHeight?: number, overflow?: string } ): Promise<void> {
		const sizeControls = {
			width: 'Width',
			height: 'Height',
			minWidth: 'Min width',
			minHeight: 'Min height',
			maxWidth: 'Max width',
			maxHeight: 'Max height',
		};

		for ( const [ key, label ] of Object.entries( sizeControls ) ) {
			if ( options[ key ] !== undefined ) {
				const labelLocator = this.page.locator( `//label[contains(text(), '${ label }')]` ).last();
				const inputLocator = labelLocator.locator( 'xpath=following::input[1]' );
				await inputLocator.fill( String( options[ key ] ) );
				await inputLocator.dispatchEvent( 'input' );
			}
		}

		if ( options.overflow ) {
			await this.page.locator( `button[value="${ options.overflow }"]` ).click();
		}
	}


}
