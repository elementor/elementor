import BasePage from '../base-page';



export default class TypographySettings extends BasePage {

	async setSpacingValue( labelText: string, value: number, unit: string ): Promise<void> {
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







	async waitForTypographyControls( timeout: number = 5000 ): Promise<void> {
		await this.page.waitForSelector( 'label:has-text("Font size"), label:has-text("Font family"), .MuiButtonBase-root', { timeout } );
	}



}
