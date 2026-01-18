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

const SIZE_SECTION_LABELS = {
	WIDTH: 'Width',
	HEIGHT: 'Height',
	MIN_WIDTH: 'Min width',
	MIN_HEIGHT: 'Min height',
	MAX_WIDTH: 'Max width',
	MAX_HEIGHT: 'Max height',
};

const OFFSET_LABELS = {
	TOP: 'Top',
	RIGHT: 'Right',
	BOTTOM: 'Bottom',
	LEFT: 'Left',
};

const FONT_SIZE_LABELS = {
	LINE_HEIGHT: 'Line height',
	LETTER_SPACING: 'Letter spacing',
	WORD_SPACING: 'Word spacing',
	FONT_SIZE: 'Font size',
};

const BORDER_TYPE_LABELS = {
	NONE: 'None',
	SOLID: 'Solid',
	DASHED: 'Dashed',
	DOTTED: 'Dotted',
	DOUBLE: 'Double',
	GROOVE: 'Groove',
	RIDGE: 'Ridge',
	INSET: 'Inset',
	OUTSET: 'Outset',
};

export type StyleSection = typeof STYLE_SECTIONS[keyof typeof STYLE_SECTIONS];
type SizeLabel = typeof SIZE_SECTION_LABELS[keyof typeof SIZE_SECTION_LABELS];
type OffSetLabel = typeof OFFSET_LABELS[keyof typeof OFFSET_LABELS];
type Position= 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
type SizeValue = { size: number, unit?: Unit ; };
type FontProperty = typeof FONT_SIZE_LABELS[keyof typeof FONT_SIZE_LABELS];
type BorderTypeLabel = typeof BORDER_TYPE_LABELS[keyof typeof BORDER_TYPE_LABELS];

const UNIT_BUTTON_SELECTOR = 'input ~ .MuiInputAdornment-positionEnd button[aria-haspopup="true"]:not([aria-label])';

export default class StyleTab extends BasePage {
	protected async getInputByLabel( labelText: string ): Promise<Locator> {
		const input = this.page.locator( `[aria-label="${ labelText } control"]` ).locator( 'input' );
		await input.waitFor( { state: 'visible', timeout: 5000 } );
		return input;
	}

	protected async getUnitButtonByLabel( labelText: string ): Promise<Locator> {
		return this.page.locator( `[aria-label="${ labelText } control"]` )
			.locator( UNIT_BUTTON_SELECTOR )
			.first();
	}

	protected async changeUnit( unitButton: Locator, targetUnit: string, defaultUnit?: Unit ): Promise<void> {
		const currentUnitText = await unitButton.textContent();

		if ( currentUnitText?.toLowerCase() === targetUnit.toLowerCase() ) {
			return;
		}

		if ( defaultUnit && currentUnitText?.toLowerCase() === defaultUnit?.toLowerCase() ) {
			return;
		}

		await unitButton.click();
		const unitOption = this.page.getByRole( 'menuitem', { name: targetUnit.toUpperCase(), exact: true } );
		await unitOption.waitFor( { state: 'visible' } );
		await unitOption.click();
	}

	async clickShowMore( sectionName: StyleSection ): Promise<void> {
		const content = this.page.locator( `[aria-label="${ sectionName } section content"]` );
		const showMoreBtn = content.locator( '[aria-label="Show more"]' );

		const isShowMoreVisible = await showMoreBtn.isVisible().catch( () => false );
		if ( isShowMoreVisible ) {
			await showMoreBtn.click();
		}
	}

	async openSection( sectionId: StyleSection, expandAdvancedSection = true ): Promise<void> {
		const sectionButton = this.page.locator( '.MuiButtonBase-root', { hasText: new RegExp( sectionId, 'i' ) } );
		const contentSelector = await sectionButton.getAttribute( 'aria-controls' );
		const isContentVisible = await this.page.evaluate( ( selector ) => {
			return !! document.getElementById( selector );
		}, contentSelector );

		if ( isContentVisible ) {
			return;
		}

		await sectionButton.click();

		if ( expandAdvancedSection ) {
			await this.clickShowMore( sectionId );
		}
	}

