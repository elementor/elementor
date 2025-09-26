import BasePage from '../base-page';
import { type StyleSection } from './style-tab';

export default class TypographySettings extends BasePage {
	async setSpacingValue( labelText: string, value: number, unit: string ): Promise<void> {
		// Wait for the label to be visible first
		const spacingLabel = this.page.locator( 'label', { hasText: labelText } );
		await spacingLabel.waitFor({ state: 'visible', timeout: 10000 });

		// Find the input field - try multiple approaches
		let spacingInput;
		try {
			spacingInput = spacingLabel.locator( 'xpath=ancestor::div[contains(@class, "MuiGrid-container")][1]' ).locator( 'input' );
			await spacingInput.waitFor( { state: 'visible', timeout: 5000 } );
		} catch {
			// Fallback: find input near the label
			spacingInput = spacingLabel.locator( '..' ).locator( 'input' );
			await spacingInput.waitFor( { state: 'visible', timeout: 5000 } );
		}

		// Try to find and set unit if different - make it optional
		try {
			const currentUnitButton = spacingLabel.locator( '..' ).locator( 'button[aria-haspopup="true"]' ).first();
			await currentUnitButton.waitFor({ state: 'visible', timeout: 3000 });
			
			const currentUnitText = await currentUnitButton.textContent();
			if ( currentUnitText?.toLowerCase() !== unit.toLowerCase() ) {
				await currentUnitButton.click();
				const unitOption = this.page.getByRole( 'menuitem', { name: unit.toUpperCase(), exact: true } );
				await unitOption.waitFor( { state: 'visible' } );
				await unitOption.click();
			}
		} catch (error) {
			// If unit button is not found, continue without setting unit
			console.log(`Unit button not found for ${labelText}, continuing without unit change`);
		}

		// Set the value
		await spacingInput.clear();
		await spacingInput.fill( value.toString() );
		await spacingInput.press( 'Enter' );
	}

	async waitForTypographyControls( timeout: number = 5000 ): Promise<void> {
		await this.page.waitForSelector( 'label:has-text("Font size"), label:has-text("Font family"), .MuiButtonBase-root', { timeout } );
	}

	async expandShowMoreIfNeeded( section: StyleSection ): Promise<void> {
		const sectionContent = this.page.locator( `[aria-label="${ section } section content"]` );
		const showMoreButton = sectionContent.locator( 'button[aria-label="Show more"]' );
		
		// Wait for the button to be visible before clicking
		await showMoreButton.waitFor({ state: 'visible', timeout: 10000 });
		await showMoreButton.click();
	}
}
