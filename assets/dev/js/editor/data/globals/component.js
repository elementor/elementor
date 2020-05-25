import ComponentBase from 'elementor-api/modules/component-base';
import TypographyComponent from './typography/component';

import * as commandsData from './commands/data/';
import * as hooks from './hooks/';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		// TODO: Remove - Create testing compatibility.
		if ( elementorCommonConfig.isTesting ) {
			return;
		}

		elementor.on( 'document:before:preview', this.onDocumentPreview.bind( this ) );
		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );
	}

	getNamespace() {
		return 'globals';
	}

	registerAPI() {
		$e.components.register( new TypographyComponent( { manager: this } ) );

		super.registerAPI();
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	onDocumentPreview( document ) {
		const { elements = {} } = document.config;

		// Convect to cache format.
		Object.entries( elements ).forEach( ( [ key, element ] ) => {
			elements[ element.id ] = element;

			delete elements[ key ];
		} );

		const component = $e.components.get( 'editor/documents' ),
			command = 'editor/documents/{documentId}/elements',
			query = {
				documentId: document.id,
			};

		$e.data.loadCache( component, command, query, elements );
	}

	onElementorLoaded() {
		// Add global cache before render.
		$e.data.get( 'globals/index' );
	}
}
