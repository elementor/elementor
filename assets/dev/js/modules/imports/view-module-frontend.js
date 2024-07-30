import Module from './module-frontend';
import JqueryLoader from './utils/jquery-loader';

export default Module.extend( {
	elements: null,

	isJqueryRequired: null,

	getDefaultElements() {
		return {};
	},

	bindEvents() {},

	initElements() {
		this.elements = this.getDefaultElements();
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

	runSecondPart() {
		this.initElements();
		this.bindEvents();
	},

	onInit() {
		// if ( 'function' !== typeof this.getDefaultElements ) {
		//     return;
		// }

		if ( ! this.isJqueryRequired || !! window.jQuery || this.isEdit ) {
			if ( typeof this.runSecondPart === 'function' ) {
				this.runSecondPart();
			} else {
				this.elements = {};
			}
			return;
		}

		this.loadJQueryIfNeeded( this.isJqueryRequired )
			.then( () => {
				this.runSecondPart();
			} )
			.catch( ( error ) => {
				console.error( 'Error loading jQuery:', error );
			} );
	},
} );
