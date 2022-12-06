const BasePage = require( './base-page.js' );
const EditorPage = require( './editor-page.js' );

/**
 * This post is used for any tests that need a post, with empty elements.
 *
 * @type {number}
 */
const CLEAN_POST_ID = 1;

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
		await this.page.waitForLoadState( 'networkidle' );
		await this.waitForPanel();

		return new EditorPage( this.page, this.testInfo );
	}

	async useElementorCleanPost() {
		await this.page.goto( `/wp-admin/post.php?post=${ CLEAN_POST_ID }&action=elementor` );

		await this.waitForPanel();

		const editor = new EditorPage( this.page, this.testInfo, CLEAN_POST_ID );

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

			await this.page.selectOption( selector, state ? 'active' : 'inactive' );
		}

		await this.page.click( '#submit' );
	}

	async setLanguage( language ) {
		await this.page.goto( '/wp-admin/options-general.php' );
		await this.page.selectOption( '#WPLANG', language );
		await this.page.locator( '#submit' ).click();
	}
};
