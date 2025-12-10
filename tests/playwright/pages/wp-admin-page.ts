import { type APIRequestContext, type Page, Response, type TestInfo } from '@playwright/test';
import BasePage from './base-page';
import EditorPage from './editor-page';
import { ElementorType, WindowType } from '../types/types';
import { wpCli } from '../assets/wp-cli';
import ApiRequests from '../assets/api-requests';
let elementor: ElementorType;

export default class WpAdminPage extends BasePage {
	protected readonly apiRequests: ApiRequests;

	constructor( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) {
		super( page, testInfo );
		this.apiRequests = apiRequests;
	}

	/**
	 * Go to the WordPress dashboard.
	 *
	 * @return {Promise<void>}
	 */
	async openWordPressDashboard(): Promise<void> {
		await this.page.goto( '/wp-admin/' );
	}

	/**
	 * Go to the WordPress User Profile.
	 *
	 * @return {Promise<void>}
	 */
	async openWordPressUserProfile(): Promise<void> {
		await this.page.goto( '/wp-admin/profile.php' );
	}

	/**
	 * Go to the WordPress Settings pages.
	 *
	 * @param {('general' | 'writing' | 'reading' | 'discussion' | 'media' | 'permalink' | 'privacy')} page - The settings page to open.
	 *
	 * @return {Promise<void>}
	 */
	async openWordPressSettings( page: 'general' | 'writing' | 'reading' | 'discussion' | 'media' | 'permalink' | 'privacy' ): Promise<void> {
		await this.page.goto( `/wp-admin/options-${ page }.php` );
	}

	/**
	 * Go to the WordPress Settings pages.
	 *
	 * @param {('tab-general' | 'tab-integrations' | 'tab-advanced' | 'tab-performance' | 'tab-experiments')} tab - The Elementor settings tab to open.
	 *
	 * @return {Promise<void>}
	 */
	async openElementorSettings( tab: 'tab-general' | 'tab-integrations' | 'tab-advanced' | 'tab-performance' | 'tab-experiments' ): Promise<void> {
		await this.page.goto( `/wp-admin/admin.php?page=elementor-settings#${ tab }` );
		await this.page.locator( `#elementor-settings-${ tab }` ).waitFor();
	}

	/**
	 * Set settings in Elementor advanced/performance tab, as they both have only select-based options.
	 *
	 * @param {('tab-advanced' | 'tab-performance')} tab      - Either Elementor advanced or performance tab.
	 * @param {Object}                               settings - Settings to set ( `{ setting_id: setting_value }` );
	 *
	 * @return {Promise<void>}
	 */
	async setElementorSettings( tab: 'tab-advanced' | 'tab-performance', settings: { [ n: string ]: string } ): Promise<void> {
		await this.openElementorSettings( tab );

		for ( const [ selector, state ] of Object.entries( settings ) ) {
			const selectLocator = this.page.locator( `select[name="${ selector }"]` );
			await selectLocator.waitFor( { state: 'attached' } );

			await selectLocator.selectOption( state.toString(), { force: true } );
		}

		await this.page.click( '#submit' );
	}

