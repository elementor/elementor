import * as modules from './modules/';
import * as hooks from './hooks/';

export default class EComponent extends $e.modules.ComponentBase {
	constructor( args ) {
		super( args );

		this.loadModules();
	}

	/**
	 * @return {string} The namespace of the component
	 */
	getNamespace() {
		return 'notes';
	}

	/**
	 * @return {*} All the hooks
	 */
	defaultHooks() {
		return this.importHooks( hooks );
	}

	loadModules() {
		for ( const key in modules ) {
			new modules[ key ];
		}
	}
}
