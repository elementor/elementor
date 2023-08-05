import { execSync } from 'child_process';
import BasePage from './base-page';
import EditorPage from './editor-page';

/**
 * This post is used for any tests that need a post, with empty elements.
 */
const CLEAN_POST_ID: number = 1;

export default class WpAdminPage extends BasePage {
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

	async convertFromGutenberg() {
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

	async blockUrlResponse( response ) {
		const isRestRequest = response.url().includes( 'rest_route=%2Fwp%2Fv2%2Fpages%2' ); // For local testing
		const isJsonRequest = response.url().includes( 'wp-json/wp/v2/pages' ); // For CI testing
		return ( isJsonRequest || isRestRequest ) && 200 === response.status();
	}

	/**
	 *  @deprecated - use openNewPage() & editor.editCurrentPage() instead to allow parallel tests in the near future.
	 *
	 * @return {Promise<EditorPage>}
	 */
	async useElementorCleanPost() {
		await this.page.goto( `/wp-admin/post.php?post=${ CLEAN_POST_ID }&action=elementor` );

		await this.waitForPanel();

		await this.closeAnnouncementsIfVisible();

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
	 */
	async setExperiments( experiments: {[ n: string ]: boolean | string } ) {
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );

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

	async setLanguage( language: string ) {
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

	activateTheme( theme: string ) {
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

	async editWithElementor() {
		await this.page.getByRole( 'link', { name: ' Edit with Elementor' } ).click();
	}

	async closeBlockEditorPopupIfVisible() {
		if ( await this.page.locator( '[aria-label="Close dialog"]' ).isVisible() ) {
			await this.page.click( '[aria-label="Close dialog"]' );
		}
	}

	async openNewWordpressPage() {
		await this.page.goto( '/wp-admin/post-new.php?post_type=page' );
		await this.closeBlockEditorPopupIfVisible();
	}
}
