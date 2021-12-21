import BasePage from './base-page.mjs';
import EditorPage from './editor-page.mjs';

export const CLEAN_POST_ID = 1;

export default class wpAdminPage extends BasePage {
	async login() {
		this.page.waitForTimeout( 1000 );

		await this.page.goto( '/wp-admin' );

		const loggedIn = await this.page.locator( 'text=Dashboard', { timeout: 2000 } );

		if ( loggedIn ) {
			return;
		}

		await this.page.waitForSelector( 'text=Log In' );
		await this.page.fill( 'input[name="log"]', this.config.user.username );
		await this.page.waitForTimeout( 500 );
		await this.page.fill( 'input[name="pwd"]', this.config.user.password );
		await this.page.click( 'text=Log In' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	async waitForPanel() {
		await this.page.waitForSelector( '#elementor-panel-header-title' );
	}

	async createNewPage() {
		try {
			await this.page.click( 'text=Create New Page', { timeout: 5000 } );
		} catch ( err ) {
			console.error( "Click on Elementor 'Create New Page' button failed" );
			await this.page.waitForSelector( 'text=Dashboard' );
			await this.page.click( 'text=Pages' );

			await Promise.all( [
				this.page.waitForNavigation( { url: '/wp-admin/post-new.php?post_type=page' } ),
				this.page.click( 'div[role="main"] >> text=Add New' ),
			] );

			await Promise.all( [
				this.page.waitForNavigation(),
				this.skipTutorial(),
				this.page.click( 'text=← Back to WordPress Editor Edit with Elementor' ),
			] );
		}

		await this.waitForPanel();

		return new EditorPage( this.page, this.testInfo )
	}

	async useElementorCleanPost() {
		await this.page.goto( `/wp-admin/post.php?post=${ CLEAN_POST_ID }&action=elementor` );

		await this.waitForPanel();

		const editor = new EditorPage( this.page, this.testInfo )

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
		// TODO Use client config, if experiments are set in the config, there no need to set them here.
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );

		const prefix = 'e-experiment';

		for ( const [ id, state ] of Object.entries( experiments ) ) {
			const selector = `#${ prefix }-${ id }`;

			await this.page.selectOption( selector, state ? 'active' : 'inactive' );
		}

		await this.page.click( '#submit' );
	}
};
