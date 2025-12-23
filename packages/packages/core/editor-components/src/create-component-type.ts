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
import { type ComponentInstancePropValue, type ExtendedWindow } from './types';
import { getComponentDocumentData } from './utils/component-document-data';
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

export const TYPE = 'e-component';

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
	const WidgetType = legacyWindow.elementor.modules.elements.types.Widget;

	return class extends WidgetType {
		getType() {
			return options.type;
		}

		getView() {
			return createComponentView( { ...options } );
		}

		getModel() {
			return createComponentModel();
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
		#loadingComponentTitle = false;
		#componentDocumentSettings: any = null;
		#isTitleListenerSetup = false;

		onRender() {
			super.onRender?.();
			if ( ! this.#isTitleListenerSetup ) {
				this.setupComponentTitleListener();
				this.#isTitleListenerSetup = true;
			}
		}

		setupComponentTitleListener() {
			const settings = this.model.get( 'settings' ) as any;
			if ( ! settings ) {
				return;
			}

			settings.on( 'change:component_instance', this.getComponentTitle, this );
			( this.model as any ).on( 'change:componentName', this.onComponentNameChange, this );
			this.getComponentTitle();
		}

		getComponentTitle() {
			const model = this.model as any;
			if ( model.get( 'elType' ) !== 'widget' || model.get( 'widgetType' ) !== 'e-component' ) {
				return;
			}

			const settings = model.get( 'settings' ) as any;
			if ( ! settings ) {
				return;
			}

			const componentInstance = settings.get( 'component_instance' );
			if ( ! componentInstance?.value ) {
				return;
			}

			const componentId = componentInstance.value.component_id?.value;
			if ( ! componentId ) {
				return;
			}

			if ( this.#loadingComponentTitle ) {
				return;
			}

			this.#loadingComponentTitle = true;

			getComponentDocumentData( componentId )
				.then( ( config ) => {
					if ( ! config ) {
						this.#loadingComponentTitle = false;
						return;
					}

					const title = this.extractTitleFromConfig( config );
					if ( title ) {
						( this.model as any ).set( 'componentName', title );
					}

					this.setupDocumentSettingsListener( config );
					this.#loadingComponentTitle = false;
				} )
				.catch( () => {
					this.#loadingComponentTitle = false;
				} );
		}

		extractTitleFromConfig( config: any ) {
			if ( config.settings?.settings?.post_title ) {
				return config.settings.settings.post_title;
			}
			if ( config.panel?.title ) {
				return config.panel.title;
			}
			if ( config.container?.settings ) {
				const containerSettings = config.container.settings;
				if ( containerSettings.get ) {
					return containerSettings.get( 'post_title' );
				}
				if ( containerSettings.post_title ) {
					return containerSettings.post_title;
				}
			}
			return null;
		}

		setupDocumentSettingsListener( config: any ) {
			if ( ! config.container?.settings ) {
				return;
			}

			const documentSettings = config.container.settings;

			if ( this.#componentDocumentSettings ) {
				this.#componentDocumentSettings.off( 'change:post_title', this.onComponentDocumentTitleChange, this );
			}

			this.#componentDocumentSettings = documentSettings;
			documentSettings.on( 'change:post_title', this.onComponentDocumentTitleChange, this );
		}

		onComponentDocumentTitleChange( settings: any ) {
			const postTitle = settings.get( 'post_title' );
			if ( ! postTitle ) {
				return;
			}

			const componentId = this.getComponentId();
			if ( ! componentId ) {
				return;
			}

			const componentIdNumber = typeof componentId === 'string' ? Number( componentId ) : componentId;
			if ( ! componentIdNumber || isNaN( componentIdNumber ) ) {
				return;
			}

			this.updateAllComponentInstances( componentIdNumber, postTitle );
		}

		updateAllComponentInstances( componentId: number, title: string ) {
			const legacyWindow = this.legacyWindow || ( window as unknown as LegacyWindow & ExtendedWindow );
			const elementor = legacyWindow.elementor as any;
			const previewView = elementor?.getPreviewView?.();

			if ( ! previewView?.children ) {
				return;
			}

			this.findAndUpdateComponentInstances( previewView.children, componentId, title );
		}

		findAndUpdateComponentInstances( children: any, componentId: number, title: string ) {
			if ( ! children || ! children._views ) {
				return;
			}

			for ( const key in children._views ) {
				const view = children._views[ key ];

				if ( ! view || ! view.model ) {
					continue;
				}

				const viewComponentId = this.getComponentIdFromView( view );
				if ( viewComponentId === componentId ) {
					( view.model as any ).set( 'componentName', title );
				}

				if ( view.children ) {
					this.findAndUpdateComponentInstances( view.children, componentId, title );
				}
			}
		}

		getComponentIdFromView( view: any ): number | null {
			try {
				const settings = view.model?.get( 'settings' );
				if ( ! settings ) {
					return null;
				}

				const componentInstance = settings.get( 'component_instance' );
				if ( ! componentInstance?.value ) {
					return null;
				}

				return componentInstance.value.component_id?.value || null;
			} catch {
				return null;
			}
		}

		onComponentNameChange() {
			( this.model as any ).trigger( 'change:title' );
		}

		onDestroy() {
			const settings = this.model.get( 'settings' ) as any;
			if ( settings ) {
				settings.off( 'change:component_instance', this.getComponentTitle, this );
			}

			( this.model as any ).off( 'change:componentName', this.onComponentNameChange, this );

			if ( this.#componentDocumentSettings ) {
				this.#componentDocumentSettings.off( 'change:post_title', this.onComponentDocumentTitleChange, this );
				this.#componentDocumentSettings = null;
			}

			super.onDestroy?.();
		}

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
				switchToComponent( this.getComponentId(), this.model.get( 'id' ) );
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

function createComponentModel() {
	const legacyWindow = window as unknown as LegacyWindow;
	const WidgetType = legacyWindow.elementor.modules.elements.types.Widget;
	const widgetTypeInstance = new WidgetType() as any;
	const BaseWidgetModel = widgetTypeInstance.getModel();

	return BaseWidgetModel.extend( {
		initialize( attributes: any, options: any ) {
			BaseWidgetModel.prototype.initialize.call( this, attributes, options );

			const componentInstance = this.get( 'settings' )?.get( 'component_instance' );
			if ( componentInstance?.value ) {
				const componentId = componentInstance.value.component_id?.value;
				if ( componentId ) {
					this.set( 'componentId', componentId );
					this.fetchComponentTitle( componentId );
				}
			}
		},

		fetchComponentTitle( componentId: number ) {
			getComponentDocumentData( componentId )
				.then( ( config ) => {
					if ( ! config ) {
						return;
					}

					const title = this.extractTitleFromConfig( config );
					if ( title ) {
						this.set( 'componentTitle', title );
						this.trigger( 'change:title' );
					}
				} )
				.catch( () => {
					// Silently fail, will use fallback title
				} );
		},

		extractTitleFromConfig( config: any ) {
			if ( config.settings?.settings?.post_title ) {
				return config.settings.settings.post_title;
			}
			if ( config.panel?.title ) {
				return config.panel.title;
			}
			if ( config.container?.settings ) {
				const containerSettings = config.container.settings;
				if ( containerSettings.get ) {
					return containerSettings.get( 'post_title' );
				}
				if ( containerSettings.post_title ) {
					return containerSettings.post_title;
				}
			}
			return null;
		},

		getTitle() {
			const cachedTitle = this.get( 'componentTitle' );
			if ( cachedTitle ) {
				return cachedTitle;
			}

			return 'LOL';
		},

		getComponentId() {
			return this.get( 'componentId' ) || null;
		},

		getComponentName() {
			return this.getTitle();
		},

		getComponentUid() {
			const editorSettings = this.get( 'editor_settings' );
			return editorSettings?.component_uid || null;
		},
	} );
}
