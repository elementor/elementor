import ComponentBase from 'elementor-api/modules/component-base';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';
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
		// TODO: Delete old cache?
		// Add document cache before render.
		DocumentCache.loadByConfig( document );
	}

	onElementorLoaded() {
		// Add global cache before render.
		$e.data.get( 'globals', {}, { filter: 'filter-object-component' } );
	}
}
