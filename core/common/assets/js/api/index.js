import Components from './core/components';
import Hooks from './core/hooks';
import Commands from './core/commands';
import Routes from './core/routes';
import Shortcuts from './core/shortcuts';
import BackwardsCompatibility from './core/backwards-compatibility';
import CommandsBase from './modules/command-base';
import DataBase from './modules/hooks/data/base';
import DataAfter from './modules/hooks/data/after';
import DataDependency from './modules/hooks/data/dependency';
import UIBase from './modules/hooks/ui/base';
import UIAfter from './modules/hooks/ui/after';
import UIBefore from './modules/hooks/ui/before';
import ComponentBase from './modules/component-base';
import ComponentModalBase from './modules/component-modal-base';
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
		this.commands = new Commands();
		this.routes = new Routes();
		this.shortcuts = new Shortcuts( jQuery( window ) );

		this.modules = {
			ComponentBase: ComponentBase,
			ComponentModal: ComponentModalBase,

			CommandBase: CommandsBase,

			HookBreak: HookBreak,

			hookData: {
				Base: DataBase, // TODO: consider remove.
				After: DataAfter,
				Dependency: DataDependency,
			},

			hookUI: {
				Base: UIBase, // TODO: consider remove.
				After: UIAfter,
				Before: UIBefore,
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
}
