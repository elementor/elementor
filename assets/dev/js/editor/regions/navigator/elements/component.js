import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as hooksUI from './hooks/ui/';

export default class Component extends ComponentBase {
	onInit() {
		super.onInit();

		Object.values( hooksUI ).forEach( ( Hook ) => new Hook() );
	}

	getNamespace() {
		return 'navigator/elements';
	}

	defaultCommands() {
		return {
			hide: ( args ) => ( new commands.Hide( args ) ).run(),
			show: ( args ) => ( new commands.Show( args ) ).run(),
			'toggle-all': ( args ) => ( new commands.ToggleAll( args ) ).run(),
			'toggle-visibility': ( args ) => ( new commands.ToggleVisibility( args ) ).run(),
		};
	}
}
