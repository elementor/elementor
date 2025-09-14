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

	async setLinkControl( config: { toggleMode?: boolean; value?: string; isTargetBlank?: boolean; } ) {
		const {
			toggleMode = true,
			value = '',
			isTargetBlank = false,
		} = config;

		const linkSection = this.page.locator( '.MuiStack-root:has(>.MuiStack-root > [aria-label="Toggle link"])' );

		await linkSection.waitFor();
		const linkToggleButton = linkSection.locator( '[aria-label="Toggle link"]' );

		await linkToggleButton.waitFor();

		const isToggled = await this.isLinkToggleButtonEnabled( linkToggleButton );

		if ( isToggled !== toggleMode ) {
			await linkToggleButton.waitFor();
			await linkToggleButton.click();
		}

		if ( ! toggleMode ) {
			return;
		}

		const linkInput = linkSection.locator( '.MuiAutocomplete-root input' );
		const clearButton = linkSection.locator( '.MuiAutocomplete-root .MuiIconButton-root' );

		await linkInput.waitFor();

		if ( await clearButton.isVisible() ) {
			await clearButton.click();
		}

		const newTabSwitch = linkSection.locator( '.MuiSwitch-input' );
		const isTargetBlankSelected = await newTabSwitch.isChecked();

		if ( isTargetBlankSelected !== isTargetBlank ) {
			await newTabSwitch.click();
		}

		await linkInput.fill( value );
	}

	async setHtmlTagControl( tag: 'div' | 'header' | 'section' | 'article' | 'aside' | 'footer' ) {
		await this.editor.openV2PanelTab( 'general' );

		const htmlTagControl = this.getHtmlTagControl();

		await htmlTagControl.fill( tag );
	}

	getHtmlTagControl() {
		return this.page.locator( '.MuiBox-root:has( > label:text-matches("Tag", "i")) input.MuiSelect-nativeInput' );
	}

	async addAtomicElement( elementType: ElementType, container: string = 'document' ) {
		return await this.editor.addElement( { elType: elementType }, container );
	}

	async isLinkToggleButtonEnabled( button: Locator ) {
		return LINK_TOGGLE_BUTTON_PLUS_SIGN_PATH !== ( await button.locator( 'path' ).first().getAttribute( 'd' ) );
	}
}
