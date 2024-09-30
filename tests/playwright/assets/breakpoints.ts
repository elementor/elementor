import { Locator, type Page } from '@playwright/test';
import EditorPage from '../pages/editor-page';
import { BreakpointEditableDevice, Device } from '../types/types';
import EditorSelectors from '../selectors/editor-selectors';

export default class {
	readonly page: Page;
	constructor( page: Page ) {
		this.page = page;
		// TODO: throw exception if experiment Breakpoints is deactivated.
	}

	static getDeviceLocator( page: Page, device: Device ): Locator {
		// TODO: use the new data-testid attribute
		const baseLocator = page.locator( '[aria-label="Switch Device"]' );
		const locators = {
			mobile: baseLocator.locator( 'button[aria-label="Mobile Portrait (up to 767px)"]' ),
			mobile_extra: baseLocator.locator( 'button[aria-label="Mobile Landscape (up to 880px)"]' ),
			tablet: baseLocator.locator( 'button[aria-label="Tablet Portrait (up to 1024px)"]' ),
			tablet_extra: baseLocator.locator( 'button[aria-label="Tablet Landscape (up to 1200px)"]' ),
			laptop: baseLocator.locator( 'button[aria-label="Laptop (up to 1366px)"]' ),
			desktop: baseLocator.locator( 'button[aria-label="Desktop"]' ),
			widescreen: baseLocator.locator( 'button[aria-label="Widescreen (2400px and up)"]' ),
		};

		return locators[ device ];
	}

	static getAll() {
		return [ 'mobile', 'mobile_extra', 'tablet', 'tablet_extra', 'laptop', 'desktop', 'widescreen' ];
	}

	static getBasic() {
		return [ 'mobile', 'tablet', 'desktop' ];
	}

	async saveOrUpdate( editor: EditorPage, toReload = false ) {
		const hasTopBar: boolean = await editor.hasTopBar();
		if ( hasTopBar ) {
			await editor.saveSiteSettingsWithTopBar( toReload );
		} else {
			await editor.saveSiteSettingsNoTopBar();
		}
	}

	async addAllBreakpoints( editor: EditorPage, experimentPostId?: string ) {
		await editor.openSiteSettings( 'layout' );
		await editor.openSection( 'section_breakpoints' );
		await this.page.waitForSelector( 'text=Active Breakpoints' );

		const devices = [ 'Mobile Landscape', 'Tablet Landscape', 'Laptop', 'Widescreen' ];

		for ( const device of devices ) {
			if ( await this.page.$( '.select2-selection__e-plus-button' ) ) {
				await this.page.click( '.select2-selection__e-plus-button' );
				await this.page.click( `li:has-text("${ device }")` );
			}
		}

		await this.saveOrUpdate( editor, true );

		if ( experimentPostId ) {
			await this.page.goto( `/wp-admin/post.php?post=${ experimentPostId }&action=elementor` );
		} else {
			await this.page.reload();

			if ( await this.page.$( '#elementor-panel-header-kit-close' ) ) {
				await this.page.locator( '#elementor-panel-header-kit-close' ).click( { timeout: 30000 } );
			}
		}

		await this.page.waitForSelector( '#elementor-editor-wrapper' );
	}

	async resetBreakpoints( editor: EditorPage ) {
		await editor.openSiteSettings( 'layout' );
		await editor.openSection( 'section_breakpoints' );
		await this.page.waitForSelector( 'text=Active Breakpoints' );

		const removeBreakpointButton = EditorSelectors.panels.siteSettings.layout.breakpoints.removeBreakpointButton;
		while ( await this.page.locator( removeBreakpointButton ).count() > 0 ) {
			await this.page.click( removeBreakpointButton );
		}
		await this.saveOrUpdate( editor, true );
	}

	getBreakpointInputLocator( page: Page, device: BreakpointEditableDevice ): Locator {
		const locators = {
			mobile: page.locator( 'input[data-setting="viewport_mobile"]' ),
			mobile_extra: page.locator( 'input[data-setting="viewport_mobile_extra"]' ),
			tablet: page.locator( 'input[data-setting="viewport_tablet"]' ),
			tablet_extra: page.locator( 'input[data-setting="viewport_tablet_extra"]' ),
			laptop: page.locator( 'input[data-setting="viewport_laptop"]' ),
			widescreen: page.locator( 'input[data-setting="viewport_widescreen"]' ),
		};

		return locators[ device ];
	}

	async setBreakpoint( editor: EditorPage, device: BreakpointEditableDevice, value: number ) {
		await editor.openSiteSettings( 'layout' );
		await editor.openSection( 'section_breakpoints' );
		await this.page.waitForSelector( 'text=Active Breakpoints' );

		const locator = this.getBreakpointInputLocator( this.page, device );
		await locator.fill( String( value ) );
		await this.saveOrUpdate( editor );
		await this.page.locator( EditorSelectors.toast ).waitFor();
	}
}
