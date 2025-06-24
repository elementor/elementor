import BasePage from '../base-page';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { timeouts } from '../../config/timeouts';

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
				await inputLocator.dispatchEvent( 'input' ); // Ensure value is triggered
			}
		}

		if ( options.overflow ) {
			await this.page.locator( `button[value="${ options.overflow }"]` ).click();
		}
	}

	async isV4SectionOpen( sectionName: string ): Promise<boolean> {
		const sectionButton = this.page.locator( '.MuiButtonBase-root', { hasText: new RegExp( sectionName, 'i' ) } );
		const contentSelector = await sectionButton.getAttribute( 'aria-controls' );
		return await this.page.evaluate( ( selector ) => {
			return !! document.getElementById( selector );
		}, contentSelector );
	}

	async verifyV4SectionsOpen( sectionNames: string[] ): Promise<void> {
		for ( const section of sectionNames ) {
			const isOpen = await this.isV4SectionOpen( section );
			expect( isOpen ).toBe( true );
		}
	}

	async openV4Sections( sectionNames: string[] ): Promise<void> {
		for ( const section of sectionNames ) {
			await this.openV4Section( section as 'layout' | 'spacing' | 'size' | 'position' | 'typography' | 'background' | 'border' );
		}
	}

	async openV4Section( sectionId: 'layout' | 'spacing' | 'size' | 'position' | 'typography' | 'background' | 'border' ): Promise<void> {
		const sectionButton = this.page.locator( '.MuiButtonBase-root', { hasText: new RegExp( sectionId, 'i' ) } );
		const contentSelector = await sectionButton.getAttribute( 'aria-controls' );
		const isContentVisible = await this.page.evaluate( ( selector ) => {
			return !! document.getElementById( selector );
		}, contentSelector );

		if ( isContentVisible ) {
			return;
		}

		await sectionButton.click();
	}

	async openScrollableV4StylePanel( options: {
		sectionsToOpen?: ( 'layout' | 'spacing' | 'size' | 'position' | 'typography' | 'background' | 'border' )[],
		waitForSelector?: string,
	} = {} ): Promise<void> {
		const {
			sectionsToOpen = [ 'size', 'typography' ],
			waitForSelector = 'label:has-text("Font family")',
		} = options;

		const panel = this.page.locator( '#elementor-panel-category-v4-elements' );
		await panel.isVisible();

		await this.openV4PanelTab( 'style' );

		for ( const section of sectionsToOpen ) {
			await this.openV4Section( section );
		}

		if ( waitForSelector ) {
			await this.page.waitForSelector( waitForSelector, { timeout: timeouts.action } );
		}
	}

	async interactWithFontFamilyDropdown(): Promise<void> {
		const STABILITY_WAIT = 500;

		const fontFamilyContainer = this.page.locator( 'div.MuiGrid-container' ).filter( {
			has: this.page.locator( 'label', { hasText: 'Font family' } ),
		} );

		await fontFamilyContainer.waitFor( { state: 'visible', timeout: timeouts.longAction } );

		const fontFamilyButton = fontFamilyContainer.locator( '[role="button"]' );
		await fontFamilyButton.waitFor( { state: 'visible', timeout: timeouts.longAction } );

		// Ensure the button is stable before clicking
		await fontFamilyButton.hover();
		await this.page.waitForTimeout( STABILITY_WAIT );

		await fontFamilyButton.click( { timeout: timeouts.longAction } );

		// Wait for the dropdown to open and Google Fonts option to be available
		const googleFontsOption = this.page.getByText( 'Google Fonts' );
		await googleFontsOption.waitFor( { state: 'visible', timeout: timeouts.longAction } );
		await googleFontsOption.scrollIntoViewIfNeeded();
	}

	async openV4PanelTab( sectionName: 'style' | 'general' ): Promise<void> {
		const selectorMap: Record< 'style' | 'general', string > = {
			style: 'style',
			general: 'settings',
		};
		const sectionButtonSelector = `#tab-0-${ selectorMap[ sectionName ] }`,
			sectionContentSelector = `#tabpanel-0-${ selectorMap[ sectionName ] }`,
			isOpenSection = await this.page.evaluate( ( selector ) => {
				const sectionContentElement: HTMLElement = document.querySelector( selector );

				return ! sectionContentElement?.hidden;
			}, sectionContentSelector );

		if ( isOpenSection ) {
			return;
		}

		await this.page.locator( sectionButtonSelector ).click();
		await this.page.locator( sectionContentSelector ).waitFor();
	}
}
