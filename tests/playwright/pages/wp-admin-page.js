exports.WpAdminPage = class wpAdminPage {
	/**
	 * @param {import('@playwright/test').Page} page
	 */
	constructor( page ) {
		this.page = page;
	}

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
		await this.page.fill( 'input[name="log"]', 'admin' );
		await this.page.waitForTimeout( 500 );
		await this.page.fill( 'input[name="pwd"]', 'password' );
		await this.page.click( 'text=Log In' );
		await this.page.waitForSelector( 'text=Dashboard' );
	}

	async openNewPage() {
		if ( ! await this.page.$( 'text=Create New Page' ) ) {
			await this.gotoDashboard();
		}

		await this.page.click( 'text=Create New Page' );
		await this.page.waitForSelector( '#elementor-panel-header-title' );
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
