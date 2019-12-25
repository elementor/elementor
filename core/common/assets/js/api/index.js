import Components from './apis/components';
import Hooks from './apis/hooks';
import Events from './apis/events';
import Commands from './apis/commands';
import Routes from './apis/routes';
import Shortcuts from './apis/shortcuts';
import BackwardsCompatibility from './apis/backwards-compatibility';
import CommandsBase from './modules/command-base';
import HookBase from './modules/hook-base/base';
import HookAfter from './modules/hook-base/after';
import HookDependency from './modules/hook-base/dependency';

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

				HookBase: {
					Base: HookBase,
					After: HookAfter,
					Dependency: HookDependency,
				},
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
