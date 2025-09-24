import BasePage from '../base-page';
import { type Page, type TestInfo } from '@playwright/test';
import EditorPage from '../editor-page';
import StyleTab from './style-tab';

export default class v4Panel extends BasePage {
	readonly inputField: string;
	readonly editor: EditorPage;
	readonly style: StyleTab;

	constructor( page: Page, testInfo: TestInfo, editor: EditorPage ) {
		super( page, testInfo );
		this.inputField = 'input[class*="MuiInputBase"]';
		this.editor = editor;
		this.style = new StyleTab( page, testInfo );
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

	async setV4SelectControlValue( labelText: string, value: string, exactMatch: boolean = true ): Promise<void> {
		const controlButton = this.page
			.locator( 'div.MuiGrid-container' )
			.filter( { has: this.page.locator( 'label', { hasText: labelText } ) } )
			.locator( '[role="button"]' );

		const buttonExists = await controlButton.isVisible().catch( () => false );

		if ( buttonExists ) {
			await controlButton.click();
			await this.page.waitForSelector( '[role="listbox"], [role="menu"], [role="option"]', { timeout: 5000 } );

			let option = null;

			if ( exactMatch ) {
				option = this.page.getByRole( 'option', { name: value, exact: true } )
					.or( this.page.getByText( value, { exact: true } ) )
					.or( this.page.locator( `[role="option"]:has-text("${ value }")` ).first() );
			} else {
				option = this.page.getByRole( 'option', { name: new RegExp( value, 'i' ) } )
					.or( this.page.getByText( value ) )
					.or( this.page.locator( `[role="option"]:has-text("${ value }")` ) ).first();
			}

			const isVisible = await option.isVisible().catch( () => false );

			if ( ! isVisible ) {
				const firstOption = this.page.locator( '[role="option"]' ).first();
				await firstOption.click();
			} else {
				await option.click();
			}
		} else {
			const labelElement = this.page.locator( 'label', { hasText: labelText } );
			const selectElement = labelElement.locator( 'xpath=following::select[1]' );
			const selectExists = await selectElement.isVisible().catch( () => false );

			if ( selectExists ) {
				await selectElement.selectOption( value );
			} else {
				const combobox = labelElement.locator( 'xpath=following::*[@role="combobox"][1]' );
				const comboboxExists = await combobox.isVisible().catch( () => false );

				if ( comboboxExists ) {
					await combobox.click();
					await this.page.waitForTimeout( 1000 );

					const option = this.page.locator( `[role="option"]:has-text("${ value }")` ).first();
					const optionExists = await option.isVisible().catch( () => false );

					if ( optionExists ) {
						await option.click();
					}
				} else {
					const clickableElement = labelElement.locator( 'xpath=following::*[contains(@class, "select") or contains(@class, "dropdown") or @role="button" or @type="button"][1]' );
					const clickableExists = await clickableElement.isVisible().catch( () => false );

					if ( clickableExists ) {
						await clickableElement.click();
						await this.page.waitForTimeout( 1000 );

						const option = this.page.locator( `text="${ value }"` ).first();
						const optionExists = await option.isVisible().catch( () => false );

						if ( optionExists ) {
							await option.click();
						}
					}
				}
			}
		}
	}

}