	async closeSection( sectionId: StyleSection, closeAdvancedSection = true ): Promise<void> {
		const sectionButton = this.page.locator( '.MuiButtonBase-root', { hasText: new RegExp( sectionId, 'i' ) } );
		const contentSelector = await sectionButton.getAttribute( 'aria-controls' );
		const isContentVisible = await this.page.evaluate( ( selector ) => {
			return !! document.getElementById( selector );
		}, contentSelector );

		if ( ! isContentVisible ) {
			return;
		}

		if ( closeAdvancedSection ) {
			await this.clickShowMore( sectionId );
		}

		await sectionButton.click();
	}

	async setSpacingValue( space: 'Margin' | 'Padding', property: OffSetLabel, value: number, unit: Unit, linked: boolean = true ): Promise<void> {
		await this.openSection( 'Spacing' );

		const nth = [ 'Margin', 'Padding' ].indexOf( space );
		const linkButton = this.page.locator( 'label', { hasText: space } )
			.locator( '..' )
			.locator( 'button' );
		const controlsSection = linkButton.locator( '../..' );
		const isLinked = 'true' === await linkButton.getAttribute( 'aria-pressed' );

		if ( isLinked !== linked ) {
			await linkButton.click();
		}

		const control = controlsSection.locator( 'label', { hasText: property } ).nth( nth ).locator( '../../..' );
		const input = control.locator( 'input' );
		const unitSelect = control.locator( UNIT_BUTTON_SELECTOR );

		await input.fill( value.toString() );
		await this.changeUnit( unitSelect, unit );
	}

	async setSizeSectionValue( property: SizeLabel, value: number, unit: Unit ) {
		const propertyRegex = new RegExp( `^${ property }$`, 'i' );
		const sectionToggler = this.page.locator( '[aria-label="Size section"]' );
		const controlsSection = sectionToggler.locator( '~ .MuiCollapse-root' );
		const control = controlsSection.locator( 'label', { hasText: propertyRegex } ).locator( '../../..' );
		const input = control.locator( 'input' );
		const unitSelect = control.locator( UNIT_BUTTON_SELECTOR );

		await this.openSection( 'Size' );
		await input.fill( value.toString() );
		await this.changeUnit( unitSelect, unit );
	}

	async setPositionValue( position: Position, offsets: Partial< Record< OffSetLabel, SizeValue > > = {}, options: {
		zIndex?: number | typeof NaN;
		offset?: SizeValue;
	} = {} ) {
		const sectionContent = this.page.locator( '[aria-label="Position section content"]' );

		await this.openSection( 'Position' );
		await sectionContent.locator( '[aria-label="Position control"] .MuiSelect-select[role="combobox"]' ).click();
		await this.page.locator( `li[data-value="${ position }"]` ).click();

		if ( 'static' === position ) {
			return;
		}

		for ( const [ key, { size, unit } ] of Object.entries( offsets ) ) {
			const sizeControl = this.page.locator( '[aria-label="Position section content"] label', { hasText: key } ).locator( '../../..' );
			const input = sizeControl.locator( 'input' );
			const unitSelect = sizeControl.locator( UNIT_BUTTON_SELECTOR );

			await input.fill( size.toString() );
			await this.changeUnit( unitSelect, unit );
		}

		if ( ! Number.isNaN( options?.zIndex ?? NaN ) ) {
			const zIndexControl = this.page.locator( '[aria-label="Position section content"] label', { hasText: 'Z-index' } ).locator( '../../..' );
			const input = zIndexControl.locator( 'input' );

			await input.fill( options.zIndex.toString() );
		}

		if ( options?.offset ) {
			const offsetControl = this.page.locator( '[aria-label="Position section content"] label', { hasText: 'Offset' } ).locator( '../../..' );
			const input = offsetControl.locator( 'input' );
			const unitSelect = offsetControl.locator( UNIT_BUTTON_SELECTOR );

			await input.fill( options.offset.size.toString() );
			await this.changeUnit( unitSelect, options.offset.unit );
		}
	}

	async setTypographySizeValue( labelText: string, value: number, unit: Unit ): Promise<void> {
		const spacingInput = await this.getInputByLabel( labelText );
		const unitButton = await this.getUnitButtonByLabel( labelText );

		await this.changeUnit( unitButton, unit );
		await spacingInput.fill( value.toString() );
	}

