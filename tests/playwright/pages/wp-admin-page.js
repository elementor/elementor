const { execSync } = require( 'child_process' );
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
		await this.page.waitForLoadState( 'load', { timeout: 20000 } );
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
};
