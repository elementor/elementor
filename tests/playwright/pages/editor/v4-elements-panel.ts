import BasePage from '../base-page';
import type { Page, TestInfo } from '@playwright/test';

interface SizeOptions {
	width?: number;
	height?: number;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	overflow?: 'visible' | 'hidden' | 'auto';
}

export default class v4Panel extends BasePage {
	readonly inputField: string;

	constructor( page: Page, testInfo: TestInfo ) {
		super( page, testInfo );
		this.inputField = 'input[class*="MuiInputBase"]';
	}

	async fillField( nth: number, text: string ): Promise<void> {
		await this.page.locator( this.inputField ).nth( nth ).fill( text );
	}

	/**
	 * Set size parameters for an element
	 * @param {SizeOptions}                 options             - Object containing size parameters
	 * @param {number}                      [options.width]     - Width value in pixels
	 * @param {number}                      [options.height]    - Height value in pixels
	 * @param {number}                      [options.minWidth]  - Min width value in pixels
	 * @param {number}                      [options.minHeight] - Min height value in pixels
	 * @param {number}                      [options.maxWidth]  - Max width value in pixels
	 * @param {number}                      [options.maxHeight] - Max height value in pixels
	 * @param {('visible'|'hidden'|'auto')} [options.overflow]  - Overflow value
	 */
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
				await inputLocator.dispatchEvent( 'input' ); // Ensure value is triggered
			}
		}

		if ( options.overflow ) {
			await this.page.locator( `button[value="${ options.overflow }"]` ).click();
		}
	}
}
