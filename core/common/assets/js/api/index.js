import Components from './apis/components';
import Hooks from './apis/hooks';
import Events from './apis/events';
import Commands from './apis/commands';
import Routes from './apis/routes';
import Shortcuts from './apis/shortcuts';
import BackwardsCompatibility from './apis/backwards-compatibility';
import CommandsBase from './modules/command-base';

export default class API {
	static initialize() {
		window.$e = {
			bc: new BackwardsCompatibility(),

			components: new Components(),
			hooks: new Hooks(),
			events: new Events(),
			commands: new Commands(),
			routes: new Routes(),
			shortcuts: new Shortcuts( jQuery( window ) ),
			modules: {
				CommandBase: CommandsBase,
			},

			run: ( ...args ) => {
				return $e.commands.run.apply( $e.commands, args );
			},

			route: ( ...args ) => {
				return $e.routes.to.apply( $e.routes, args );
			},
		};
	}
}
