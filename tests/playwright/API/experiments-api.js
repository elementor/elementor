const { expect, request } = require( '@playwright/test' );

exports.ExperimentsAPI = class ExperimentsAPI {
	constructor( request, testInfo, page ) {
		if ( ! testInfo ) {
			throw new Error( 'TestInfo must be provided' );
		}

		/**
		 * @type {import('@playwright/test').TestInfo}
		 */
		this.testInfo = testInfo;
		this.request = request;
		/**
		 * @type {import('@playwright/test').Page}
		 */
		this.page = page;

		this.config = this.testInfo.config.projects[ 0 ].use;
	}

	async createApiContext( { storageStateObject, baseURL } ) {
		return await request.newContext( {
			baseURL,
			storageState: storageStateObject,

		} );
	}

	async activateExperiments( experimentNames ) {
		await this.setExperimentsState( experimentNames, 'active' );
	}

	async deactivateExperiments( experimentNames ) {
		await this.setExperimentsState( experimentNames, 'inactive' );
	}

	async setExperimentsState( experimentNames, status ) {
		await this.page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );
		await this.page.waitForLoadState( 'networkidle' );
		const wpnonce = await this.page.inputValue( '#_wpnonce' );


		const foo = {
			'elementor_experiment-container': 'active',
			'elementor_experiment-nested-elements': 'active',
			action: 'update',
			option_page: 'elementor',
			_wpnonce: wpnonce,
	};

		const apiResponse= await this.page.request.post( '/wp-admin/options.php', {
			form: foo,
		} );
		expect( apiResponse.ok() ).toBeTruthy();
		page.close();
	}

	addActionParams( requestData ) {
		// RequestData.action = 'update';
		// requestData.option_page = 'elementor';
		requestData.action = 'update';
		requestData.option_page = 'elementor';
		return requestData;
	}
};
