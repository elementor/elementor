const { request, expect } = require( '@playwright/test' );

exports.ExperimentsAPI = class ExperimentsAPI {
	constructor( testInfo ) {
		if ( ! testInfo ) {
			throw new Error( 'TestInfo must be provided' );
		}

		/**
		 * @type {import('@playwright/test').TestInfo}
		 */
		this.testInfo = testInfo;
		this.config = this.testInfo.config.projects[ 0 ].use;
	}

	async activateExperiments( experimentNames ) {
		await this.setExperimentsState( experimentNames, 'active' );
	}

	async deactivateExperiments( experimentNames ) {
		await this.setExperimentsState( experimentNames, 'inactive' );
	}

	async setExperimentsState( experimentNames, status ) {
		let requestData = Object.fromEntries( experimentNames.map( ( experiment ) => [ experiment, status ] ) );
		requestData = this.addActionParams( requestData );
		const context = await request.newContext( {
			baseURL: this.config.baseURL,
		} );
		const activateLoop = await context.post( '/wp-admin/options.php', {
			data: requestData,
		} );
		expect( activateLoop.ok() ).toBeTruthy();
	}

	addActionParams( requestData ) {
		requestData.action = 'update';
		requestData.option_page = 'elementor';
		return requestData;
	}
};
