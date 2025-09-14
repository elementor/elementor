import type { V1ElementConfig } from '@elementor/editor-elements';
import { type Props } from '@elementor/editor-props';
import type { StyleDefinition, StyleDefinitionID } from '@elementor/editor-styles';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver, type PropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

type CreateTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: Component;
	config: Record< string, V1ElementConfig >;
};

type Widget = {
	id: string;
	elType: string;
	widgetType: string;
	settings: Props;
	styles?: Record< StyleDefinitionID, StyleDefinition >;
	elements: Widget[];
};

export type Component = {
	elements_data: Widget[];
};

export function createComponentType( { type, renderer, element, config }: CreateTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	const propsResolver = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createComponentViewClassDeclaration( {
				type,
				renderer,
				elements_data: element.elements_data,
				config,
				propsResolver,
			} );
		}
	};
}

type CreateViewOptions = {
	type: string;
	renderer: DomRenderer;
	elements_data: Widget[];
	config: Record< string, V1ElementConfig >;
	propsResolver: PropsResolver;
};

function createComponentViewClassDeclaration( {
	elements_data,
	renderer,
	config,
	propsResolver,
}: CreateViewOptions ): typeof ElementView {
	const BaseView = createElementViewClassDeclaration();

	return class extends BaseView {
		#abortController: AbortController | null = null;

		#settingsOverrides: Map< string, unknown > = new Map();

		getSettingsOverrides() {
			return this.#settingsOverrides;
		}

		getTemplateType() {
			return 'twig';
		}

		renderOnChange() {
			this.render();
		}

		// childViewEvents = false;

		onChildviewContextMenu( childView ) {}

		// Overriding Marionette original render method to inject our renderer.
		async _renderTemplate() {
			this.#beforeRenderTemplate();

			// this.model.set('isLocked', true);

			const instanceSettings = this.model.get( 'settings' ).toJSON();

			const componentId = instanceSettings.component_id.value;
			const componentData =
				elementor.documents.documents[ componentId ]?.config ?? ( await elementor.documents.request( componentId ) );

			// const elements = this.createBackboneElementsCollection( componentData.elements );

			// const renderedElements = await this.renderContainer( elements_data[0], componentSettings );
			// this.$el.html( '<div class="e-component">' + "test" + '</div>' );
			const ElementModel = window.elementor.modules.elements.models.Element;

			const parentView = this.container?.parent?.view as
				| ( ElementView & {
						getSettingsOverrides: () => Map< string, unknown >;
				  } )
				| undefined;

			this.#settingsOverrides = new Map( [ ...( parentView?.getSettingsOverrides?.() ?? [] ) ] );

			const settings = this.model.get( 'settings' ).toJSON();

			const results = await propsResolver( {
				props: settings,
				signal: this.#abortController?.signal,
				overrides: this.#settingsOverrides,
			} );

			// const lockEl = ( el ) => {
			// 	if ( el.elements ) {
			// 		el.elements = el.elements.map( lockEl );
			// 	}
			// 	return { ...el, isLocked: false, isEditable: false };
			// };

			const lockedElements = componentData.elements;
			// .map( lockEl );
			const firstElement = new ElementModel( {
				...lockedElements[ 0 ],
				// isLocked: false
			} );

			const firstElementView = this.getChildView( firstElement );
			//
			const view = this.buildChildView( firstElement, firstElementView, { model: firstElement } );

			// Add the view to children collection
			this.children.add( view );

			// First set the container
			this.$el.html(
				`<div class="e-component elementor-${ componentId }" data-component-id="${ componentId }"></div>`
			);

			// Then render the child view properly using Elementor's mechanism
			await this.renderChildView( view, 0 );
			//
			// Move the rendered view inside the e-component container
			await this.$( '.e-component' ).append( view.$el );
			this.initDraggable();
			this.#afterRenderTemplate();
		}

		// Emulating the original Marionette behavior.
		#beforeRenderTemplate() {
			this.triggerMethod( 'before:render:template' );
		}

		#afterRenderTemplate() {
			this.bindUIElements();

			this.triggerMethod( 'render:template' );
		}
	};
}
