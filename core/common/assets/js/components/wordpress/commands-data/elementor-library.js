import CommandData from 'elementor-api/modules/command-data';

export class ElementorLibrary extends CommandData {
	static getEndpointFormat() {
		return 'elementor-library';
	}

	getRequestData() {
		const requestData = super.getRequestData();

		requestData.namespace = 'wp';
		requestData.version = '2';

		return requestData;
	}

	applyBeforeCreate( args ) {
		const { type, ...data } = args.data || {};

		if ( ! type ) {
			throw new Error( '`type` argument was not passed to `wp/elementor-templates` command.' );
		}

		return super.applyBeforeCreate( {
			...args,
			data: {
				status: 'publish',
				document_type: type,
				...data,
			},
		} );
	}
}
