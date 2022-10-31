import Component from './component';
import { loadElementsDefaults } from './api';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		loadElementsDefaults();
		this.#addContextMenuItem();
	}

	onElementorInitComponents() {
		window.$e.components.register( new Component() );
	}

	#addContextMenuItem() {
		if ( ! elementor.config?.user?.is_administrator ) {
			return;
		}

		[ 'widget', 'container' ].forEach( ( elType ) => {
			elementor.hooks.addFilter( `elements/${ elType }/contextMenuGroups`, ( groups, view ) => {
				return groups.map( ( group ) => {
					if ( group.name !== 'save' ) {
						return group;
					}

					group.actions = [
						...group.actions,
						{
							name: 'save-as-default',
							title: __( 'Save as Default', 'elementor' ),
							callback: () => {
								$e.run( 'kit-elements-defaults/confirm-creation', { container: view.getContainer() } );
							},
						},
					];

					return group;
				} );
			} );
		} );
	}
}
