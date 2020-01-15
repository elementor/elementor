import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as hooksUI from './hooks/ui/';

export default class Component extends ComponentBase {
	registerAPI() {
		super.registerAPI();

		Object.values( hooksUI ).forEach( ( Hook ) => new Hook() );
	}

	getNamespace() {
		return 'navigator/elements';
	}

	defaultCommands() {
		return {
			collapse: ( args ) => ( new commands.Collapse( args ) ).run(),
			expand: ( args ) => ( new commands.Expand( args ) ).run(),
			hide: ( args ) => ( new commands.Hide( args ) ).run(),
			show: ( args ) => ( new commands.Show( args ) ).run(),
			'toggle-folding': ( args ) => ( new commands.ToggleFolding( args ) ).run(),
			'toggle-folding-all': ( args ) => ( new commands.ToggleFoldingAll( args ) ).run(),
			'toggle-visibility': ( args ) => ( new commands.ToggleVisibility( args ) ).run(),
		};
	}
}