	/**
	 * If not logged in, log in to WordPress. Otherwise, go to the WordPress dashboard.
	 *
	 * @return {Promise<void>}
	 */
	async login(): Promise<void> {
		await this.openWordPressDashboard();

		const loggedIn = await this.page.$( 'text=Dashboard' );

		if ( loggedIn ) {
			return;
		}

		await this.page.waitForSelector( 'text=Log In' );
		await this.page.fill( 'input[name="log"]', process.env.USERNAME );
		await this.page.fill( 'input[name="pwd"]', process.env.PASSWORD );
		await this.page.click( 'text=Log In' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	/**
	 * Log in to WordPress with custom credentials.
	 *
	 * @param {string} username - The username to log in with.
	 * @param {string} password - The password to log in with.
	 *
	 * @return {Promise<void>}
	 */
	async customLogin( username: string, password: string ): Promise<void> {
		await this.openWordPressDashboard();
		const loggedIn = await this.page.$( 'text=Dashboard' );

		if ( loggedIn ) {
			await this.page.hover( '#wp-admin-bar-top-secondary' );
			await this.page.click( '#wp-admin-bar-logout > a' );
		}

		await this.page.fill( 'input[name="log"]', username );
		await this.page.fill( 'input[name="pwd"]', password );
		await this.page.locator( 'text=Log In' ).last().click();
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	/**
	 * Open a new Elementor page.
	 *
	 * @param {boolean} setWithApi  - Optional. Whether to create the page with the API. Default is true.
	 * @param {boolean} setPageName - Optional. Whether to set the page name. Default is true.
	 *
	 * @return {Promise<EditorPage>}
	 */
	async openNewPage( setWithApi: boolean = true, setPageName: boolean = true ): Promise<EditorPage> {
		if ( setWithApi ) {
			await this.createNewPostWithAPI();
		} else {
			await this.createNewPostFromDashboard( setPageName );
		}

		await this.page.waitForLoadState( 'load', { timeout: 20000 } );
		await this.waitForPanel();
		await this.closeAnnouncementsIfVisible();

		return new EditorPage( this.page, this.testInfo );
	}

	/**
	 * Create a new page with the API and open it in Elementor.
	 *
	 * @return {Promise<string>}
	 */
	async createNewPostWithAPI(): Promise<string> {
		const request: APIRequestContext = this.page.context().request,
			postDataInitial = {
				title: 'Playwright Test Page - Uninitialized',
				content: '',
			},
			postId = await this.apiRequests.create( request, 'pages', postDataInitial ),
			postDataUpdated = {
				title: `Playwright Test Page #${ postId }`,
			};

		await this.apiRequests.create( request, `pages/${ postId }`, postDataUpdated );
		await this.page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );

		return postId;
	}

	/**
	 * Create a new page from the WordPress dashboard.
	 *
	 * @param {boolean} setPageName - Whether to set the page name.
	 *
	 * @return {Promise<void>}
	 */
	async createNewPostFromDashboard( setPageName: boolean ): Promise<void> {
		if ( ! await this.page.$( '.e-overview__create > a' ) ) {
			await this.openWordPressDashboard();
		}

		await this.page.click( '.e-overview__create > a' );

		if ( ! setPageName ) {
			return;
		}

		await this.setPageName();
	}

	/**
	 * Set the page name.
	 *
	 * @return {Promise<void>}
	 */
	async setPageName(): Promise<void> {
		await this.page.locator( '#elementor-panel-footer-settings' ).click();

		const pageId = await this.page.evaluate( () => elementor.config.initial_document.id );
		await this.page.locator( '.elementor-control-post_title input' ).fill( `Playwright Test Page #${ pageId }` );

		await this.page.locator( '#elementor-panel-footer-saver-options' ).click();
		await this.page.locator( '#elementor-panel-footer-sub-menu-item-save-draft' ).click();
		await this.page.locator( '#elementor-panel-header-add-button' ).click();
	}

	/**
	 * Convert the current page from Gutenberg to Elementor.
	 *
	 * @return {Promise<EditorPage>}
	 */
	async convertFromGutenberg(): Promise<EditorPage> {
		await Promise.all( [
			this.page.waitForResponse( async ( response ) => await this.blockUrlResponse( response ) ),
			this.page.click( '#elementor-switch-mode' ),
		] );

		await this.page.waitForURL( '**/post.php?post=*&action=elementor' );
		await this.page.waitForLoadState( 'load', { timeout: 20000 } );
		await this.waitForPanel();

		await this.closeAnnouncementsIfVisible();

		return new EditorPage( this.page, this.testInfo );
	}

	/**
	 * Get the response status for the API request.
	 *
	 * @param {Response} response - The response object.
	 *
	 * @return {Promise<boolean>}
	 */
	async blockUrlResponse( response: Response ): Promise<boolean> {
		const isRestRequest = response.url().includes( 'rest_route=%2Fwp%2Fv2%2Fpages%2' ); // For local testing
		const isJsonRequest = response.url().includes( 'wp-json/wp/v2/pages' ); // For CI testing
		return ( isJsonRequest || isRestRequest ) && 200 === response.status();
	}

	/**
	 * Wait for the Elementor editor panel to finish loading.
	 *
	 * @return {Promise<void>}
	 */
	async waitForPanel(): Promise<void> {
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );
	}

	/**
	 * Activate and deactivate Elementor experiments.
	 *
	 * @param {Object}            experiments - Experiments settings ( `{ experiment_id: true / false }` );
	 * @param {(boolean|string)=} oldUrl      - Optional. Whether to use the old URL structure. Default is false.
	 *
	 * @return {Promise<void>}
	 */
	async setExperiments( experiments: { [ n: string ]: boolean | string }, oldUrl: boolean = false ): Promise<void> {
		if ( oldUrl ) {
			await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );
			await this.page.click( '#elementor-settings-tab-experiments' );
		} else {
			await this.openElementorSettings( 'tab-experiments' );
		}

		const prefix = 'e-experiment';

		for ( const [ id, state ] of Object.entries( experiments ) ) {
			const selector = `#${ prefix }-${ id }`;

			await this.page.waitForSelector( selector, { state: 'attached', timeout: 10000 } );

			const selectElement = this.page.locator( selector );
			await selectElement.waitFor( { state: 'visible', timeout: 5000 } );

			await this.page.waitForTimeout( 500 );

			await this.page.evaluate( ( el ) => {
				const element: HTMLElement = document.querySelector( el );

				if ( element ) {
					element.style.display = 'block';
				}
			}, `.elementor_experiment-${ id }` );

			await selectElement.selectOption( state ? 'active' : 'inactive', { timeout: 5000 } );

			await this.confirmExperimentModalIfOpen();
		}

		await this.page.click( '#submit' );
	}

	/**
	 * Reset all Elementor experiments to their default settings.
	 *
	 * @return {Promise<void>}
	 */
	async resetExperiments(): Promise<void> {
		await this.openElementorSettings( 'tab-experiments' );
		await this.page.getByRole( 'button', { name: 'default' } ).click();
	}

