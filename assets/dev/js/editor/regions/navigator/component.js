import ComponentBase from 'elementor-api/modules/component-base';
import ElementsComponent from './elements/component';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	__construct( args ) {
		super.__construct( args );

		this.elements = $e.components.register( new ElementsComponent( { manager: this } ) );
	}

	getNamespace() {
		return 'navigator';
	}

	defaultRoutes() {
		return {
			'': () => {},
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
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
}
