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

	async setFontFamily( fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		this.page.getByRole( 'button', { name: 'Font family' } ).click();
		const categorySelector = 'google' === fontType ? 'Google Fonts' : 'System';
		this.page.locator( '.MuiListSubheader-root', { hasText: categorySelector } ).click();
		this.page.locator( 'input[placeholder="Search"]' ).fill( fontName );
		await this.page.waitForTimeout( timeouts.short );
		this.page.locator( '[role="option"]', { hasText: fontName } ).first().click();
	}

	async setFontSize( size: number, unit: Unit ): Promise<void> {
		const fontSizeInput = this.page.locator( '[aria-label="Font size"]' );

		if ( 'px' !== unit ) {
			const unitButton = fontSizeInput.locator( '..' ).getByRole( 'button' ).filter( { hasText: /^(px|em|rem|vw|vh|%)$/ } );
			await unitButton.click();

			await this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } ).click();
			await fontSizeInput.locator( '..' ).getByRole( 'button', { name: unit } ).waitFor( { state: 'visible' } );
		}

		await fontSizeInput.fill( size.toString() );
		await fontSizeInput.blur();
	}
}
