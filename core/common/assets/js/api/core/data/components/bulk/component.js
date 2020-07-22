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
	 * @returns {Promise}
	 */
	fetch( requestData ) {
		if ( requestData.component === this ) {
			return $e.data.fetch( requestData );
		}

		const cache = 'get' === requestData.type ? $e.data.fetchCache( requestData ) : false;

		if ( cache ) {
			return cache;
		}

		requestData.promise = new Promise( ( resolve, reject ) =>
			requestData.executor = { reject, resolve }
		);

		this.requests.push( requestData );

		this.constructor.debounce( this.handleRequests.bind( this ) );

		return requestData.promise;
	}

	async handleRequests() {
		if ( 1 === this.requests.length ) {
			const requestData = this.requests.pop();

			this.execute( requestData, await $e.data.fetch( requestData ), false );
		}

		if ( this.requests.length ) {
			const commands = {},
				mapRequests = [];

			this.requests.forEach( ( _requestData ) => {
				const id = _requestData.args.query.id,
					timestamp = _requestData.timestamp;

				commands[ timestamp ] = id ? _requestData.command + '?id=' + id : _requestData.command;
				mapRequests[ timestamp ] = _requestData;
			} );

			const result = await $e.data.get( 'bulk/index', { commands }, { refresh: true } ) || {};

			Object.entries( result.data ).forEach( ( [ timestamp, data ] ) => {
				const currentRequestData = mapRequests[ timestamp ];

				this.execute( currentRequestData, data );
			} );

			this.requests = [];
		}
	}

	execute( requestData, data, setCache = true ) {
		requestData.executor.resolve( $e.data.handleResponse( requestData, data ) );

		if ( setCache && $e.data.isCacheRequired( requestData ) ) {
			$e.data.cache.set( requestData, data );
		}
	}
}
