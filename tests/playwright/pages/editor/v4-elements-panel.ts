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

	async setV4SelectControlValue( labelText: string, value: string, exactMatch: boolean = true ): Promise<void> {
		const controlButton = this.page
			.locator( 'div.MuiGrid-container' )
			.filter( { has: this.page.locator( 'label', { hasText: labelText } ) } )
			.locator( '[role="button"]' );

		await controlButton.click();

		// Wait for dropdown to appear
		await this.page.waitForSelector( '[role="listbox"], [role="menu"], [role="option"]', { timeout: 5000 } );

		// Try multiple selectors to find the option
		let option = null;

		if ( exactMatch ) {
			// Try different ways to find the exact option
			option = this.page.getByRole( 'option', { name: value, exact: true } )
				.or( this.page.getByText( value, { exact: true } ) )
				.or( this.page.locator( `[role="option"]:has-text("${ value }")` ).first() );
		} else {
			// For partial matches
			option = this.page.getByRole( 'option', { name: new RegExp( value, 'i' ) } )
				.or( this.page.getByText( value ) )
				.or( this.page.locator( `[role="option"]:has-text("${ value }")` ) ).first();
		}

		// Check if option exists and is visible
		const isVisible = await option.isVisible().catch( () => false );

		if ( ! isVisible ) {
			// If specific font not found, just select the first available option
			const firstOption = this.page.locator( '[role="option"]' ).first();
			await firstOption.click();
		} else {
			await option.click();
		}
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
