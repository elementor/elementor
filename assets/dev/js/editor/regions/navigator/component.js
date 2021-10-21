import ComponentBase from 'elementor-api/modules/component-base';
import ElementsComponent from './elements/component';

import * as commands from './commands/';
import * as hooks from './hooks/index';
import * as commandsInternal from './commands-internal/';

export default class Component extends ComponentBase {
	isDocked = false;

	__construct( args ) {
		super.__construct( args );

		this.region = args.manager;

		this.elements = $e.components.register( new ElementsComponent( { manager: this } ) );

		Object.defineProperty( this, 'indicators', {
			get() {
				elementorCommon.helpers.softDeprecated( 'elementor.navigator.indicators', '3.0.5', 'elementor.navigator.region.indicators' );
				return this.region.indicators;
			},
		} );
	}

	getNamespace() {
		return 'navigator';
	}

	defaultRoutes() {
		return {
			'': () => {},
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
	}

	defaultShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+i',
				dependency: () => elementor.getPreviewContainer().isEditable(),
			},
		};
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	open( args ) {
		const { model = false } = args;

		this.region.open( model );

		return true;
	}

	close( silent ) {
		if ( ! super.close() ) {
			return false;
		}

		this.region.close( silent );

		return true;
	}

	dock() {
		elementorCommon.helpers.softDeprecated( 'elementor.navigator.dock()',
			'3.0.5',
			"$e.run( 'navigator/dock' )"
		);

		$e.run( 'navigator/dock' );
	}

	undock( silent ) {
		elementorCommon.helpers.softDeprecated( 'elementor.navigator.undock()',
			'3.0.5',
			"$e.run( 'navigator/undock', { silent } )"
		);

		$e.run( 'navigator/undock', { silent } );
	}

	setSize( size = null ) {
		elementorCommon.helpers.softDeprecated( 'elementor.navigator.setSize()',
			'3.0.5',
			"$e.internal( 'navigator/set-size', { size } )"
		);

		$e.internal( 'navigator/set-size', { size } );
	}

	getLayout() {
		elementorCommon.helpers.softDeprecated( 'elementor.navigator.getLayout()',
			'3.0.5',
			'elementor.navigator.region.getLayout()'
		);

		return this.region.getLayout();
	}
}
