import Components from './api/components';
import Hooks from './api/hooks';
import Events from './api/events';
import Commands from './api/commands';
import Routes from './api/routes';
import Shortcuts from './api/shortcuts';
import BackwardsCompatibility from './api/backwards-compatibility';
import CommandsBase from './modules/command-base';
import HookBase from './modules/hook-base/base';
import HookAfter from './modules/hook-base/after';
import HookDependency from './modules/hook-base/dependency';
import EventBase from './modules/event-base/base';
import EventAfter from './modules/event-base/after';
import EventBefore from './modules/event-base/before';
import Component from './modules/component';
import ComponentModal from './modules/component-modal';
import HookBreak from './modules/hook-break';

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

			Component: Component,
			ComponentModal: ComponentModal,

			HookBreak: HookBreak,

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
