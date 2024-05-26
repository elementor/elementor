import { type APIRequestContext, expect } from '@playwright/test';
import { execSync } from 'child_process';
import BasePage from './base-page';
import EditorPage from './editor-page';
import { create } from '../assets/api-requests';
import { ElementorType, WindowType } from '../types/types';
let elementor: ElementorType;

export default class WpAdminPage extends BasePage {
	/**
	 * Go to the WordPress dashboard.
	 *
	 * @return {Promise<void>}
	 */
	async gotoDashboard() {
		await this.page.goto( '/wp-admin' );
	}

	/**
	 * If not logged in, log in to WordPress. Otherwise, go to the WordPress dashboard.
	 *
	 * @return {Promise<void>}
	 */
	async login() {
		await this.gotoDashboard();

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
	 * @return {Promise<void>}
	 */
	async createNewPostWithAPI() {
		const request: APIRequestContext = this.page.context().request,
			postDataInitial = {
				title: 'Playwright Test Page - Uninitialized',
				content: '',
			},
			postId = await create( request, 'pages', postDataInitial ),
			postDataUpdated = {
				title: `Playwright Test Page #${ postId }`,
			};

		await create( request, `pages/${ postId }`, postDataUpdated );
		await this.page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );
	}

	/**
	 * Create a new page from the WordPress dashboard.
	 *
	 * @param {boolean} setPageName
	 *
	 * @return {Promise<void>}
	 */
	async createNewPostFromDashboard( setPageName: boolean ) {
		if ( ! await this.page.$( '.e-overview__create > a' ) ) {
			await this.gotoDashboard();
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
	async setPageName() {
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
	 * @param {Object} response - The response object.
	 *
	 * @return {Promise<boolean>}
	 */
	async blockUrlResponse( response ): Promise<boolean> {
		const isRestRequest = response.url().includes( 'rest_route=%2Fwp%2Fv2%2Fpages%2' ); // For local testing
		const isJsonRequest = response.url().includes( 'wp-json/wp/v2/pages' ); // For CI testing
		return ( isJsonRequest || isRestRequest ) && 200 === response.status();
	}

	/**
	 * Skip the tutorial.
	 *
	 * @return {Promise<void>}
	 */
	async skipTutorial() {
		await this.page.waitForTimeout( 1000 );
		const next = await this.page.$( "text='Next'" );

		if ( next ) {
			await this.page.click( '[aria-label="Close dialog"]' );
		}
	}

	/**
	 * Wait for the Elementor editor panel to finish loading.
	 *
	 * @return {Promise<void>}
	 */
	async waitForPanel() {
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );
	}

	/**
	 * Activate and deactivate Elementor experiments.
	 *
	 * TODO: The testing environment isn't clean between tests - Use with caution!
	 *
	 * @param {Object} experiments - Experiments settings ( `{ experiment_id: true / false }` );
	 *
	 * @return {Promise<void>}
	 */
	async setExperiments( experiments: {[ n: string ]: boolean | string } ) {
		await this.page.goto( '/wp-admin/admin.php?page=elementor-settings#tab-experiments' );

		const prefix = 'e-experiment';

		for ( const [ id, state ] of Object.entries( experiments ) ) {
			const selector = `#${ prefix }-${ id }`;

			// Try to make the element visible - Since some experiments may be hidden for the user,
			// but actually exist and need to be tested.
			await this.page.evaluate( ( el ) => {
				const element: HTMLElement = document.querySelector( el );

				if ( element ) {
					element.style.display = 'block';
				}
			}, `.elementor_experiment-${ id }` );

			await this.page.selectOption( selector, state ? 'active' : 'inactive' );

			// Click to confirm any experiment that has dependencies.
			await this.confirmExperimentModalIfOpen();
		}

		await this.page.click( '#submit' );
	}

	/**
	 * Set site language.
	 *
	 * @param {string} language     - The site language to set.
	 * @param {string} userLanguage - Optional. The user language to set.
	 *
	 * @return {Promise<void>}
	 */
	async setSiteLanguage( language: string, userLanguage = null ) {
		let languageCheck = language;

		if ( 'he_IL' === language ) {
			languageCheck = 'he-IL';
		} else if ( '' === language ) {
			languageCheck = 'en_US';
		}

		await this.page.goto( '/wp-admin/options-general.php' );

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
	async setUserLanguage( language: string ) {
		await this.page.goto( 'wp-admin/profile.php' );
		await this.page.selectOption( '[name="locale"]', language );
		await this.page.locator( '#submit' ).click();
	}

	/**
	 * Confirm the Elementor experiment modal if it's open.
	 *
	 * @return {Promise<void>}
	 */
	async confirmExperimentModalIfOpen() {
		const dialogButton = this.page.locator( '.dialog-type-confirm .dialog-confirm-ok' );

		if ( await dialogButton.isVisible() ) {
			await dialogButton.click();

			// Clicking the confirm button - "Activate" or "Deactivate" - will immediately save the existing experiments,
			// so we need to wait for the page to save and reload before we continue on to set any more experiments.
			await this.page.waitForLoadState( 'load' );
		}
	}

	getActiveTheme() {
		return execSync( `npx wp-env run cli wp theme list --status=active --field=name --format=csv` ).toString().trim();
	}

	activateTheme( theme: string ) {
		execSync( `npx wp-env run cli wp theme activate ${ theme }` );
	}

	/**
	 * Enable uploading SVG files.
	 *
	 * @return {Promise<void>}
	 */
	async enableAdvancedUploads() {
		await this.page.goto( '/wp-admin/admin.php?page=elementor-settings#tab-advanced' );
		await this.page.locator( 'select[name="elementor_unfiltered_files_upload"]' ).selectOption( '1' );
		await this.page.getByRole( 'button', { name: 'Save Changes' } ).click();
	}

	/**
	 * Disable uploading SVG files.
	 *
	 * @return {Promise<void>}
	 */
	async disableAdvancedUploads() {
		await this.page.goto( '/wp-admin/admin.php?page=elementor-settings#tab-advanced' );
		await this.page.locator( 'select[name="elementor_unfiltered_files_upload"]' ).selectOption( '' );
		await this.page.getByRole( 'button', { name: 'Save Changes' } ).click();
	}

	/**
	 * Close the Elementor announcements if they are visible.
	 *
	 * @return {Promise<void>}
	 */
	async closeAnnouncementsIfVisible() {
		if ( await this.page.locator( '#e-announcements-root' ).isVisible() ) {
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
	async editWithElementor() {
		await this.page.getByRole( 'link', { name: ' Edit with Elementor' } ).click();
	}

	/**
	 * Close the block editor popup if it's visible.
	 *
	 * @return {Promise<void>}
	 */
	async closeBlockEditorPopupIfVisible() {
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
	async openNewWordpressPage() {
		await this.page.goto( '/wp-admin/post-new.php?post_type=page' );
		await this.closeBlockEditorPopupIfVisible();
	}

	/**
	 * Screenshot test for the promotion page.
	 *
	 * @param {string} promotionContainer - The promotion container selector.
	 * @param {string} pageUri            - The page URI.
	 * @param {string} screenshotName     - The screenshot name.
	 *
	 * @return {Promise<void>}
	 */
	async promotionPageScreenshotTest( promotionContainer: string, pageUri: string, screenshotName: string ) {
		await this.page.goto( `/wp-admin/admin.php?page=${ pageUri }/` );
		const promoContainer = this.page.locator( promotionContainer );
		await promoContainer.waitFor();
		await expect( promoContainer ).toHaveScreenshot( `${ screenshotName }.png` );
	}

	/**
	 * Hide the WordPress admin bar.
	 *
	 * @return {Promise<void>}
	 */
	async hideAdminBar() {
		await this.page.goto( '/wp-admin/profile.php' );
		await this.page.locator( '#admin_bar_front' ).uncheck();
		await this.page.locator( '#submit' ).click();
	}

	/**
	 * Show the WordPress admin bar.
	 *
	 * @return {Promise<void>}
	 */
	async showAdminBar() {
		await this.page.goto( '/wp-admin/profile.php' );
		await this.page.locator( '#admin_bar_front' ).check();
		await this.page.locator( '#submit' ).click();
	}
}

