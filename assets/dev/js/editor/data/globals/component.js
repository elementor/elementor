import ComponentBase from 'elementor-api/modules/component-base';
import * as commandsData from './commands/';
import * as hooks from './hooks/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'globals';
	}

	registerAPI() {
		super.registerAPI();

		// TODO: Remove - Create testing compatibility.
		if ( elementorCommonConfig.isTesting ) {
			return;
		}

		setTimeout( () => {
			$e.data.get( 'globals/colors', {}, { cache: true } );
			$e.data.get( 'globals/typography', {}, { cache: true } );

			// TODO: Find better place.
			const getFlatElements = ( elements ) => {
				const result = [];
				elements.forEach( ( element ) => {
					if ( element.elements ) {
						getFlatElements( element.elements ).forEach( ( _element ) => result.push( _element ) );
					}

					result.push( element );
				} );
				return result;
			};

			const document = elementor.documents.getCurrent();

			getFlatElements( document.config.elements ).forEach( ( element ) =>
				// Add cache.
				$e.utils.data.cache(
					'document/elements',
					{
						document_id: document.id,
						element_id: element.id,
					},
					element
				)
			);
		} );
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
