import Components from './api/components';
import Hooks from './api/hooks';
import Commands from './api/commands';
import Routes from './api/routes';
import Shortcuts from './api/shortcuts';
import BackwardsCompatibility from './api/backwards-compatibility';
import CommandsBase from './modules/command-base';
import DataBase from './modules/hooks/data/base';
import DataAfter from './modules/hooks/data/after';
import DataDependency from './modules/hooks/data/dependency';
import UIBase from './modules/hooks/ui/base';
import UIAfter from './modules/hooks/ui/after';
import UIBefore from './modules/hooks/ui/before';
import ComponentBase from './modules/component-base';
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
		this.commands = new Commands();
		this.routes = new Routes();
		this.shortcuts = new Shortcuts( jQuery( window ) );

		this.modules = {
			ComponentBase: ComponentBase,
			ComponentModal: ComponentModal,

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
