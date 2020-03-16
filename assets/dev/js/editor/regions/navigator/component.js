import ComponentBase from 'elementor-api/modules/component-base';
import CommandHookable from 'elementor-api/modules/command-hookable';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'navigator';
	}

	defaultRoutes() {
		return {
			'': () => {},
		};
	}

	defaultCommands() {
		const self = this;

		return {
			open: () => new class Open extends CommandHookable {
				apply = () => $e.route( self.getNamespace() );
			},
			close: () => new class Open extends CommandHookable {
				apply = () => self.close();
			},
			toggle: () => new class Open extends CommandHookable {
				apply() {
					if ( self.isOpen ) {
						$e.run( 'navigator/close' );
					} else {
						$e.run( 'navigator/open' );
					}
				}
			},
		};
	}

	defaultShortcuts() {
		return {
			toggle: {
				keys: 'ctrl+i',
				dependency: () => elementor.getPreviewContainer().isEditable(),
			},
		};
	}

	open( args ) {
		const { model = false } = args;

		this.manager.open( model );

		return true;
	}

	close( silent ) {
		if ( ! super.close() ) {
			return false;
		}

		this.manager.close( silent );

		return true;
	}
}