	/**
	 * Set site language.
	 *
	 * @param {string}      language     - The site language to set.
	 * @param {string|null} userLanguage - Optional. The user language to set. Default is null.
	 *
	 * @return {Promise<void>}
	 */
	async setSiteLanguage( language: string, userLanguage: string = null ): Promise<void> {
		let languageCheck = language;

		if ( 'he_IL' === language ) {
			languageCheck = 'he-IL';
		} else if ( '' === language ) {
			languageCheck = 'en_US';
		}

		await this.openWordPressSettings( 'general' );

		const isLanguageActive = await this.page.locator( 'html[lang=' + languageCheck + ']' ).isVisible();

		if ( ! isLanguageActive ) {
			await this.page.selectOption( '#WPLANG', language );
			await this.page.locator( '#submit' ).click();
		}

		const userProfileLanguage = null !== userLanguage ? userLanguage : language;
		await this.setUserLanguage( userProfileLanguage );
	}

	/**
	 * Set user language.
	 *
	 * @param {string} language - The language to set.
	 *
	 * @return {Promise<void>}
	 */
	async setUserLanguage( language: string ): Promise<void> {
		await this.openWordPressUserProfile();
		await this.page.selectOption( '[name="locale"]', language );
		await this.page.locator( '#submit' ).click();
	}

	/**
	 * Confirm the Elementor experiment modal if it's open.
	 *
	 * @return {Promise<void>}
	 */
	async confirmExperimentModalIfOpen(): Promise<void> {
		const dialogButton = this.page.locator( '.dialog-type-confirm .dialog-confirm-ok' );

		if ( await dialogButton.isVisible() ) {
			await dialogButton.click();

			// Clicking the confirm button - "Activate" or "Deactivate" - will immediately save the existing experiments,
			// so we need to wait for the page to save and reload before we continue on to set any more experiments.
			await this.page.waitForLoadState( 'load' );
		}
	}

	/**
	 * Get the active WordPress theme.
	 *
	 * @return {Promise<string>}
	 */
	async getActiveTheme(): Promise<string> {
		const request: APIRequestContext = this.page.context().request;
		const themeData = await this.apiRequests.getTheme( request, 'active' );
		return themeData[ 0 ].stylesheet;
	}

	async activateTheme( theme: string ) {
		await wpCli( `wp theme activate ${ theme }` );
	}

	/**
	 * Enable uploading SVG files.
	 *
	 * @return {Promise<void>}
	 */
	async enableAdvancedUploads(): Promise<void> {
		await this.setElementorSettings( 'tab-advanced', { elementor_unfiltered_files_upload: '1' } );
	}

	/**
	 * Disable uploading SVG files.
	 *
	 * @return {Promise<void>}
	 */
	async disableAdvancedUploads(): Promise<void> {
		await this.setElementorSettings( 'tab-advanced', { elementor_unfiltered_files_upload: '' } );
	}

	/**
	 * Close the Elementor announcements if they are visible.
	 *
	 * @return {Promise<void>}
	 */
	async closeAnnouncementsIfVisible(): Promise<void> {
		if ( await this.page.locator( '#e-announcements-root' ).count() > 0 ) {
			await this.page.evaluate( ( selector ) => document.getElementById( selector ).remove(), 'e-announcements-root' );
		}
		let window: WindowType;
		await this.page.evaluate( () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore editor session is on the window object
			const editorSessionId = window.EDITOR_SESSION_ID;
			window.sessionStorage.setItem( 'ai_promotion_introduction_editor_session_key', editorSessionId );
		} );
	}

	/**
	 * Edit the page with Elementor.
	 *
	 * @return {Promise<void>}
	 */
	async editWithElementor(): Promise<void> {
		await this.page.getByRole( 'link', { name: ' Edit with Elementor' } ).click();
	}

	/**
	 * Close the block editor popup if it's visible.
	 *
	 * @return {Promise<void>}
	 */
	async closeBlockEditorPopupIfVisible(): Promise<void> {
		await this.page.locator( '#elementor-switch-mode-button' ).waitFor();
		if ( await this.page.getByRole( 'button', { name: 'Close' } ).isVisible() ) {
			await this.page.getByRole( 'button', { name: 'Close' } ).click();
		}
	}

	/**
	 * Open a new WordPress page.
	 *
	 * @return {Promise<void>}
	 */
	async openNewWordpressPage(): Promise<void> {
		await this.page.goto( '/wp-admin/post-new.php?post_type=page' );
		await this.closeBlockEditorPopupIfVisible();
	}

	/**
	 * Hide the WordPress admin bar.
	 *
	 * @return {Promise<void>}
	 */
	async hideAdminBar(): Promise<void> {
		await this.page.goto( '/wp-admin/profile.php' );
		await this.page.locator( '#admin_bar_front' ).uncheck();
		await this.page.locator( '#submit' ).click();
	}

	/**
	 * Show the WordPress admin bar.
	 *
	 * @return {Promise<void>}
	 */
	async showAdminBar(): Promise<void> {
		await this.page.goto( '/wp-admin/profile.php' );
		await this.page.locator( '#admin_bar_front' ).check();
		await this.page.locator( '#submit' ).click();
	}
}
