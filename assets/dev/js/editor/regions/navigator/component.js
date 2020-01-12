import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'navigator';
	}

	defaultRoutes() {
		return {
			'': () => {},
		};
	}

	defaultCommands() {
		return {
			close: ( args ) => ( new commands.Close( args ) ).run(),
			open: ( args ) => ( new commands.Open( args ) ).run(),
			toggle: ( args ) => ( new commands.Toggle( args ) ).run(),
			'toggle-all': ( args ) => ( new commands.ToggleAll( args ) ).run(),
		};
	}

	defaultShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+i',
				dependency: () => 'edit' === elementor.channels.dataEditMode.request( 'activeMode' ),
			},
		};
	}

	open( args ) {
		const { model = false } = args;

		this.manager.open( model );

		return true;
	}
}
