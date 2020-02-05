import ComponentBase from './component-base';
import CommandBase from 'elementor-api/modules/command-base';

export default class ComponentModalBase extends ComponentBase {
	registerAPI() {
		super.registerAPI();

		$e.shortcuts.register( 'esc', {
			scopes: [ this.getNamespace() ],
			callback: () => this.close(),
		} );
	}

	defaultCommands() {
		const self = this;

		return {
			open: () => new class Open extends CommandBase {
				apply = () => $e.route( self.getNamespace() )
			},
			close: () => new class Close extends CommandBase {
				apply = () => self.close();
			},
			toggle: () => new class Toggle extends CommandBase {
				apply() {
					if ( self.isOpen ) {
						self.close();
					} else {
						$e.route( self.getNamespace() );
					}
				}
			},
		};
	}

	defaultRoutes() {
		return {
			'': () => { /* Nothing to do, it's already rendered. */ },
		};
	}

	open() {
		if ( ! this.layout ) {
			const layout = this.getModalLayout();
			this.layout = new layout( { component: this } );

			this.layout.getModal().on( 'hide', () => this.close() );
		}

		this.layout.showModal();

		return true;
	}

	close() {
		if ( ! super.close() ) {
			return false;
		}

		this.layout.getModal().hide();

		return true;
	}

	getModalLayout() {
		elementorModules.ForceMethodImplementation();
	}
}
