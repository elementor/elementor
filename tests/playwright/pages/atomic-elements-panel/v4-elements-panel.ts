import BasePage from '../base-page';
import { type Page, type TestInfo } from '@playwright/test';

interface TypographyOptions {
	fontFamily?: string;
	fontSize?: string;
	fontWeight?: string;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	lineHeight?: string;
	letterSpacing?: string;
	textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
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

	async setTypography( options: TypographyOptions ): Promise<void> {
		if ( options.fontSize ) {
			const fontSizeInput = this.page.locator( 'label', { hasText: 'Font size' } ).locator( 'xpath=following::input[1]' );
			await fontSizeInput.fill( options.fontSize );
			await fontSizeInput.dispatchEvent( 'input' );
		}

		if ( options.fontWeight ) {
			await this.setV4SelectControlValue( 'Font weight', options.fontWeight );
		}

		if ( options.fontFamily ) {
			await this.setFontFamily( options.fontFamily );
		}

		if ( options.textAlign ) {
			await this.setTextAlignment( options.textAlign );
		}

		if ( options.lineHeight ) {
			const lineHeightInput = this.page.locator( 'label', { hasText: 'Line height' } ).locator( 'xpath=following::input[1]' );
			if ( await lineHeightInput.isVisible() ) {
				await lineHeightInput.fill( options.lineHeight );
				await lineHeightInput.dispatchEvent( 'input' );
			}
		}

		if ( options.letterSpacing ) {
			const letterSpacingInput = this.page.locator( 'label', { hasText: 'Letter spacing' } ).locator( 'xpath=following::input[1]' );
			if ( await letterSpacingInput.isVisible() ) {
				await letterSpacingInput.fill( options.letterSpacing );
				await letterSpacingInput.dispatchEvent( 'input' );
			}
		}

		if ( options.textTransform ) {
			await this.setV4SelectControlValue( 'Text transform', options.textTransform );
		}
	}

	async setFontFamily( fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		const fontFamilyButton = this.page.locator( 'div.MuiGrid-container' ).filter( {
			has: this.page.locator( 'label', { hasText: 'Font family' } ),
		} ).locator( '[role="button"]' );

		await fontFamilyButton.click();

		// Wait for the popup to be visible
		await this.page.waitForSelector( '.MuiPopover-paper', { state: 'visible' } );

		if ( 'google' === fontType ) {
			await this.page.locator( '.MuiListSubheader-root', { hasText: 'Google Fonts' } ).click();
			await this.page.waitForTimeout( 2000 );
		} else {
			await this.page.locator( '.MuiListSubheader-root', { hasText: 'System' } ).click();
		}

		const fontOption = this.page.locator( '[role="option"]', { hasText: fontName } ).first();
		await fontOption.click();
	}

	async setTextAlignment( alignment: 'left' | 'center' | 'right' | 'justify' ): Promise<void> {
		const alignmentButton = this.page.locator( `[aria-label*="${ alignment }"], [title*="${ alignment }"], button[value="${ alignment }"]` ).first();

		if ( await alignmentButton.isVisible() ) {
			await alignmentButton.click();
		} else {
			const alignmentControls = this.page.locator( '[role="radiogroup"], .alignment-controls, [aria-label*="align"]' );
			if ( await alignmentControls.isVisible() ) {
				const specificAlignment = alignmentControls.locator( `[aria-label*="${ alignment }"], [title*="${ alignment }"]` ).first();
				if ( await specificAlignment.isVisible() ) {
					await specificAlignment.click();
				}
			}
		}
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

	/**
	 * Waits for typography controls to be ready
	 * @param {number} timeout - Optional. The timeout in milliseconds. Default is 5000.
	 */
	async waitForTypographyControls( timeout: number = 5000 ): Promise<void> {
		await this.page.waitForSelector( 'label:has-text("Font size"), label:has-text("Font family"), .MuiButtonBase-root', { timeout } );
	}

	async setFontSizeUnit( unit: string ): Promise<void> {
		const unitButton = this.page.getByRole( 'button', { name: /^(px|em|rem|vw|vh|%)$/i } ).first();
		await unitButton.click();

		await this.page.waitForSelector( '[role="menu"]' );
		await this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } ).click();

