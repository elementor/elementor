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
import { __ } from '@wordpress/i18n';

import { apiClient } from './api';
import { type ComponentInstanceProp } from './prop-types/component-instance-prop-type';
import { type ExtendedWindow } from './types';
import { switchToComponent } from './utils/switch-to-component';
import { trackComponentEvent } from './utils/tracking';

type ContextMenuEventData = { location: string; secondaryLocation: string; trigger: string };

export type ContextMenuAction = {
	name: string;
	icon: string;
	title: string | ( () => string );
	isEnabled: () => boolean;
	callback: ( _: unknown, eventData: ContextMenuEventData ) => void;
};

type ContextMenuGroupConfig = {
	disable: Record< string, string[] >;
	add: Record< string, { index: number; action: ContextMenuAction } >;
};

type ContextMenuGroup = {
	name: string;
	actions: ContextMenuAction[];
};

export const COMPONENT_WIDGET_TYPE = 'e-component';

const updateGroups = ( groups: ContextMenuGroup[], config: ContextMenuGroupConfig ): ContextMenuGroup[] => {
	const disableMap = new Map( Object.entries( config.disable ?? {} ) );
	const addMap = new Map( Object.entries( config.add ?? {} ) );

	return groups.map( ( group ) => {
		const disabledActions = disableMap.get( group.name ) ?? [];
		const addConfig = addMap.get( group.name );

		// Update disabled actions
		const updatedActions = group.actions.map( ( action ) =>
			disabledActions.includes( action.name ) ? { ...action, isEnabled: () => false } : action
		);

		// Insert additional action if needed
		if ( addConfig ) {
			updatedActions.splice( addConfig.index, 0, addConfig.action );
		}

		return { ...group, actions: updatedActions };
	} );
};

export function createComponentType(
	options: CreateTemplatedElementTypeOptions & { showLockedByModal?: ( lockedBy: string ) => void }
): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return options.type;
		}

		getView() {
			return createComponentView( { ...options } );
		}
	};
}

function createComponentView(
	options: CreateTemplatedElementTypeOptions & {
		showLockedByModal?: ( lockedBy: string ) => void;
	}
): typeof ElementView {
	return class extends createTemplatedElementView( options ) {
		legacyWindow = window as unknown as LegacyWindow & ExtendedWindow;
		eventsManagerConfig = this.legacyWindow.elementorCommon.eventsManager.config;

		isComponentCurrentlyEdited() {
			const currentDocument = getCurrentDocument();

			return currentDocument?.id === this.getComponentId();
		}

		afterSettingsResolve( settings: { [ key: string ]: unknown } ) {
			const componentInstance = settings.component_instance as
				| {
						overrides?: Record< string, unknown >;
						elements?: unknown[];
				  }
				| undefined;

			if ( componentInstance ) {
				this.collection = this.legacyWindow.elementor.createBackboneElementsCollection(
					componentInstance.elements
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
				this.options?.model?.get( 'settings' )?.get( 'component_instance' ) as ComponentInstanceProp
			 )?.value;

			return componentInstance.component_id.value;
		}

		getContextMenuGroups() {
			const filteredGroups = super.getContextMenuGroups().filter( ( group ) => group.name !== 'save' );
			const componentId = this.getComponentId();
			if ( ! componentId ) {
				return filteredGroups;
			}

			const newGroups = updateGroups(
				filteredGroups as ContextMenuGroup[],
				this._getContextMenuConfig() as unknown as ContextMenuGroupConfig
			);
			return newGroups;
		}

		_getContextMenuConfig() {
			const legacyWindow = this.legacyWindow || ( window as unknown as LegacyWindow & ExtendedWindow );
			const elementorWithConfig = legacyWindow.elementor as typeof legacyWindow.elementor & {
				config?: { user?: { is_administrator?: boolean } };
			};
			const isAdministrator = elementorWithConfig.config?.user?.is_administrator ?? false;

			const addedGroup = {
				general: {
					index: 1,
					action: {
						name: 'edit component',
						icon: 'eicon-edit',
						title: () => __( 'Edit Component', 'elementor' ),
						isEnabled: () => true,
						callback: ( _: unknown, eventData: ContextMenuEventData ) => this.editComponent( eventData ),
					},
				},
			};

			const disabledGroup = {
				clipboard: [ 'pasteStyle', 'resetStyle' ],
			};

			return { add: isAdministrator ? addedGroup : {}, disable: disabledGroup };
		}

		async switchDocument() {
			//todo: handle unpublished
			const { isAllowedToSwitchDocument, lockedBy } = await apiClient.getComponentLockStatus(
				this.getComponentId() as number
			);

			if ( ! isAllowedToSwitchDocument ) {
				options.showLockedByModal?.( lockedBy || '' );
			} else {
				switchToComponent( this.getComponentId() as number, this.model.get( 'id' ) );
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
