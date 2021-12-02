exports.WpAdminPage = class wpAdminPage {
	/**
	 * @param {import('@playwright/test').Page} page
	 */
	constructor( page ) {
		this.page = page;
	}

	async goto() {
		await this.page.goto( `/wp-admin` );
	}

	async login() {
		await this.goto();

		const loggedIn = await this.page.$( 'text=Dashboard' );

		if ( loggedIn ) {
			return;
		}

		await this.page.waitForSelector( 'text=Log In' );
		await this.page.fill( 'input[name="log"]', 'admin' );
		await this.page.waitForTimeout( 500 );
		await this.page.fill( 'input[name="pwd"]', 'password' );
		await this.page.click( 'text=Log In' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	async openNewPage() {
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

		await this.page.waitForSelector( '#elementor-panel-header-title' );
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
		await this.page.goto( 'wp-admin/admin.php?page=elementor#tab-experiments' );

		const prefix = 'e-experiment';

		for ( const [ id, state ] of Object.entries( experiments ) ) {
			const selector = `#${ prefix }-${ id }`;

			await this.page.selectOption( selector, state ? 'active' : 'inactive' );
		}

		await this.page.click( '#submit' );
	}

	async createNewPage() {
		await this.login();
		await this.openNewPage();
	}
};
