import BasePage from '../base-page';

interface TypographyOptions {
	fontFamily?: string;
	fontSize?: string;
	fontWeight?: string;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	lineHeight?: string;
	letterSpacing?: string;
	textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

const TIMEOUTS = {
	FONT_LOADING: 2000,
	ANIMATION: 500,
	UNIT_CHANGE: 1000,
	CHANGES_APPLY: 500,
} as const;

export default class TypographySettings extends BasePage {
	private async fillInputByLabel( labelText: string, value: string ): Promise<void> {
		const input = this.page.locator( 'label', { hasText: labelText } ).locator( 'xpath=following::input[1]' );
		if ( await input.isVisible() ) {
			await input.fill( value );
			await input.dispatchEvent( 'input' );
		}
	}

	private async setSpacingValue( labelText: string, value: number, unit: string ): Promise<void> {
		await this.waitForTypographyControls();

		// Click "Show More" if needed
		const showMoreButton = this.page.getByRole( 'button', { name: 'Show More' } );
		if ( await showMoreButton.isVisible() ) {
			await showMoreButton.click();
		}

		// Find spacing container and input
		const spacingLabel = this.page.locator( 'label', { hasText: labelText } );
		const spacingContainer = spacingLabel.locator( 'xpath=ancestor::div[contains(@class, "MuiGrid-container")][1]' );
		const spacingInput = spacingContainer.locator( 'input' );
		await spacingInput.waitFor( { state: 'visible', timeout: 5000 } );

		// Set unit if different
		const currentUnitButton = spacingContainer.locator( 'button[aria-haspopup="true"]' ).first();
		const currentUnitText = await currentUnitButton.textContent();

		if ( currentUnitText?.toLowerCase() !== unit.toLowerCase() ) {
			await currentUnitButton.click();
			const unitOption = this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } );
			await unitOption.waitFor( { state: 'visible' } );
			await unitOption.click();
		}

