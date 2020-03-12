import ComponentBase from 'elementor-api/modules/component-base';

export default class BackwardsCompatibility {
	constructor() {
		this.components = {};
	}

	/**
	 * @param {'commands'|'commands-internal'|'routes'} type
	 * @param {{}} newCommands
	 * @param {ComponentBackwardsCompatibility} componentBC
	 * @returns {{}} Old commands.
	 */
	aliasCommands( type, newCommands, componentBC ) {
		const oldNamespace = componentBC.getNamespace(),
			newNamespace = componentBC.getNewNamespace();

		let eMethod;

		// TODO: Switch should be function.
		switch ( type ) {
			case 'commands':
				eMethod = $e.run;
				break;

			case 'commands-internal':
				eMethod = $e.internal;
				break;

			case 'routes':
				eMethod = $e.route;
				break;

			default:
				throw Error( `invalid type: '${ type }'` );
		}

		const oldCommands = {};

		Object.keys( newCommands ).forEach( ( command ) => {
			oldCommands[ command ] = ( args ) => {
				const newCommand = newNamespace + '/' + command,
					oldCommand = oldNamespace + '/' + command;

				elementorCommon.helpers.softDeprecated( oldCommand, componentBC.getDeprecatedVersion(), newCommand, );

				return eMethod( newCommand, args );
			};
		} );

		return oldCommands;
	}

	/**
	 * @param {Component} ComponentClass
	 * @param {string} componentName
	 * @param {string} version
	 *
	 * @returns {Component} Component backwards compatibility
	 */
	createDeprecateComponent( ComponentClass, componentName, version ) {
		class ComponentBackwardsCompatibility extends ComponentClass {
			getNewNamespace() {
				return super.getNamespace();
			}

			getDeprecatedVersion() {
				return version;
			}

			getNamespace() {
				return componentName;
			}

			defaultCommands() {
				return $e.bc.aliasCommands( 'commands', super.defaultCommands(), this );
			}

			defaultCommandsInternal() {
				return $e.bc.aliasCommands( 'commands-internal', super.defaultCommandsInternal(), this );
			}

			defaultRoutes() {
				return $e.bc.aliasCommands( 'routes', super.defaultRoutes(), this );
			}
		}

		const component = $e.components.register( new ComponentBackwardsCompatibility() );

		this.components[ component.getNamespace() ] = component;

		return component;
	}

	ensureTab( namespace, tabSlug, page = '' ) {
		let component = $e.components.get( namespace );

		if ( ! component ) {
			const Component = class extends ComponentBase {
				getNamespace() {
					return namespace;
				}

				renderTab( tab ) {
					elementor.getPanelView().setPage( page ).activateTab( tab );
				}
			};

			component = $e.components.register( new Component() );
		}

		if ( ! component.hasTab( tabSlug ) && elementor.config.tabs[ tabSlug ] ) {
			component.addTab( tabSlug, {
				title: elementor.config.tabs[ tabSlug ],
			} );
		}
	}
}
