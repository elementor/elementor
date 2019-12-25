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
import EventBase from './modules/event-base/base';
import EventAfter from './modules/event-base/after';
import EventBefore from './modules/event-base/before';

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
					Base: HookBase, // TODO: consider remove.
					After: HookAfter,
					Dependency: HookDependency,
				},

				EventBase: {
					Base: EventBase, // TODO: consider remove.
					After: EventAfter,
					Before: EventBefore;
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
