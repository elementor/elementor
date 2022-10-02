import Component from './component';
import loadDefaultValues from './load-default-values';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		loadDefaultValues();
		this.#addContextMenuItem();
	}

	onElementorInitComponents() {
		window.$e.components.register( new Component() );
	}

	#addContextMenuItem() {
		if ( ! elementor.config?.user?.is_administrator ) {
			return;
		}

		elementor.hooks.addFilter( 'elements/widget/contextMenuGroups', ( groups, view ) => {
			return groups.map( ( group ) => {
				if ( group.name !== 'save' ) {
					return group;
				}

				group.actions = [
					...group.actions,
					{
						name: 'save-as-default',
						title: __( 'Save as Default', 'elementor' ),
						callback: () => $e.run( 'kit-elements-defaults/create', { container: view.getContainer() } ),
					},
				];

				return group;
			} );
		} );
	}
}
