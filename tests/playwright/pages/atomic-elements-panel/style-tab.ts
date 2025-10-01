import { Unit } from '../../sanity/modules/v4-tests/typography/typography-constants';
import BasePage from '../base-page';
import { type Locator } from '@playwright/test';
import { timeouts } from '../../config/timeouts';

export const STYLE_SECTIONS = {
	SIZE: 'Size',
	TYPOGRAPHY: 'Typography',
	LAYOUT: 'Layout',
	SPACING: 'Spacing',
	POSITION: 'Position',
	BACKGROUND: 'Background',
	BORDER: 'Border',
	EFFECTS: 'Effects',
} as const;

export type StyleSection = typeof STYLE_SECTIONS[keyof typeof STYLE_SECTIONS];

export default class StyleTab extends BasePage {
	protected async getInputByLabel( labelText: string ): Promise<Locator> {
		const input = this.page.locator( `[aria-label="${ labelText } control"]` ).locator( 'input' );
		await input.waitFor( { state: 'visible', timeout: 5000 } );
		return input;
	}

	protected async getUnitButtonByLabel( labelText: string ): Promise<Locator> {
		return this.page.locator( `[aria-label="${ labelText } control"]` )
			.locator( 'button[aria-haspopup="true"]' )
			.first();
	}

	protected async changeUnit( unitButton: Locator, targetUnit: string ): Promise<void> {
		const currentUnitText = await unitButton.textContent();
		if ( currentUnitText?.toLowerCase() !== targetUnit.toLowerCase() ) {
			await unitButton.click();
			const unitOption = this.page.getByRole( 'menuitem', { name: targetUnit.toUpperCase(), exact: true } );
			await unitOption.waitFor( { state: 'visible' } );
			await unitOption.click();
		}
	}

	async clickShowMore( sectionName: string ): Promise<void> {
		const content = this.page.locator( `[aria-label="${ sectionName } section content"]` );
		const showMoreBtn = content.locator( '[aria-label="Show more"]' );

		// Check if the "Show more" button exists before trying to click it
		const isShowMoreVisible = await showMoreBtn.isVisible().catch( () => false );
		if ( isShowMoreVisible ) {
			await showMoreBtn.click();
		}
	}

	async setSpacingValue( labelText: string, value: number, unit: Unit ): Promise<void> {
		const spacingInput = await this.getInputByLabel( labelText );
		const unitButton = await this.getUnitButtonByLabel( labelText );

		await this.changeUnit( unitButton, unit );
		await spacingInput.fill( value.toString() );
	}

	/**
	 * Set font family for typography controls.
	 *
	 * @param {string} fontName - The name of the font to select.
	 * @param {'system' | 'google'} fontType - The type of font (system or google).
	 *
	 * @return {Promise<void>}
	 */
	async setFontFamily( fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		// Use the same selector pattern as the original implementation but with improved error handling
		const fontFamilyButton = this.page.locator( 'div.MuiGrid-container' ).filter( {
			has: this.page.locator( 'label', { hasText: 'Font family' } ),
		} ).locator( '[role="button"]' );

		await fontFamilyButton.click();
		await this.page.waitForSelector( '.MuiPopover-paper', { state: 'visible', timeout: timeouts.action } );

		// Select the appropriate font category using the original selector pattern
		const categorySelector = 'google' === fontType ? 'Google Fonts' : 'System';
		const categoryButton = this.page.locator( '.MuiListSubheader-root', { hasText: categorySelector } );
		
		await categoryButton.click();

		// For Google fonts, we need to search for the specific font
		if ( 'google' === fontType ) {
			// Wait for the search box to be available
			const searchBox = this.page.locator( 'input[placeholder="Search"]' );
			await searchBox.waitFor( { state: 'visible', timeout: timeouts.action } );
			
			// Clear any existing search and type the font name
			await searchBox.clear();
			await searchBox.fill( fontName );
			
			// Wait for the search results to load
			await this.page.waitForTimeout( timeouts.short );
		}

		// Select the specific font using the original selector pattern
		const fontOption = this.page.locator( '[role="option"]', { hasText: fontName } ).first();
		
		// Wait for the font option to be visible (with longer timeout for Google fonts)
		const timeout = 'google' === fontType ? timeouts.longAction : timeouts.action;
		await fontOption.waitFor( { state: 'visible', timeout } );
		
		await fontOption.click();
	}
}
