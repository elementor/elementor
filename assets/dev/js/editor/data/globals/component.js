import ComponentBase from 'elementor-api/modules/component-base';
import TypographyComponent from './typography/component';
import ColorsComponent from './colors/component';

import * as commandsData from './commands/data/';

const ControlsCSSParser = require( 'elementor-editor-utils/controls-css-parser' );

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );

		elementor.on( 'document:loaded', () => this.updateTempStylesheet() );
	}

	getNamespace() {
		return 'globals';
	}

	registerAPI() {
		$e.components.register( new TypographyComponent( { manager: this } ) );
		$e.components.register( new ColorsComponent( { manager: this } ) );

		super.registerAPI();
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	onElementorLoaded() {
		// Add globals to cache before render.
		$e.data.get( 'globals/index' ).then( () => elementor.trigger( 'globals:loaded' ) );
	}

	/**
	 * In case there is a new global color/typography convert current globals to CSS variables.
	 */
	updateTempStylesheet() {
		if ( ! this.controlsCSS ) {
			this.controlsCSS = new ControlsCSSParser( {
				id: 'e-kit-temp-variables',
				settingsModel: new elementorModules.editor.elements.models.BaseSettings( {}, {} ),
			} );
		}

		// The kit document has it's own CSS.
		if ( 'kit' === elementor.documents.getCurrent().type ) {
			this.controlsCSS.stylesheet.empty();
			return;
		}

		$e.data.get( 'globals/index' ).then( ( { data } ) => {
			if ( data.colors ) {
				Object.values( data.colors ).forEach( ( item ) => {
					const controls = elementor.config.kit_config.design_system_controls.colors,
						values = {
							_id: item.id,
							color: item.value,
						};

					this.controlsCSS.addStyleRules( controls, values, controls, [ '{{WRAPPER}}' ], [ 'body' ] );
				} );
			}

			if ( data.typography ) {
				Object.values( data.typography ).forEach( ( item ) => {
					const controls = elementor.config.kit_config.design_system_controls.typography,
						values = {
							_id: item.id,
							...item.value,
						};

					this.controlsCSS.addStyleRules( controls, values, controls, [ '{{WRAPPER}}' ], [ 'body' ] );
				} );
			}

			this.controlsCSS.addStyleToDocument();
		} );
	}
}
