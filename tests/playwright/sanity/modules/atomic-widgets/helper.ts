import EditorPage from '../../../pages/editor-page';
import { Page, Locator } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

type ElementType = 'e-button' | 'e-divider' | 'e-heading' | 'e-image' | 'e-paragraph' | 'e-svg' | 'e-tabs' | 'e-youtube' | '' |'e-div-block' | 'e-flexbox';

const LINK_TOGGLE_BUTTON_PLUS_SIGN_PATH = 'M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z';

export class AtomicHelper {
	readonly page: Page;
	readonly editor: EditorPage;
	readonly wpAdmin: WpAdminPage;

	constructor( page: Page, editor: EditorPage, wpAdmin: WpAdminPage ) {
		this.page = page;
		this.editor = editor;
		this.wpAdmin = wpAdmin;
	}

	async setLinkControl( config: { toggleMode?: boolean; value?: string; isTargetBlank?: boolean; } = {} ) {
		const {
			value = '',
			isTargetBlank = false,
		} = config;
		const toggleMode = config.toggleMode ?? !! value;

		const linkSectionSelector = '.MuiStack-root:has(> .MuiStack-root > *[aria-label="Toggle link"])';
		const toggleLinkButtonSelector = linkSectionSelector + ' *[aria-label="Toggle link"]';

		await this.page.waitForTimeout( 1000 );
		await this.page.waitForSelector( linkSectionSelector, { state: 'visible', timeout: 10000 } );

		const linkSection = this.page.locator( linkSectionSelector );

		await this.page.waitForTimeout( 1000 );
		await this.page.waitForSelector( toggleLinkButtonSelector, { state: 'visible', timeout: 10000 } );

		const linkToggleButton = linkSection.locator( toggleLinkButtonSelector );

		const isToggled = await this.isLinkToggleButtonEnabled( linkToggleButton );

		if ( isToggled !== toggleMode ) {
			await linkToggleButton.click();
		}

		if ( ! toggleMode ) {
			return;
		}

		const linkInputSelector = linkSectionSelector + ' .MuiAutocomplete-root input';
		const clearButtonSelector = linkSectionSelector + ' .MuiAutocomplete-root .MuiIconButton-root';
		const newTabSwitchSelector = linkSectionSelector + ' .MuiSwitch-input';

		await this.page.waitForTimeout( 1000 );
		await this.page.waitForSelector( linkInputSelector, { state: 'visible', timeout: 10000 } );

		const linkInput = linkSection.locator( linkInputSelector );
		const clearButton = linkSection.locator( clearButtonSelector );

		if ( await clearButton.isVisible() ) {
			await clearButton.click();
		}

		const newTabSwitch = linkSection.locator( newTabSwitchSelector );
		const isTargetBlankSelected = await newTabSwitch.isChecked();

		if ( isTargetBlankSelected !== isTargetBlank ) {
			await newTabSwitch.click();
		}

		await linkInput.fill( value );
	}

	async setHtmlTagControl( tag: 'div' | 'header' | 'section' | 'article' | 'aside' | 'footer' ) {
		await this.editor.openV2PanelTab( 'general' );

		const htmlTagControl = await this.getHtmlTagControl();
		const optionSelector = `li[data-value="${ tag }"]`;

		await htmlTagControl.click();
		await this.page.waitForTimeout( 1000 );
		await this.page.waitForSelector( optionSelector, { state: 'visible', timeout: 10000 } );

		const option = this.page.locator( optionSelector );

		await option.click();
		await this.page.waitForTimeout( 1000 );
		await this.page.waitForSelector( optionSelector, { state: 'detached', timeout: 10000 } );
	}

	async getHtmlTagControl( shouldTargetDisabled: boolean = false ) {
		const selector = `.MuiBox-root:has(> label:text-matches("Tag", "i")) .MuiSelect-select${ shouldTargetDisabled ? '.Mui-disabled' : ':not(.Mui-disabled)' }`;

		await this.page.waitForTimeout( 1000 );
		await this.page.waitForSelector( selector, { state: 'visible', timeout: 10000 } );

		return this.page.locator( selector );
	}

	async addAtomicElement( elementType: ElementType, container: string = 'document' ) {
		return await this.editor.addElement( { elType: elementType }, container );
	}

	async isLinkToggleButtonEnabled( button: Locator ) {
		return LINK_TOGGLE_BUTTON_PLUS_SIGN_PATH !== ( await button.locator( 'path' ).first().getAttribute( 'd' ) );
	}
}
