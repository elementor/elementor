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

            const componentSettings = this.model.get( 'settings' ).toJSON();
			const promises = elements_data.map( async ( childElement ) => {
                
                // Handle div-block and flexbox containers
                if ( childElement.elType === 'e-div-block' || childElement.elType === 'e-flexbox' || childElement.elType === 'container') {
                    // If it's a container element, render its children
                    if ( childElement.elements && childElement.elements.length > 0 ) {
                        const childPromises = childElement.elements.map( async ( nestedElement ) => {
                            // Recursively render nested elements
                            return this._renderChildElement( nestedElement, componentSettings );
                        } );
                        
                        const renderedChildren = await Promise.all( childPromises );

                        let classes = '';
                        if (childElement.elType === 'e-div-block' || childElement.elType === 'e-flexbox') {
                            classes += childElement.settings.classes?.value?.join(' ');
                        }
                        
                        return `<div class="${classes}">${renderedChildren.join('')}</div>`;
                    }
                    
                    // Empty container
                    return `<div class="e-con ${childElement.elType === 'e-flexbox' ? 'e-flex' : ''}"></div>`;
                }

                if ( childElement.elType !== 'widget' ) {
                    return '';
                }
                
                return this._renderChildElement( childElement, componentSettings );
			} );

			const renderedElements = await Promise.all( promises );
			this.$el.html( '<div class="e-component">' + renderedElements.join( '' ) + '</div>' );

			this.#afterRenderTemplate();
		}

		async _renderChildElement( childElement: any, componentSettings: any ) {
            console.log( childElement.widgetType );
            const childElementConfig = config[ childElement.widgetType ];

            if ( !childElementConfig || !childElementConfig.atomic_props_schema ) {
                console.log( 'no config', childElement.widgetType );
                return '';
            }

            const props = { ...childElement.settings };

            // Overrides - hardcoded check for POC
            const image_id = "414a53c";
            const name_id = "87d3ef6";
            const title_id = "c8cb872";
            
            if (childElement.id === name_id && componentSettings.name) {
                props.title = componentSettings.name;
            }
            if (childElement.id === image_id && componentSettings['profile-image']) {
                props.image = componentSettings['profile-image'];
            }
            if (childElement.id === title_id && componentSettings.title) {
                props.title = componentSettings.title;
            }

            console.log( childElement.widgetType, props );
            const propsResolver = createPropsResolver( {
                transformers: settingsTransformersRegistry,
                schema: childElementConfig.atomic_props_schema,
            } );

            const resolvedSettings = await propsResolver( {
                props,
            } );

            // Same as the Backend.
            const context = {
                id: childElement.id,
                type: childElement.widgetType,
                settings: resolvedSettings,
                base_styles: childElementConfig.base_styles_dictionary,
            };

            console.log( context );

            const templateKey = childElementConfig.twig_main_template!;
            const html = await renderer.render( templateKey, context );

            console.log( childElement.widgetType, html );
            return html;
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
