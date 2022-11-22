const { expect, request } = require( '@playwright/test' );

exports.ExperimentsAPI = class ExperimentsAPI {
	constructor( page ) {
		/**
		 * @type {import('@playwright/test').Page}
		 */
		this.page = page;
	}

	async activateExperiments( experimentNames ) {
		await this.setExperimentsState( experimentNames, 'active' );
	}

	async deactivateExperiments( experimentNames ) {
		await this.setExperimentsState( experimentNames, 'inactive' );
	}

	async setExperimentsState( experimentNames, status ) {
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );
		await this.page.waitForLoadState( 'domcontentloaded' );
		const wpnonce = await this.page.inputValue( '#_wpnonce' );
		let requestData = Object.fromEntries( experimentNames.map( ( experiment ) => [ `elementor_experiment-${ experiment }`, status ] ) );
		requestData = this.addActionParams( requestData, wpnonce );

		const apiResponse = await this.page.request.post( '/wp-admin/options.php', {
			form: requestData,
		} );

		expect( apiResponse.ok() ).toBeTruthy();
		await this.page.close();
	}

	addActionParams( requestData, wpnonce ) {
		requestData.action = 'update';
		requestData.option_page = 'elementor';
		requestData._wpnonce = wpnonce;
		return requestData;
	}
};