		// Wait for the unit change to be applied
		await this.page.waitForTimeout( 1000 );
	}

	async setLetterSpacing( value: number, unit: string ): Promise<void> {
		// Wait for typography section to be ready
		await this.waitForTypographyControls();

		// Click "Show More" button if it exists and is visible
		const showMoreButton = this.page.getByRole( 'button', { name: 'Show More' } );
		if ( await showMoreButton.isVisible() ) {
			await showMoreButton.click();
			// Wait for animation
			await this.page.waitForTimeout( 500 );
		}

		// Locate letter spacing input by label
		const letterSpacingLabel = this.page.locator( 'label', { hasText: 'Letter spacing' } );
		const letterSpacingContainer = letterSpacingLabel.locator( 'xpath=ancestor::div[contains(@class, "MuiGrid-container")][1]' );
		const letterSpacingInput = letterSpacingContainer.locator( 'input' );
		await letterSpacingInput.waitFor( { state: 'visible', timeout: 5000 } );

		// Only change unit if it's different from current unit
		const currentUnitButton = letterSpacingContainer.locator( 'button[aria-haspopup="true"]' ).first();
		const currentUnitText = await currentUnitButton.textContent();

		if ( currentUnitText?.toLowerCase() !== unit.toLowerCase() ) {
			await currentUnitButton.click();

			// Wait for and click the unit option
			const unitOption = this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } );
			await unitOption.waitFor( { state: 'visible' } );
			await unitOption.click();

			// Wait for the unit change to be applied
			await this.page.waitForTimeout( 500 );
		}

		// Set the value
		await letterSpacingInput.clear();
		await letterSpacingInput.fill( value.toString() );
		await letterSpacingInput.press( 'Enter' );

		// Wait for changes to be applied
		await this.page.waitForTimeout( 500 );
	}

	async setWordSpacing( value: number, unit: string ): Promise<void> {
		// Wait for typography section to be ready
		await this.waitForTypographyControls();

		// Click "Show More" button if it exists and is visible
		const showMoreButton = this.page.getByRole( 'button', { name: 'Show More' } );
		if ( await showMoreButton.isVisible() ) {
			await showMoreButton.click();
			// Wait for animation
			await this.page.waitForTimeout( 500 );
		}

		// Locate word spacing input by label
		const wordSpacingLabel = this.page.locator( 'label', { hasText: 'Word spacing' } );
		const wordSpacingContainer = wordSpacingLabel.locator( 'xpath=ancestor::div[contains(@class, "MuiGrid-container")][1]' );
		const wordSpacingInput = wordSpacingContainer.locator( 'input' );
		await wordSpacingInput.waitFor( { state: 'visible', timeout: 5000 } );

		// Only change unit if it's different from current unit
		const currentUnitButton = wordSpacingContainer.locator( 'button[aria-haspopup="true"]' ).first();
		const currentUnitText = await currentUnitButton.textContent();

		if ( currentUnitText?.toLowerCase() !== unit.toLowerCase() ) {
			await currentUnitButton.click();

			// Wait for and click the unit option
			const unitOption = this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } );
			await unitOption.waitFor( { state: 'visible' } );
			await unitOption.click();

			// Wait for the unit change to be applied
			await this.page.waitForTimeout( 500 );
		}

		// Set the value
		await wordSpacingInput.fill( value.toString() );
		await wordSpacingInput.press( 'Enter' );

		// Wait for changes to be applied
		await this.page.waitForTimeout( 500 );
	}

	async setWidgetText( text: string ): Promise<void> {
		// Wait for the panel to be ready
		await this.page.waitForTimeout( 1000 );

		// Click the Content tab if not already active
		const contentTab = this.page.getByRole( 'button', { name: ' Content' } );
		await contentTab.click();

		// Wait for the panel to update
		await this.page.waitForTimeout( 500 );

		// Try to find the text input field based on widget type
		const textInputs = [
			this.page.getByRole( 'textbox', { name: 'Title' } ),
			this.page.getByRole( 'textbox', { name: 'Text' } ),
			this.page.getByRole( 'textbox', { name: 'Button text' } ),
		];

		// Try each input field until we find one that's visible
		for ( const input of textInputs ) {
			if ( await input.isVisible() ) {
				await input.fill( text );
				await input.press( 'Enter' );
				return;
			}
		}

		throw new Error( 'No text input field found' );
	}
}
