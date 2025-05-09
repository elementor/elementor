import BasePage from '../base-page';
import type { Page, TestInfo } from '@playwright/test';

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
	 * Set width value for an element
	 * @param value - Width value in pixels
	 */
	async setWidth( value: number ): Promise<void> {
		await this.page.locator( 'label:has-text("Width")' ).locator( 'xpath=..' ).locator( 'input[type="number"]' ).fill( value.toString() );
	}

	/**
	 * Set height value for an element
	 * @param value - Height value in pixels
	 */
	async setHeight( value: number ): Promise<void> {
		await this.page.locator( 'label:has-text("Height")' ).locator( 'xpath=..' ).locator( 'input[type="number"]' ).fill( value.toString() );
	}

	/**
	 * Set min width value for an element
	 * @param value - Min width value in pixels
	 */
	async setMinWidth( value: number ): Promise<void> {
		await this.page.locator( 'label:has-text("Min width")' ).locator( 'xpath=..' ).locator( 'input[type="number"]' ).fill( value.toString() );
	}

	/**
	 * Set min height value for an element
	 * @param value - Min height value in pixels
	 */
	async setMinHeight( value: number ): Promise<void> {
		await this.page.locator( 'label:has-text("Min height")' ).locator( 'xpath=..' ).locator( 'input[type="number"]' ).fill( value.toString() );
	}

	/**
	 * Set max width value for an element
	 * @param value - Max width value in pixels
	 */
	async setMaxWidth( value: number ): Promise<void> {
		await this.page.locator( 'label:has-text("Max width")' ).locator( 'xpath=..' ).locator( 'input[type="number"]' ).fill( value.toString() );
	}

	/**
	 * Set max height value for an element
	 * @param value - Max height value in pixels
	 */
	async setMaxHeight( value: number ): Promise<void> {
		await this.page.locator( 'label:has-text("Max height")' ).locator( 'xpath=..' ).locator( 'input[type="number"]' ).fill( value.toString() );
	}

	/**
	 * Set overflow value for an element
	 * @param value - Overflow value ('visible', 'hidden', or 'auto')
	 */
	async setOverflow( value: 'visible' | 'hidden' | 'auto' ): Promise<void> {
		await this.page.locator( `button[value="${ value }"]` ).click();
	}
}
