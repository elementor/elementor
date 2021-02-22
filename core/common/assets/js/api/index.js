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
import HookBreak from './modules/hook-break';
import Hooks from './core/hooks';
import Routes from './core/routes';
import Shortcuts from './core/shortcuts';

import * as hookData from './modules/hooks/data/';
import * as hookUI from './modules/hooks/ui';

/**
 * @typedef HashCommand
 * @property {string} method,
 * @property {string} command
 * @property {function( ... )} callback
 */

export default class API {
	/**
	 * Function constructor().
	 *
	 * Create's 'elementor' api.
	 */
	constructor() {
		window.$e = this;

		this.components = new Components();

		this.commands = new Commands();
		this.commandsInternal = new CommandsInternal();

		this.hooks = new Hooks();
		this.routes = new Routes();
		this.shortcuts = new Shortcuts( jQuery( window ) );
		this.data = new Data();

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

		// Backwards compatibility should be last, in order to handle others.
		this.bc = new BackwardsCompatibility();

		this.hashCommands = this.getHashCommands();
	}

	/**
	 * Function getHashCommands().
	 *
	 * Handles API requests that comes from hash ( eg #e:run ).
	 *
	 * @param {string} hash
	 *
	 * @returns {Array.<HashCommand>}
	 */
	getHashCommands( hash = location.hash ) {
		const result = [];

		if ( hash ) {
			const hashFormat = {
					'e:run': $e.run,
					'e:route': $e.route,
				},
				// Remove first '#' and split each '&'.
				hashList = hash.substr( 1 ).split( '&' );

			hashList.forEach( ( hashItem ) => {
				const hashParts = hashItem.split( ':' );

				if ( 3 === hashParts.length && hashFormat[ hashParts[ 0 ] + ':' + hashParts[ 1 ] ] ) {
					const method = hashParts[ 0 ] + ':' + hashParts[ 1 ],
						callback = hashFormat[ method ];

					if ( callback ) {
						const command = hashParts[ 2 ];

						result.push( {
							method,
							command,
							callback,
						} );
					}
				}
			} );
		}

		return result;
	}

	/**
	 * Function runHashCommands().
	 *
	 * @param {Array.<HashCommand>} [hashCommands=this.hashCommands]
	 */
	runHashCommands( hashCommands = this.hashCommands ) {
		hashCommands.forEach( ( hashCommand ) => {
			hashCommand.callback( hashCommand.command );
		} );
	}

	/**
	 * Function run().
	 *
	 * Alias of `$e.commands.run()`.
	 *
	 * @param {string} command
	 * @param [args={}]
	 *
	 * @returns {*}
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
	 * @param [args={}]
	 *
	 * @returns {boolean}
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
	 * @param [args={}]
	 */
	route( route, args = {} ) {
		return $e.routes.to( route, args );
	}

	// TODO: shortcut();
}
