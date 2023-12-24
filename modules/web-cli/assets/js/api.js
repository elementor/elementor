/* Alphabetical order */
import BackwardsCompatibility from './core/backwards-compatibility';
import CommandBase from './modules/command-base';
import CommandInternalBase from './modules/command-internal-base';
import CommandData from './modules/command-data';
import Commands from './core/commands';
import CommandsInternal from './core/commands-internal';
import ComponentBase from './modules/component-base';
import ComponentModalBase from './modules/component-modal-base';
import Components from './core/components';
import Data from './core/data.js';
import HashCommands from './extras/hash-commands';
import HookBreak from './modules/hook-break';
import Hooks from './core/hooks';
import Routes from './core/routes';
import Shortcuts from './core/shortcuts';
import Store from './core/store';
import UiStates from './core/ui-states';

import * as hookData from './modules/hooks/data/';
import * as hookUI from './modules/hooks/ui';

export default class API {
	/**
	 * Function constructor().
	 *
	 * Create's 'elementor' api.
	 */
	constructor() {
		this.components = new Components();

		this.commands = new Commands();
		this.commandsInternal = new CommandsInternal();

		this.hooks = new Hooks();
		this.routes = new Routes();
		this.shortcuts = new Shortcuts( jQuery( window ) );
		this.data = new Data();
		this.store = new Store();
		this.uiStates = new UiStates();

		this.modules = {
			CommandBase,
			CommandInternalBase,

			CommandData,

			ComponentBase,
			ComponentModalBase,

			HookBreak,

			hookData,
			hookUI,
		};

		this.extras = {
			hashCommands: new HashCommands(),
		};

		// Backwards compatibility should be last, in order to handle others.
		this.bc = new BackwardsCompatibility();
	}

	/**
	 * Function run().
	 *
	 * Alias of `$e.commands.run()`.
	 *
	 * @param {string} command
	 * @param {*}      [args={}]
	 *
	 * @return {*} result
	 */
	run( command, args = {} ) {
		return $e.commands.run( command, args );
	}

	/**
	 * Function internal().
	 *
	 * Alias of `$e.commandsInternal.run()`.
	 *
	 * @param {string} command
	 * @param {*}      [args={}]
	 *
	 * @return {boolean} result
	 */
	internal( command, args = {} ) {
		return $e.commandsInternal.run( command, args );
	}

	/**
	 * Function route().
	 *
	 * Alias of `$e.routes.to()`.
	 *
	 * @param {string} route
	 * @param {*}      [args={}]
	 * @param {Object} [options]
	 */
	route( route, args = {}, options = { history: true } ) {
		return $e.routes.to( route, args, options );
	}

	// TODO: shortcut();
}
