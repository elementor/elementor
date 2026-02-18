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

const DISPLAY_VALUES = {
	BLOCK: 'block',
	FLEX: 'flex',
	INLINE_BLOCK: 'inline-block',
	NONE: 'none',
	INLINE_FLEX: 'inline-flex',
};

export type StyleSection = typeof STYLE_SECTIONS[keyof typeof STYLE_SECTIONS];
type SizeLabel = typeof SIZE_SECTION_LABELS[keyof typeof SIZE_SECTION_LABELS];
type OffSetLabel = typeof OFFSET_LABELS[keyof typeof OFFSET_LABELS];
type Position= 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
type SizeValue = { size: number, unit?: Unit ; };
type FontProperty = typeof FONT_SIZE_LABELS[keyof typeof FONT_SIZE_LABELS];
type BorderTypeLabel = typeof BORDER_TYPE_LABELS[keyof typeof BORDER_TYPE_LABELS];
type DisplayValue = typeof DISPLAY_VALUES[keyof typeof DISPLAY_VALUES];
type DisplayOptions = {
	[DISPLAY_VALUES.FLEX]?: {
		flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
		flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
		justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
		alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
	};
};

const FLEX_DISPLAY_OPTIONS: Record<keyof DisplayOptions[typeof DISPLAY_VALUES.FLEX], string> = {
	flexDirection: 'direction',
	flexWrap: 'flex wrap',
	justifyContent: 'justify content',
	alignItems: 'align items',
};

const UNIT_BUTTON_SELECTOR = 'input ~ .MuiInputAdornment-positionEnd button[aria-haspopup="true"]:not([aria-label])';

export default class StyleTab extends BasePage {
	async getSectionContentByLabel( label: StyleSection ): Promise<Locator> {
		return this.page.locator( `[aria-label="${ label } section content"]` );
	}

	async getControlByLabel( sectionLabel: StyleSection, labelText: string, options?: { nth?: number, innerSelector?: string, nestingLevel?: number } ): Promise<Locator> {
		const labelRegex = new RegExp( `^${ labelText }$`, 'i' );
		const nesting = new Array( options?.nestingLevel ?? 3 ).fill( '..' );
		const section = await this.getSectionContentByLabel( sectionLabel );
		const control = section.locator( 'label', { hasText: labelRegex } ).nth( options?.nth ?? 0 ).locator( nesting.join( '/' ) );

		return options?.innerSelector ? control.locator( options.innerSelector ) : control;
	}

	async changeSizeControl( controlLocator: Locator, value: number, unit?: Unit ): Promise<void> {
		const input = controlLocator.locator( 'input' );
		const unitSelect = controlLocator.locator( UNIT_BUTTON_SELECTOR );

		if ( unit ) {
			await this.changeUnit( unitSelect, unit );
		}

		await input.fill( value.toString() );
	}

	protected async changeUnit( unitButton: Locator, targetUnit: string ): Promise<void> {
		const currentUnitText = await unitButton.textContent();

		if ( currentUnitText?.toLowerCase() === targetUnit.toLowerCase() ) {
			return;
		}

		const unitOption = this.page.getByRole( 'menuitem', { name: targetUnit.toUpperCase(), exact: true } );

		await unitButton.click();
		await this.page.locator( '[role="presentation"] .MuiList-root' ).waitFor();
		await unitOption.waitFor( { state: 'visible' } );
		await unitOption.click();
	}

	async getSelectControlByLabel( sectionLabel: StyleSection, labelText: string ): Promise<Locator> {
		const sectionContent = await this.getSectionContentByLabel( sectionLabel );

		return sectionContent.locator( `[aria-label="${ labelText } control"] .MuiSelect-select[role="combobox"]` );
	}

	async changeSelectControl( controlLocator: Locator, value: string ): Promise<void> {
		await controlLocator.click();
		await this.page.locator( `li[data-value="${ value }"]` ).click();
	}