		// Set the value
		await spacingInput.clear();
		await spacingInput.fill( value.toString() );
		await spacingInput.press( 'Enter' );
	}

	async setTypography( options: TypographyOptions ): Promise<void> {
		if ( options.fontSize ) {
			await this.fillInputByLabel( 'Font size', options.fontSize );
		}

		if ( options.fontWeight ) {
			await this.setFontWeight( options.fontWeight );
		}

		if ( options.fontFamily ) {
			await this.setFontFamily( options.fontFamily );
		}

		if ( options.textAlign ) {
			await this.setTextAlignment( options.textAlign );
		}

		if ( options.lineHeight ) {
			await this.fillInputByLabel( 'Line height', options.lineHeight );
		}

		if ( options.letterSpacing ) {
			await this.fillInputByLabel( 'Letter spacing', options.letterSpacing );
		}

		if ( options.textTransform ) {
			await this.setTextTransform( options.textTransform );
		}
	}

	async setFontFamily( fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		const fontFamilyButton = this.page.locator( 'div.MuiGrid-container' ).filter( {
			has: this.page.locator( 'label', { hasText: 'Font family' } ),
		} ).locator( '[role="button"]' );

		await fontFamilyButton.click();
		await this.page.waitForSelector( '.MuiPopover-paper', { state: 'visible' } );

		if ( 'google' === fontType ) {
			await this.page.locator( '.MuiListSubheader-root', { hasText: 'Google Fonts' } ).click();
			await this.page.waitForTimeout( TIMEOUTS.FONT_LOADING );
		} else {
			await this.page.locator( '.MuiListSubheader-root', { hasText: 'System' } ).click();
		}

		const fontOption = this.page.locator( '[role="option"]', { hasText: fontName } ).first();
		await fontOption.click();
	}

	async setTextAlignment( alignment: 'left' | 'center' | 'right' | 'justify' ): Promise<void> {
		const alignmentMap = {
			left: 'Start',
			center: 'Center',
			right: 'End',
			justify: 'Justify',
		};

		const buttonName = alignmentMap[ alignment ];
		const alignmentButton = this.page.getByRole( 'button', { name: buttonName } );
		await alignmentButton.click();
	}

	async clearTextAlignment(): Promise<void> {
		const alignmentButton = this.page.getByRole( 'button', { name: /^(Start|Center|End|Justify)$/ } ).first();
		await alignmentButton.hover();
		const clearButton = this.page.getByRole( 'button', { name: 'Clear' } );
		await clearButton.click();
		await this.page.waitForTimeout( TIMEOUTS.CHANGES_APPLY );
	}

	async getTypographyValues(): Promise<Partial<TypographyOptions>> {
		const values: Partial<TypographyOptions> = {};

		const fontSizeInput = this.page.locator( 'label', { hasText: 'Font size' } ).locator( 'xpath=following::input[1]' );
		if ( await fontSizeInput.isVisible() ) {
			values.fontSize = await fontSizeInput.inputValue();
		}

		const lineHeightInput = this.page.locator( 'label', { hasText: 'Line height' } ).locator( 'xpath=following::input[1]' );
		if ( await lineHeightInput.isVisible() ) {
			values.lineHeight = await lineHeightInput.inputValue();
		}

		const letterSpacingInput = this.page.locator( 'label', { hasText: 'Letter spacing' } ).locator( 'xpath=following::input[1]' );
		if ( await letterSpacingInput.isVisible() ) {
			values.letterSpacing = await letterSpacingInput.inputValue();
		}

		return values;
	}

	async isTypographySectionOpen(): Promise<boolean> {
		const typographyButton = this.page.locator( '.MuiButtonBase-root', { hasText: /typography/i } );
		if ( await typographyButton.isVisible() ) {
			const contentSelector = await typographyButton.getAttribute( 'aria-controls' );
			return await this.page.evaluate( ( selector ) => {
				return !! document.getElementById( selector );
			}, contentSelector );
		}
		return false;
	}

	async waitForTypographyControls( timeout: number = 5000 ): Promise<void> {
		await this.page.waitForSelector( 'label:has-text("Font size"), label:has-text("Font family"), .MuiButtonBase-root', { timeout } );
	}

	async setFontSizeUnit( unit: string ): Promise<void> {
		const unitButton = this.page.getByRole( 'button', { name: /^(px|em|rem|vw|vh|%)$/i } ).first();
		await unitButton.click();

		await this.page.waitForSelector( '[role="menu"]' );
		await this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } ).click();

		await this.page.waitForTimeout( TIMEOUTS.UNIT_CHANGE );
	}

	async setLetterSpacing( value: number, unit: string ): Promise<void> {
		await this.setSpacingValue( 'Letter spacing', value, unit );
	}

	async setWordSpacing( value: number, unit: string ): Promise<void> {
		await this.setSpacingValue( 'Word spacing', value, unit );
	}

	async setFontWeight( weight: string ): Promise<void> {
		const controlButton = this.page
			.locator( 'div.MuiGrid-container' )
			.filter( { has: this.page.locator( 'label', { hasText: 'Font weight' } ) } )
			.locator( '[role="button"]' );

		await controlButton.click();
		await this.page.waitForSelector( '[role="listbox"], [role="menu"], [role="option"]', { timeout: 5000 } );

		const option = this.page.getByRole( 'option', { name: weight, exact: true } );
		await option.click();
	}

	async setTextTransform( transform: string ): Promise<void> {
		const controlButton = this.page
			.locator( 'div.MuiGrid-container' )
			.filter( { has: this.page.locator( 'label', { hasText: 'Text transform' } ) } )
			.locator( '[role="button"]' );

		await controlButton.click();
		await this.page.waitForSelector( '[role="listbox"], [role="menu"], [role="option"]', { timeout: 5000 } );

		const option = this.page.getByRole( 'option', { name: transform, exact: true } );
		await option.click();
	}
}
