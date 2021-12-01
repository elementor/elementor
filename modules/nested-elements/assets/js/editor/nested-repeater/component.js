import * as hooks from './hooks/';
import * as commands from './commands/';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'nested-elements/nested-repeater';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	setChildrenTitle( container, index ) {
		const title = container.parent.view.config.default_children_title,
			settings = {
				_title: sprintf( __( title, 'elementor' ), index ),
			};

		$e.internal( 'document/elements/set-settings', {
			container,
			settings,
		} );
	}
}
