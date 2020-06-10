import ComponentBase from 'elementor-api/modules/component-base';
import TypographyComponent from './typography/component';
import ColorsComponent from './colors/component';

import * as commandsData from './commands/data/';
import * as hooks from './hooks/';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		// TODO: Remove - Create testing compatibility.
		if ( elementorCommonConfig.isTesting ) {
			return;
		}

		elementorCommon.elements.$window.on( 'elementor:loaded', this.onElementorLoaded.bind( this ) );
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

	defaultHooks() {
		return this.importHooks( hooks );
	}

	onElementorLoaded() {
		// Add global cache before render.
		$e.data.get( 'globals/index' );
	}
}
