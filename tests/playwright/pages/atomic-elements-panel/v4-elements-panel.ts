import BasePage from '../base-page';
import { type Page, type TestInfo } from '@playwright/test';
import EditorPage from '../editor-page';
import StyleTab from './style-tab';

export default class v4Panel extends BasePage {
	readonly inputField: string;
	readonly textareaField: string;
	readonly editor: EditorPage;
	readonly style: StyleTab;

	constructor( page: Page, testInfo: TestInfo, editor: EditorPage ) {
		super( page, testInfo );
		this.inputField = 'input[class*="MuiInputBase"]';
		this.textareaField = 'textarea[class*="MuiInputBase"]';
		this.editor = editor;
		this.style = new StyleTab( page, testInfo );
	}

	async fillField( nth: number, text: string ): Promise<void> {
		await this.page.locator( this.inputField ).nth( nth ).fill( text );
	}

	async fillTextarea( nth: number, text: string ): Promise<void> {
		await this.page.locator( this.textareaField ).nth( nth ).fill( text );
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

	async openTab( sectionName: 'style' | 'general' ): Promise<void> {
		const selectorMap: Record< 'style' | 'general', string > = {
			style: 'style',
			general: 'settings',
		};
		const sectionButtonSelector = `#tab-0-${ selectorMap[ sectionName ] }`,
			sectionContentSelector = `#tabpanel-0-${ selectorMap[ sectionName ] }`,
			isOpenSection = await this.page.evaluate( ( selector ) => {
				const sectionContentElement: HTMLElement = document.querySelector( selector );

				return ! sectionContentElement?.hidden;
			}, sectionContentSelector );

		if ( isOpenSection ) {
			return;
		}

		while ( ! await this.page.locator( sectionContentSelector ).isVisible() ) {
			await this.page.locator( sectionButtonSelector ).click();
		}
	}

	async addAtomicWidget( widgetTitle: string, widgetName: string ) {
		await this.editor.openElementsPanel();
		const panelWidgetButton = this.page.locator( `#elementor-panel-category-v4-elements .elementor-panel-category-items :text-is("${ widgetTitle }")` );
		await panelWidgetButton.waitFor( { state: 'visible' } );
		await panelWidgetButton.click();

		const widgetElement = this.editor.getPreviewFrame().locator( `[data-widget_type="${ widgetName }.default"]` ).first();
		await widgetElement.waitFor( { state: 'visible' } );

		return widgetElement;
	}
}