	async setFontFamily( fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		const categorySelector = 'google' === fontType ? 'Google Fonts' : 'System';

		await this.openSection( 'Typography' );
		this.page.getByRole( 'button', { name: 'Font family' } ).click();
		this.page.locator( '.MuiListSubheader-root', { hasText: new RegExp( categorySelector, 'i' ) } ).click();
		this.page.locator( 'input[placeholder="Search"]' ).fill( fontName );
		await this.page.waitForTimeout( timeouts.short );
		this.page.locator( '[role="option"]', { hasText: fontName } ).first().click();
	}

	async setFontColor( color: string ): Promise<void> {
		await this.openSection( 'Typography' );
		await this.page.locator( '[aria-label="Text color control"] input' ).fill( color );
	}

	async setFontSectionSize( property: FontProperty, lineHeight: number, unit: Unit, defaultUnit?: Unit ) {
		const control = this.page.locator( `[aria-label="${ property } control"]` );
		const input = control.locator( 'input' );

		await this.changeUnit( control.locator( UNIT_BUTTON_SELECTOR ), unit, defaultUnit );
		await input.fill( lineHeight.toString() );
		await input.blur();
	}

	async setFontSize( size: number, unit: Unit ) {
		this.setFontSectionSize( 'Font size', size, unit );
	}

	async setLetterSpacing( spacing: number, unit: Unit ) {
		this.setFontSectionSize( 'Letter spacing', spacing, unit );
	}

	async setWordSpacing( spacing: number, unit: Unit ) {
		this.setFontSectionSize( 'Word spacing', spacing, unit );
	}

	async setLineHeight( lineHeight: number, unit: Unit ) {
		this.setFontSectionSize( 'Line height', lineHeight, unit );
	}

	async setFontWeight( weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 ): Promise<void> {
		await this.page.locator( '[aria-label="Font weight control"] .MuiSelect-select[role="combobox"]' ).click();
		await this.page.locator( `li[data-value="${ weight }"]` ).click();
	}

	async setBackgroundColor( color: string ): Promise<void> {
		const sectionContent = this.page.locator( '[aria-label="Background section content"]' );

		await this.openSection( 'Background' );
		await sectionContent.locator( 'label', { hasText: 'Color' } ).locator( '../../..' ).locator( 'input' ).fill( color );
	}

	async setBorderWidth( width: number, unit: Unit ) {
		const sectionContent = this.page.locator( '[aria-label="Border section content"]' );
		const control = sectionContent.locator( 'label', { hasText: 'Border width' } ).locator( '../../..' );

		await this.openSection( 'Border' );
		await control.locator( 'input' ).fill( width.toString() );
		await this.changeUnit( control.locator( UNIT_BUTTON_SELECTOR ), unit, 'px' );
	}

	async setBorderRadius( radius: number, unit: Unit ) {
		const sectionContent = this.page.locator( '[aria-label="Border section content"]' );
		const control = sectionContent.locator( 'label', { hasText: 'Border radius' } ).locator( '../../..' );

		await this.openSection( 'Border' );
		await control.locator( 'input' ).fill( radius.toString() );
		await this.changeUnit( control.locator( UNIT_BUTTON_SELECTOR ).first(), unit, 'px' );
	}

	async setBorderColor( color: string ) {
		const sectionContent = this.page.locator( '[aria-label="Border section content"]' );
		const control = sectionContent.locator( 'label', { hasText: 'Border color' } ).locator( '../../..' );

		await this.openSection( 'Border' );
		await control.locator( 'input' ).fill( color );
	}

	async setBorderType( border: BorderTypeLabel ) {
		const sectionContent = this.page.locator( '[aria-label="Border section content"]' );

		await this.openSection( 'Border' );
		await sectionContent.locator( '[aria-label="Border type control"] .MuiSelect-select[role="combobox"]' ).click();
		await this.page.locator( `li[data-value="${ border }"]` ).click();
	}

	async addGlobalClass( className: string ): Promise<void> {
		await this.page.locator( 'label', { hasText: 'Classes' } ).locator( '../..' ).locator( 'input' ).fill( className );
		await this.page.keyboard.press( 'Enter' );
	}

	async removeGlobalClass( className: string ): Promise<void> {
		const classesSection = this.page.locator( 'label', { hasText: 'Classes' } ).locator( '../..' );
		const classChip = classesSection.locator( `[aria-label="Edit ${ className }"]` );
		const menuItem = classChip.locator( '[role="button"]' ).nth( 1 );

		await menuItem.click();
		await this.page.locator( 'li[role="menuitem"] span', { hasText: 'Remove' } ).click();
	}
}