	async changeButtonGroupControl( controlLocator: Locator, value: string ): Promise<void> {
		const button = controlLocator.locator( `button[value="${ value }"]` );
		const buttonClasses = await button.getAttribute( 'class' );
		const isActive = buttonClasses?.includes( 'Mui-selected' );

		if ( isActive ) {
			return;
		}

		await button.click();
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

	async closeSection( sectionId: StyleSection ): Promise<void> {
		const sectionButton = this.page.locator( '.MuiButtonBase-root', { hasText: new RegExp( sectionId, 'i' ) } );
		const contentSelector = await sectionButton.getAttribute( 'aria-controls' );
		const isContentVisible = await this.page.evaluate( ( selector ) => {
			return !! document.getElementById( selector );
		}, contentSelector );

		if ( ! isContentVisible ) {
			return;
		}

		await sectionButton.click();
	}

	async setSpacingSectionValue( property: 'Margin' | 'Padding', offsetLabel: OffSetLabel, value: number, unit: Unit, linked: boolean = true ): Promise<void> {
		const controlIndex = [ 'Margin', 'Padding' ].indexOf( property );
		const linkButton = this.page.locator( 'label', { hasText: property } )
			.locator( '..' )
			.locator( 'button' );
		const isLinked = 'true' === await linkButton.getAttribute( 'aria-pressed' );

		if ( isLinked !== linked ) {
			await linkButton.click();
		}

		const control = await this.getControlByLabel( 'Spacing', offsetLabel, { nth: controlIndex } );

		await this.changeSizeControl( control, value, unit );
	}

	async setSizeSectionValue( property: SizeLabel, value: number, unit: Unit ) {
		const control = await this.getControlByLabel( 'Size', property );

		await this.changeSizeControl( control, value, unit );
	}

	async setPositionSectionValue( position: Position, offsets: Partial< Record< OffSetLabel, SizeValue > > = {}, options: {
		zIndex?: number | typeof NaN;
		offset?: SizeValue;
	} = {} ) {
		const control = await this.getSelectControlByLabel( 'Position', 'Position' );

		await this.changeSelectControl( control, position );

		if ( 'static' === position ) {
			return;
		}

		for ( const [ key, { size, unit } ] of Object.entries( offsets ) ) {
			const sizeControl = await this.getControlByLabel( 'Position', key );

			await this.changeSizeControl( sizeControl, size, unit );
		}

		if ( ! Number.isNaN( options?.zIndex ?? NaN ) ) {
			const zIndexControl = await this.getControlByLabel( 'Position', 'Z-index' );

			await this.changeSizeControl( zIndexControl, options.zIndex );
		}

		if ( options?.offset ) {
			const offsetControl = await this.getControlByLabel( 'Position', 'Offset' );

			await this.changeSizeControl( offsetControl, options.offset.size, options.offset.unit );
		}
	}

	async setFontFamily( fontName: string, fontType: 'system' | 'google' = 'system' ): Promise<void> {
		const categorySelector = 'google' === fontType ? 'Google Fonts' : 'System';

		await this.page.getByRole( 'button', { name: 'Font family' } ).click();
		await this.page.locator( '.MuiListSubheader-root', { hasText: new RegExp( categorySelector, 'i' ) } ).click();
		await this.page.locator( 'input[placeholder="Search"]' ).fill( fontName );
		await this.page.waitForTimeout( timeouts.short );
		await this.page.locator( '[role="option"]', { hasText: fontName } ).first().click();
	}

	async setFontColor( color: string ): Promise<void> {
		await this.page.locator( '[aria-label="Text color control"] input' ).fill( color );
	}

	async setTypographySectionSizeBasedValue( property: FontProperty, size: number, unit: Unit ) {
		const control = await this.getControlByLabel( 'Typography', property );

		await this.changeSizeControl( control, size, unit );
	}

	setFontSize( size: number, unit: Unit ) {
		return this.setTypographySectionSizeBasedValue( 'Font size', size, unit );
	}

	setLetterSpacing( size: number, unit: Unit ) {
		return this.setTypographySectionSizeBasedValue( 'Letter spacing', size, unit );
	}

	setWordSpacing( size: number, unit: Unit ) {
		return this.setTypographySectionSizeBasedValue( 'Word spacing', size, unit );
	}

	setLineHeight( size: number, unit: Unit ) {
		return this.setTypographySectionSizeBasedValue( 'Line height', size, unit );
	}

	async setFontWeight( weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 ): Promise<void> {
		const control = await this.getSelectControlByLabel( 'Typography', 'Font weight' );

		await this.changeSelectControl( control, weight.toString() );
	}

	async setBackgroundColor( color: string ): Promise<void> {
		const input = await this.getControlByLabel( 'Background', 'Color', { innerSelector: 'input' } );

		await input.clear();
		await input.fill( color );
		await input.blur();
	}

	async setBorderWidth( width: number, unit: Unit ) {
		const control = await this.getControlByLabel( 'Border', 'Border width' );

		await this.changeSizeControl( control, width, unit );
	}

	async setBorderRadius( radius: number, unit: Unit ) {
		const control = await this.getControlByLabel( 'Border', 'Border radius' );

		await this.changeSizeControl( control, radius, unit );
	}

	async setBorderColor( color: string ) {
		const input = await this.getControlByLabel( 'Border', 'Border color', { innerSelector: 'input' } );

		await input.clear();
		await input.fill( color );
		await input.blur();
	}

	async setBorderType( border: BorderTypeLabel ) {
		const control = await this.getSelectControlByLabel( 'Border', 'Border type' );

		await this.changeSelectControl( control, border );
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

	async selectClassState( state: 'normal'|'active'|'hover'|'focus', target: string = 'local' ) {
		const stateRegex = new RegExp( state, 'i' );
		const classesSection = this.page.locator( 'label', { hasText: 'Classes' } ).locator( '../..' );
		const classChip = classesSection.locator( `[aria-label="Edit ${ target }"]` );
		const menuTrigger = classChip.locator( '[aria-label="Open CSS Class Menu"]' );
		const menuItem = this.page.locator( 'li[role="menuitem"]', { hasText: stateRegex } );

		await menuTrigger.click();
		await menuItem.waitFor( { state: 'visible' } );
		await menuItem.click();
	}

	async setLayoutSectionValue<T extends DisplayValue >( display: T, options?: DisplayOptions[T]	 ) {
		const control = await this.getControlByLabel( 'Layout', 'display', { nestingLevel: 2 } );

		await this.changeButtonGroupControl( control, display );

		if ( 'flex' === display ) {
			for ( const [ key, value ] of Object.entries( options ?? {} ) ) {
				const flexControls = await this.getControlByLabel( 'Layout', FLEX_DISPLAY_OPTIONS[ key as keyof typeof FLEX_DISPLAY_OPTIONS ] );

				await this.changeButtonGroupControl( flexControls, value );
			}
		}
	}
}
