import {
	type BackboneModel,
	type CreateTemplatedElementTypeOptions,
	createTemplatedElementView,
	type ElementModel,
	type ElementType,
	type ElementView,
	type LegacyWindow,
} from '@elementor/editor-canvas';
import { getCurrentDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { apiClient } from './api';
import { type ComponentInstancePropValue, type ExtendedWindow } from './types';
import { trackComponentEvent } from './utils/tracking';

type ContextMenuEventData = { location: string; secondaryLocation: string; trigger: string };

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
		legacyWindow = window as unknown as LegacyWindow & ExtendedWindow;
		eventsManagerConfig = this.legacyWindow.elementorCommon.eventsManager.config;

		isComponentCurrentlyEdited() {
			const currentDocument = getCurrentDocument();

			return currentDocument?.id === this.getComponentId();
		}

		afterSettingsResolve( settings: { [ key: string ]: unknown } ) {
			if ( settings.component_instance ) {
				this.collection = this.legacyWindow.elementor.createBackboneElementsCollection(
					settings.component_instance
				);

				this.collection.models.forEach( setInactiveRecursively );

				settings.component_instance = '<template data-children-placeholder></template>';
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
			const componentInstance = (
				this.options?.model?.get( 'settings' )?.get( 'component_instance' ) as ComponentInstancePropValue
			 )?.value;

			return componentInstance.component_id.value;
		}

		getContextMenuGroups() {
			const filteredGroups = super.getContextMenuGroups().filter( ( group ) => group.name !== 'save' );
			const componentId = this.getComponentId();
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
							callback: ( _: unknown, eventData: ContextMenuEventData ) =>
								this.editComponent( eventData ),
						},
					],
				},
			];
			return [ ...filteredGroups, ...newGroup ];
		}

		async switchDocument() {
			//todo: handle unpublished
			const { isAllowedToSwitchDocument, lockedBy } = await apiClient.getComponentLockStatus(
				this.getComponentId() as number
			);

			if ( ! isAllowedToSwitchDocument ) {
				options.showLockedByModal?.( lockedBy || '' );
			} else {
				runCommand( 'editor/documents/switch', {
					id: this.getComponentId(),
					mode: 'autosave',
					selector: `[data-id="${ this.model.get( 'id' ) }"]`,
					shouldScroll: false,
				} );
			}
		}

		editComponent( { trigger, location, secondaryLocation }: ContextMenuEventData ) {
			if ( this.isComponentCurrentlyEdited() ) {
				return;
			}

			this.switchDocument();

			const editorSettings = this.model.get( 'editor_settings' );

			trackComponentEvent( {
				action: 'edited',
				component_uid: editorSettings?.component_uid,
				component_name: editorSettings?.title,
				location,
				secondary_location: secondaryLocation,
				trigger,
			} );
		}

		handleDblClick( e: MouseEvent ) {
			e.stopPropagation();

			const { triggers, locations, secondaryLocations } = this.eventsManagerConfig;

			this.editComponent( {
				trigger: triggers.doubleClick,
				location: locations.canvas,
				secondaryLocation: secondaryLocations.canvasElement,
			} );
		}

		events() {
			return {
				...super.events(),
				dblclick: this.handleDblClick,
			};
		}

		attributes() {
			return {
				...super.attributes(),
				'data-elementor-id': this.getComponentId(),
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
