import Module from './module-frontend';
import ScriptLoader from './utils/jquery-loader';

export default Module.extend( {
	elements: null,

	isJqueryRequired: null,

	getDefaultElements() {
		return {};
	},

	bindEvents() {},

	onInit() {
		// if ( 'function' !== typeof this.getDefaultElements ) {
		// 	return;
		// }

		if ( ! this.isJqueryRequired ) {
			console.log( this.getSettings() );
			this.runSecondPart();
			return;
		}

		console.log( 'required', this.getSettings() );

		this.loadJQueryIfNeeded( this.isJqueryRequired )
			.then(() => {
				this.runSecondPart();
			})
			.catch((error) => {
				console.error('Error loading jQuery:', error);
			});
	},

	initElements() {
		this.elements = this.getDefaultElements();
	},

	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},

	loadJQueryIfNeeded(isJqueryRequired) {
		return new Promise(async (resolve, reject) => {
			try {
				if ( ! isJqueryRequired ) {
					resolve();
					return;
				}

				// Pause until elementorFrontendConfig does not have property 'elementorFrontendConfig'
				while ( elementorFrontendConfig.hasOwnProperty('isJQueryLoading' ) ) {
					console.log( 'waiting for elementorFrontendConfig...' );
					await this.delay(100); // Check every 100 milliseconds
				}

				if ( isJqueryRequired && ! window.jQuery ) {
					// Instantiate ScriptLoader and execute jQuery loading
					const scriptLoader = new ScriptLoader();
					console.log('start loading jQuery...');
					elementorFrontendConfig.isJQueryLoading = true;
					await scriptLoader.execute();
					console.log('jQuery was loaded');
					delete elementorFrontendConfig.isJQueryLoading;
				}

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	},

	runSecondPart() {
		this.initElements();
		this.bindEvents();
	},
} );
