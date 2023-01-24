import Component from './component';
import { loadElementsDefaults } from './api';
import { extractElementType } from './utils';

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

		[ 'widget', 'container', 'section' ].forEach( ( elType ) => {
			elementor.hooks.addFilter( `elements/${ elType }/contextMenuGroups`, ( groups, view ) => {
				// Supporting only inner section and not sections,
				// extractElementType() will return 'inner-section' for inner sections instead of 'section'.
				if ( 'section' === extractElementType( view.options?.model || {} ) ) {
					return groups;
				}

				return groups.map( ( group ) => {
					if ( group.name !== 'save' ) {
						return group;
					}

					group.actions = [
						...group.actions,
						{
							name: 'save-as-default',
							title: __( 'Save as default', 'elementor' ),
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
