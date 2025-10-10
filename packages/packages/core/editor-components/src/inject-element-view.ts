import {
	createElementViewClassDeclaration,
	type ElementType,
	type ElementView,
	type LegacyWindow,
} from '@elementor/editor-canvas';
import { type NumberPropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export const TYPE = 'e-component';

export function createComponentType(): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return TYPE;
		}

		getView() {
			return createComponentViewClassDeclaration();
		}
	};
}

export function createComponentViewClassDeclaration(): typeof ElementView {
	return class extends createElementViewClassDeclaration() {
		legacyWindow = window as unknown as LegacyWindow;

		getComponentId() {
			return this.options?.model?.get( 'settings' )?.get( 'component_id' ) as NumberPropValue;
		}

		getContextMenuGroups() {
			const filteredGroups = super.getContextMenuGroups().filter( ( group ) => group.name !== 'save' );
			const componentId = this.getComponentId();

			if ( ! componentId?.value ) {
				return filteredGroups;
			}

			const { value: id } = componentId;
			const newGroup = {
				name: 'edit component',
				actions: [
					{
						name: 'edit component',
						icon: 'eicon-edit',
						title: () => __( 'Edit Component', 'elementor' ),
						isEnabled: () => true,
						callback: () => {
							this.legacyWindow.$e.run?.( 'editor/documents/switch', {
								id,
								mode: 'autosave',
							} );
						},
					},
				],
			};
			return [ ...filteredGroups, newGroup ];
		}

		switchDocument() {
			this.legacyWindow.$e.run?.( 'editor/documents/switch', {
				id: this.getComponentId().value,
				mode: 'autosave',
				nextAction: 'autosave',
			} );
		}

		bindUIElements() {
			const componentId = this.getComponentId();
			if ( componentId?.value ) {
				const component = this.$el.get( 0 ).querySelector( `.${ TYPE }` );
				component?.addEventListener( 'dblclick', this.switchDocument );
			}
		}
	};
}
