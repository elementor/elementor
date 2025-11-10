import {
	type CreateTemplatedElementTypeOptions,
	createTemplatedElementView,
	type ElementType,
	type ElementView,
	type LegacyWindow,
} from '@elementor/editor-canvas';
import { type NumberPropValue } from '@elementor/editor-props';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from './types';
import { trackComponentEvent } from './utils/tracking';

export const TYPE = 'e-component';

export function createComponentType( options: CreateTemplatedElementTypeOptions ): typeof ElementType {
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

function createComponentView( options: CreateTemplatedElementTypeOptions ): typeof ElementView {
	return class extends createTemplatedElementView( options ) {
		legacyWindow = window as unknown as LegacyWindow & ExtendedWindow;
		eventsManagerConfig = this.legacyWindow.elementorCommon.eventsManager.config;

		afterSettingsResolve( settings: { [ key: string ]: unknown } ) {
			if ( settings.component ) {
				this.collection = this.legacyWindow.elementor.createBackboneElementsCollection( settings.component );

				settings.component = '<template data-children-placeholder></template>';
			}

			return settings;
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
			const componentId = this.getComponentId()?.value;

			if ( ! componentId ) {
				return filteredGroups;
			}

			const newGroup = {
				name: 'edit component',
				actions: [
					{
						name: 'edit component',
						icon: 'eicon-edit',
						title: () => __( 'Edit Component', 'elementor' ),
						isEnabled: () => true,
						callback: () =>
							this.editComponent( {
								trigger: this.eventsManagerConfig.triggers.click,
								secondaryLocation: this.eventsManagerConfig.secondaryLocations.contextMenu,
							} ),
					},
				],
			};
			return [ ...filteredGroups, newGroup ];
		}

		editComponent( { trigger, secondaryLocation }: { trigger: string; secondaryLocation: string } ) {
			this.switchDocument();

			const editorSettings = this.model.get( 'editor_settings' );

			trackComponentEvent( {
				action: 'edited',
				component_uuid: editorSettings?.component_uuid,
				component_name: editorSettings?.title,
				location: this.eventsManagerConfig.locations.canvas,
				secondary_location: secondaryLocation,
				trigger,
			} );
		}

		switchDocument() {
			runCommand( 'editor/documents/switch', {
				id: this.getComponentId().value,
				selector: `[data-id="${ this.model.get( 'id' ) }"]`,
				mode: 'autosave',
			} );
		}

		ui() {
			return {
				...super.ui(),
				doubleClick: '.e-component:not(:has(.elementor-edit-area))',
			};
		}

		events() {
			return {
				...super.events(),
				'dblclick @ui.doubleClick': this.editComponent( {
					trigger: this.eventsManagerConfig.triggers.doubleClick,
					secondaryLocation: this.eventsManagerConfig.secondaryLocations.canvasElement,
				} ),
			};
		}
	};
}
