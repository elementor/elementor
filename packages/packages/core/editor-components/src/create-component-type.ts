import {
	type BackboneModel,
	type CreateTemplatedElementTypeOptions,
	createTemplatedElementView,
	type ElementModel,
	type ElementType,
	type ElementView,
	type LegacyWindow,
} from '@elementor/editor-canvas';
import { type NumberPropValue } from '@elementor/editor-props';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { apiClient } from './api';

export const TYPE = 'e-component';

export function createComponentType(
	options: CreateTemplatedElementTypeOptions & { showLockedByModal?: ( lockedBy: string ) => void }
): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return options.type;
		}

		getView() {
			return createComponentView( options );
		}
	};
}

function createComponentView(
	options: CreateTemplatedElementTypeOptions & { showLockedByModal?: ( lockedBy: string ) => void }
): typeof ElementView {
	return class extends createTemplatedElementView( options ) {
		legacyWindow = window as unknown as LegacyWindow;

		afterSettingsResolve( settings: { [ key: string ]: unknown } ) {
			if ( settings.component ) {
				this.collection = this.legacyWindow.elementor.createBackboneElementsCollection( settings.component );

				this.collection.models.forEach( setInactiveRecursively );

				settings.component = '<template data-children-placeholder></template>';
			}

			return settings;
		}

		getDomElement() {
			// Component does not have a DOM element, so we return the first child's DOM element.
			return this.children.findByIndex( 0 )?.getDomElement() ?? this.$el;
		}

		attachBuffer( collectionView: this, buffer: DocumentFragment ): void {
			const childrenPlaceholder = collectionView.$el.find( '[data-children-placeholder]' ).get( 0 );

			if ( ! childrenPlaceholder ) {
				super.attachBuffer( collectionView, buffer );

				return;
			}

			childrenPlaceholder.replaceWith( buffer );
		}

		getComponentId() {
			return this.options?.model?.get( 'settings' )?.get( 'component' ) as NumberPropValue;
		}

		getContextMenuGroups() {
			const filteredGroups = super.getContextMenuGroups().filter( ( group ) => group.name !== 'save' );
			const componentId = this.getComponentId()?.value as number;
			if ( ! componentId ) {
				return filteredGroups;
			}

			const newGroup = [
				{
					name: 'edit component',
					actions: [
						{
							name: 'edit component',
							icon: 'eicon-edit',
							title: () => __( 'Edit Component', 'elementor' ),
							isEnabled: () => true,
							callback: () => this.switchDocument(),
						},
					],
				},
			];
			return [ ...filteredGroups, ...newGroup ];
		}

		async switchDocument() {
			const { isAllowedToSwitchDocument, lockedBy } = await apiClient.getComponentLockStatus(
				this.getComponentId()?.value as number
			);

			if ( ! isAllowedToSwitchDocument ) {
				options.showLockedByModal?.( lockedBy || '' );
			} else {
				runCommand( 'editor/documents/switch', {
					id: this.getComponentId()?.value as number,
					mode: 'autosave',
					selector: `[data-id="${ this.model.get( 'id' ) }"]`,
				} );
				apiClient.lockComponent( this.getComponentId()?.value as number );
			}
		}

		events() {
			return {
				...super.events(),
				dblclick: this.switchDocument,
			};
		}

		attributes() {
			return {
				...super.attributes(),
				'data-elementor-id': this.getComponentId().value,
			};
		}
	};
}

function setInactiveRecursively( model: BackboneModel< ElementModel > ) {
	const editSettings = model.get( 'editSettings' );

	if ( editSettings ) {
		editSettings.set( 'inactive', true );
	}

	const elements = model.get( 'elements' );

	if ( elements ) {
		elements.forEach( ( childModel ) => {
			setInactiveRecursively( childModel );
		} );
	}
}
