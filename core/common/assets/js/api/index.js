/* Alphabetical order */
import BackwardsCompatibility from './core/backwards-compatibility';
import CommandBase from './modules/command-base';
import CommandInternalBase from './modules/command-internal-base';
import Commands from './core/commands';
import CommandsInternal from './core/commands-internal';
import ComponentBase from './modules/component-base';
import ComponentModalBase from './modules/component-modal-base';
import Components from './core/components';
import HookBreak from './modules/hook-break';
import Hooks from './core/hooks';
import Routes from './core/routes';
import Shortcuts from './core/shortcuts';

import * as hookData from './modules/hooks/data/';
import * as hookUI from './modules/hooks/ui';

export default class API {
	/**
	 * Function constructor().
	 *
	 * Create's 'elementor' api.
	 */
	constructor() {
		this.bc = new BackwardsCompatibility();
		this.components = new Components();

		this.commands = new Commands();
		this.commandsInternal = new CommandsInternal();

		this.hooks = new Hooks();
		this.routes = new Routes();
		this.shortcuts = new Shortcuts( jQuery( window ) );

		this.modules = {
			CommandBase,
			CommandInternalBase,

			ComponentBase,
			ComponentModalBase,

			HookBreak,

			hookData,
			hookUI,
		};

		window.$e = this;
	}

	/**
	 * Function run().
	 *
	 * Alias of `$e.commands.run()`.
	 *
	 * @param {{}} args
	 *
	 * @returns {*}
	 */
	run( ...args ) {
		return $e.commands.run.apply( $e.commands, args );
	}

	/**
	 * Function internal().
	 *
	 * Alias of `$e.commandsInternal.run()`.
	 *
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 */
	internal( ...args ) {
		return $e.commandsInternal.run.apply( $e.commandsInternal, args );
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
}
