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
	 * @param {SizeOptions} options - Object containing size parameters
	 * @param {number} [options.width] - Width value in pixels
	 * @param {number} [options.height] - Height value in pixels
	 * @param {number} [options.minWidth] - Min width value in pixels
	 * @param {number} [options.minHeight] - Min height value in pixels
	 * @param {number} [options.maxWidth] - Max width value in pixels
	 * @param {number} [options.maxHeight] - Max height value in pixels
	 * @param {('visible'|'hidden'|'auto')} [options.overflow] - Overflow value
	 */
	async setSize( options: SizeOptions ): Promise<void> {
		const sizeControls = {
			width: { label: 'Width', dataSetting: 'width' },
			height: { label: 'Height', dataSetting: 'height' },
			minWidth: { label: 'Min width', dataSetting: 'min_width' },
			minHeight: { label: 'Min height', dataSetting: 'min_height' },
			maxWidth: { label: 'Max width', dataSetting: 'max_width' },
			maxHeight: { label: 'Max height', dataSetting: 'max_height' },
		};

		// Set numeric values
		for ( const [ key, control ] of Object.entries( sizeControls ) ) {
			if ( options[ key ] !== undefined ) {
				// Wait for the section to be visible
				await this.page.waitForSelector( '.elementor-control-size' );

				// Find the input within the size section
				const input = this.page.locator( '.elementor-control-size' )
					.locator( `input[data-setting="${ control.dataSetting }"]` );

				// Wait for the input to be visible
				await input.waitFor( { state: 'visible' } );

				// Fill the input
				await input.fill( options[ key ].toString() );
			}
		}

		// Set overflow if provided
		if ( options.overflow ) {
			await this.page.locator( `button[value="${ options.overflow }"]` ).click();
		}
	}
}
