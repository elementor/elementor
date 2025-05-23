import ComponentBase from 'elementor-api/modules/component-base';

import * as components from './';
import * as hooks from './hooks/';
import * as uiStates from './ui-states';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document';
	}

	registerAPI() {
		Object.values( components ).forEach( ( ComponentClass ) =>
			$e.components.register( new ComponentClass ),
		);

		super.registerAPI();
	}

	defaultCommands() {
		return {
			// Example: ( args ) => ( new Commands.Example( args ).run() ),
		};
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultUiStates() {
		return this.importUiStates( uiStates );
	}

	defaultUtils() {
		return {
			findViewRecursive: ( parent, key, value, multiple = true ) => {
				let found = [];
				for ( const x in parent._views ) {
					const view = parent._views[ x ];

					if ( value === view.model.get( key ) ) {
						found.push( view );
						if ( ! multiple ) {
							return found;
						}
					}

					if ( view.children ) {
						const views = this.utils.findViewRecursive( view.children, key, value, multiple );
						if ( views.length ) {
							found = found.concat( views );
							if ( ! multiple ) {
								return found;
							}
						}
					}
				}

				return found;
			},
			findViewById: ( id ) => {
				const elements = this.utils.findViewRecursive(
					elementor.getPreviewView().children,
					'id',
					id,
					false,
				);

				return elements ? elements[ 0 ] : false;
			},
			findContainerById: ( id ) => {
				let result = this.utils.findViewById( id );

				if ( result ) {
					result = result.getContainer();
				}

				return result;
			},
		};
	}
}
