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
	/**
	 * Function constructor().
	 *
	 * Create's 'elementor' api.
	 */
	constructor() {
		this.bc = new BackwardsCompatibility();
		this.components = new Components();
		this.hooks = new Hooks();
		this.events = new Events();
		this.commands = new Commands();
		this.routes = new Routes();
		this.shortcuts = new Shortcuts( jQuery( window ) );

		this.modules = {
			CommandBase: CommandsBase,

			HookBase: {
				Base: HookBase, // TODO: consider remove.
				After: HookAfter,
				Dependency: HookDependency,
			},

			EventBase: {
				Base: EventBase, // TODO: consider remove.
				After: EventAfter,
				Before: EventBefore,
			},
		};

		window.$e = this;
	}

	/**
	 * Function run().
	 *
	 * Alias of `$e.commands.run()`.
	 *
	 * @param {{}} args
	 * @returns {boolean}
	 */
	run( ...args ) {
		return $e.commands.run.apply( $e.commands, args );
	}

	/**
	 * Function route().
	 *
	 * Alias of `$e.routes.to()`.
	 *
	 * @param {{}} args
	 */
	route( ...args ) {
		return $e.routes.to.apply( $e.routes, args );
	}

	// TODO: shortcut();
	// TODO: util();
}
