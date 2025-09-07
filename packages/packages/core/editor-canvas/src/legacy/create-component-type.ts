import type { V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver, type PropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';
import { type Props } from '@elementor/editor-props';
import type { StyleDefinition, StyleDefinitionID } from '@elementor/editor-styles';

type CreateTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: Component;
    config: Record<string, V1ElementConfig>
};

type Widget = {
    id: string;
    elType: string;
    widgetType: string;
    settings: Props;
    styles?: Record<StyleDefinitionID, StyleDefinition>;
    elements: Widget[];
}

export type Component = {
    elements_data: Widget[];
}

export function createComponentType( { type, renderer, element, config}: CreateTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

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
			} );
		}
	};
}

type CreateViewOptions = {
	type: string;
	renderer: DomRenderer;
    elements_data: Widget[];
    config: Record<string, V1ElementConfig>
};

function createComponentViewClassDeclaration( {
    elements_data,
	renderer,
    config,
}: CreateViewOptions ): typeof ElementView {
	const BaseView = createElementViewClassDeclaration();

	return class extends BaseView {
		#abortController: AbortController | null = null;

		getTemplateType() {
			return 'twig';
		}

		renderOnChange() {
			this.render();
		}

		// Overriding Marionette original render method to inject our renderer.
		async _renderTemplate() {
			this.#beforeRenderTemplate();

            const instanceSettings = this.model.get( 'settings' ).toJSON();

            const componentId = instanceSettings.component_id.value;
            console.log('------------ render component instance ------------');
            console.log(componentId);
            console.log(componentId);
            const componentData = elementor.documents[componentId] ?? (await elementor.documents.request( componentId ) );

            console.log('------------ render component instance ------------');
            console.log(componentId);
            console.log(componentData);

		// const elements = this.createBackboneElementsCollection( componentData.elements );


			// const renderedElements = await this.renderContainer( elements_data[0], componentSettings );
			// this.$el.html( '<div class="e-component">' + "test" + '</div>' );
const elementModel = window.elementor.modules.elements.models.Element

const lockEl = (el) => { 
	if (el.elements) {
		el.elements = el.elements.map( lockEl );
	}
	return {
	...el, isLocked: true }
}	

		const lockedElements = componentData.elements.map( lockEl );
			const firstElement = new elementModel( {... lockedElements[0], isLocked: true } );
		const firstElementView = this.getChildView( firstElement );
		var view = this.buildChildView( firstElement, firstElementView, { model: firstElement } );

		// Add the view to children collection
		this.children.add(view);
		
		// First set the container
		this.$el.html('<div class="e-component"></div>');
		
		// Then render the child view properly using Elementor's mechanism
		await this.renderChildView(view, 0);
		
		// Move the rendered view inside the e-component container
		this.$('.e-component').append(view.$el);

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
