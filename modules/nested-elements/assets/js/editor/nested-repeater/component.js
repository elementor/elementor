import RepeaterControl from './controls/repeater';

import * as hooks from './hooks/';
import * as commands from './commands/';
import * as widgets from './widgets/';

export default class Component extends $e.modules.ComponentBase {
	registerAPI() {
		super.registerAPI();

		elementor.addControlView( 'nested-elements-repeater', RepeaterControl );

		Object.values( widgets ).forEach(
			( WidgetClass ) => elementor.registerElementType( new WidgetClass )
		);
	}

	getNamespace() {
		return 'nested-elements/nested-repeater';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	getChildrenTitle( container, index ) {
		const title = container.parent.view.config.default_children_title;

		return sprintf( __( title, 'elementor' ), index );
	}

	setChildrenTitle( container, index ) {
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				_title: this.getChildrenTitle( container, index ),
			},
			options: {
				external: true,
			},
		} );
	}

	setRepeaterItemTitle( container, index ) {
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				tab_title: this.getChildrenTitle( container, index ),
			},
			options: {
				external: true,
			},
		} );
	}
}
