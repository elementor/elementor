import Module from './module-frontend';
import JqueryLoader from './utils/jquery-loader';

export default Module.extend( {
	elements: null,

	isJqueryRequired: null,

	getDefaultElements() {
		return {};
	},

	bindEvents() {},

	onInit() {
		this.maybeLoadJQuery();
	},

	runInitFunctions() {
		// Call the parent class's onInit if needed
		if ( typeof Module.prototype.onInit === 'function' ) {
			Module.prototype.onInit.apply( this, arguments );
		}

		this.initElements();
		this.bindEvents();
	},

	initElements() {
		this.elements = this.getDefaultElements();
	},

	maybeLoadJQuery() {
		if ( ! this.isJqueryRequired || !! window.jQuery || this.isEdit ) {
			this.runInitFunctions();
			return;
		}

		this.loadJQueryIfNeeded( this.isJqueryRequired )
			.then( () => {
				this.runInitFunctions();
			} )
			.catch( ( error ) => {
				console.error( 'Error loading jQuery:', error );
			} );
	},

	delay( ms ) {
		return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	},

	loadJQueryIfNeeded( isJqueryRequired ) {
		return new Promise( async ( resolve, reject ) => {
			try {
				if ( ! isJqueryRequired ) {
					resolve();
					return;
				}

				while ( elementorFrontendConfig.hasOwnProperty( 'isJQueryLoading' ) ) {
					await this.delay( 10 );
				}

				if ( isJqueryRequired && ! window.jQuery ) {
					const jqueryLoader = new JqueryLoader();
					elementorFrontendConfig.isJQueryLoading = true;
					await jqueryLoader.execute();
					delete elementorFrontendConfig.isJQueryLoading;
				}

				resolve();
			} catch ( error ) {
				reject( error );
			}
		} );
	},
} );
