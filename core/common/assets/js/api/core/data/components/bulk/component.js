import ComponentBase from 'elementor-api/modules/component-base';

import * as commandsData from './commands/data/';

export default class BulkComponent extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		// TODO: Create common class for next two lines ( also for command-history-debounce ).
		if ( ! this.constructor.debounce ) {
			this.constructor.debounce = _.debounce( ( fn ) => fn(), 300 );
		}

		/**
		 * @type {RequestData[]}
		 */
		this.requests = [];
	}

	getNamespace() {
		return 'bulk';
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	/**
	 * @param {RequestData} requestData
	 */
	fetch( requestData ) {
		if ( requestData.component === this ) {
			return $e.data.fetch( requestData );
		}

		const cache = $e.data.getCache( requestData.component, requestData.command, requestData.args.query );

		if ( cache ) {
			return Promise.resolve( cache );
		}

		requestData.promise = new Promise( ( resolve, reject ) =>
			requestData.executor = { reject, resolve }
		);

		this.constructor.debounce( async () => {
			if ( 1 === this.requests.length ) {
				this.requests.pop().executor.resolve( await $e.data.fetch( requestData ) );
			}
			if ( this.requests.length ) {
				const commands = {},
					mapRequests = [];

				this.requests.forEach( ( request ) => {
					commands[ request.timestamp ] = request.command;
					mapRequests[ request.timestamp ] = request;
				} );

				const result = await $e.data.get( 'bulk/index', { commands }, { force: true } ) || {};

				Object.entries( result ).forEach( ( [ timestamp, data ] ) => {
					const request = mapRequests[ timestamp ];

					request.executor.resolve( data );
				} );
			}
		} );

		this.requests.push( requestData );

		return requestData.promise;
	}
}
