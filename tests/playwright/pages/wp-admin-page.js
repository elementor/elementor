const { execSync } = require( 'child_process' );
const BasePage = require( './base-page.js' );
const EditorPage = require( './editor-page.js' );
const { createApiContext, createPost } = require( '../assets/api-requests' );
const { request } = require( '@playwright/test' );

/**
 * This post is used for any tests that need a post, with empty elements.
 *
 * @type {number}
 */

module.exports = class WpAdminPage extends BasePage {
	async gotoDashboard() {
		await this.page.goto( '/wp-admin' );
	}

	async login() {
		await this.gotoDashboard();

		const loggedIn = await this.page.$( 'text=Dashboard' );

		if ( loggedIn ) {
			return;
		}

		await this.page.waitForSelector( 'text=Log In' );
		await this.page.fill( 'input[name="log"]', this.config.user.username );
		await this.page.fill( 'input[name="pwd"]', this.config.user.password );
		await this.page.click( 'text=Log In' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	async openNewPage() {
		if ( ! await this.page.$( '.e-overview__create > a' ) ) {
			await this.gotoDashboard();
		}

		await this.page.click( '.e-overview__create > a' );
		await this.page.waitForLoadState( 'load', { timeout: 20000 } );
		await this.waitForPanel();

		await this.closeAnnouncementsIfVisible();

		return new EditorPage( this.page, this.testInfo );
	}

	async useElementorCleanPost( ) {
		const postData = {
			slug: 'hello-world 333',
			status: 'publish',
			title: 'Simple post',
			content: 'Test post',
			excerpt: {
				rendered: '<p>Welcome to Single test post</p>\n',
				protected: false,
			} };
		const apiContext = await createApiContext( request, {
			storageStateObject: JSON.parse( process.env.STORAGE_STATE ),
			wpRESTNonce: process.env.WP_REST_NONCE,
			baseURL: process.env.BASE_URL,
		} );
		const postId = await createPost( apiContext, postData );
		await this.page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );

		await this.waitForPanel();

		const editor = new EditorPage( this.page, this.testInfo, postId );
		await this.closeAnnouncementsIfVisible();

		await this.page.evaluate( () => $e.run( 'document/elements/empty', { force: true } ) );

		return editor;
	}

	async skipTutorial() {
		await this.page.waitForTimeout( 1000 );
		const next = await this.page.$( "text='Next'" );

		if ( next ) {
			await this.page.click( '[aria-label="Close dialog"]' );
		}
	}

	async waitForPanel() {
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );
	}

	/**
	 * Determine which experiments are active / inactive.
	 *
	 * TODO: The testing environment isn't clean between tests - Use with caution!
	 *
	 * @param {Object} experiments - Experiments settings ( `{ experiment_id: true / false }` );
	 *
	 * @return {Promise<void>}
	 */
	async setExperiments( experiments = {} ) {
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );

		const prefix = 'e-experiment';

		for ( const [ id, state ] of Object.entries( experiments ) ) {
			const selector = `#${ prefix }-${ id }`;

			// Try to make the element visible - Since some experiments may be hidden for the user,
			// but actually exist and need to be tested.
			await this.page.evaluate( ( el ) => {
				const element = document.querySelector( el );

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

	async setLanguage( language ) {
		await this.page.goto( '/wp-admin/options-general.php' );
		await this.page.selectOption( '#WPLANG', language );
		await this.page.locator( '#submit' ).click();
	}

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
		return execSync( `npx wp-env run cli "wp theme list --status=active --field=name --format=csv"` ).toString().trim();
	}

	activateTheme( theme ) {
		execSync( `npx wp-env run cli "wp theme activate ${ theme }"` );
	}

	async openSiteSettings() {
		await this.page.locator( '#elementor-panel-header-menu-button' ).click();
		await this.page.click( 'text=Site Settings' );
	}

	/*
	 * Enable uploading SVG files
	 */
	async enableAdvancedUploads() {
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-advanced' );
		await this.page.locator( 'select[name="elementor_unfiltered_files_upload"]' ).selectOption( '1' );
		await this.page.getByRole( 'button', { name: 'Save Changes' } ).click();
	}

	/*
     *  Disable uploading SVG files
     */
	async disableAdvancedUploads() {
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-advanced' );
		await this.page.locator( 'select[name="elementor_unfiltered_files_upload"]' ).selectOption( '' );
		await this.page.getByRole( 'button', { name: 'Save Changes' } ).click();
	}

	async closeAnnouncementsIfVisible() {
		if ( await this.page.locator( '#e-announcements-root' ).isVisible() ) {
			await this.page.evaluate( ( selector ) => document.getElementById( selector ).remove(), 'e-announcements-root' );
		}
	}
};
