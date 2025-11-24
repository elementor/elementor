import EditorPage from '../../../pages/editor-page';
import { Page } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';

export type ElementType = 'e-button' | 'e-divider' | 'e-heading' | 'e-image' | 'e-paragraph' | 'e-svg' | 'e-tabs' | 'e-youtube' |'e-div-block' | 'e-flexbox';
export type Tag = 'div' | 'header' | 'section' | 'article' | 'aside' | 'footer'| 'a';

const TOGGLE_LINK_SELECTOR = ' *[aria-label="Toggle link"]';

const LINK_SECTION_BASE_SELECTOR = `.MuiStack-root:has(> .MuiStack-root > ${ TOGGLE_LINK_SELECTOR })`;

export class AtomicHelper {
	readonly page: Page;
	readonly editor: EditorPage;
	readonly wpAdmin: WpAdminPage;

	constructor( page: Page, editor: EditorPage, wpAdmin: WpAdminPage ) {
		this.page = page;
		this.editor = editor;
		this.wpAdmin = wpAdmin;
	}

	public async setLinkControl( config: { toggleMode?: boolean; value?: string; isTargetBlank?: boolean; } = {} ) {
		const {
			value = '',
			isTargetBlank = false,
		} = config;
		await this.page.locator( LINK_SECTION_BASE_SELECTOR ).waitFor( { timeout: 600 } );

		const toggleMode = config.toggleMode ?? !! value;
		const linkInput = this.page.locator( '.MuiCollapse-root .MuiAutocomplete-root input[placeholder="Type or paste your URL"]' );
		const isToggled = await linkInput.isVisible();

		if ( isToggled !== toggleMode ) {
			await this.page.locator( LINK_SECTION_BASE_SELECTOR + TOGGLE_LINK_SELECTOR ).click();
		}

		if ( ! toggleMode ) {
			return;
		}

		await linkInput.fill( value );

		const newTabSwitch = this.page.locator( `${ LINK_SECTION_BASE_SELECTOR } .MuiSwitch-switchBase` );

		if ( await this.isNewTabSwitchOn() !== isTargetBlank ) {
			await newTabSwitch.click();
		}
	}

	public async setHtmlTagControl( newTag: Tag ) {
		await this.getHtmlTagControl( '.MuiInputBase-root' ).click();

		const optionSelector = `li[data-value="${ newTag }"]`;
		const optionLocator = this.page.locator( optionSelector );

		await optionLocator.click();
		await optionLocator.waitFor( { state: 'detached' } );
	}

	public getHtmlTagControl( deeperSelector: string = '' ) {
		const control = this.page.locator( `[data-type="settings-field"] label`, { hasText: /Tag/ig } ).locator( '..' );

		return deeperSelector
			? control.locator( deeperSelector )
			: control;
	}

	public async isHtmlTagControlDisabled() {
		const classList = await this.getHtmlTagControl( '.MuiInputBase-root' ).getAttribute( 'class' );

		return !! classList.split( ' ' ).includes( 'Mui-disabled' );
	}

	public getNewTabSwitch() {
		return this.page.locator( `${ LINK_SECTION_BASE_SELECTOR } .MuiSwitch-switchBase` );
	}

	public async isNewTabSwitchOn() {
		const classList = await this.getNewTabSwitch().getAttribute( 'class' );

		return !! classList.split( ' ' ).includes( 'Mui-checked' );
	}

	public async addAtomicElement( elementType: ElementType, container: string = 'document' ) {
		return await this.editor.addElement( { elType: elementType }, container );
	}
}
