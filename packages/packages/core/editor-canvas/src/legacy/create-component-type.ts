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

			const renderedElements = await this.renderContainer( elements_data[0], componentSettings );
			this.$el.html( '<div class="e-component">' + renderedElements + '</div>' );

			this.#afterRenderTemplate();
		}

		async renderContainer( containerElement: any, componentSettings: any ) {

            let renderedElements = '';

            if ( containerElement.elements.length ) {
                renderedElements = (await Promise.all( containerElement.elements.map( async ( nestedElement: any ) => {
                        switch (nestedElement.elType) {
                        case 'e-div-block':
                        case 'e-flexbox':
                        case 'container':
                            return this.renderContainer( nestedElement, componentSettings );
                        case 'widget':
                            return this.renderWidget( nestedElement, componentSettings );
                        default:
                            return '';
                    }
                } ) )).join('');            
            }
            
            let classes = 'elementor-element elementor-element-edit-mode e-con ';
            if (containerElement.elType === 'e-div-block' || containerElement.elType === 'e-flexbox') {
                classes += containerElement.settings.classes?.value?.join(' ');
                if (containerElement.elType === 'e-flexbox') {
                    classes += ' e-flexbox-base';
                } else {
                    classes += ' e-div-block-base';
                }
            } else if (containerElement.elType === 'container') {
                classes += containerElement.settings.classes?.value?.join(' ');
            }
            
            return `<div class="${classes}">${renderedElements}</div>`;
        }

		async renderWidget( widget: any, componentSettings: any ) {
            const widgetConfig = config[ widget.widgetType ];

            if ( !widgetConfig || !widgetConfig.atomic_props_schema ) {
                console.log( 'no config', widget.widgetType );
                return '';
            }

            const widgetProps = { ...widget.settings };

            // Overrides - hardcoded check for POC
            const image_id = "414a53c";
            const name_id = "87d3ef6";
            const title_id = "c8cb872";
            
            if (widget.id === name_id && componentSettings.name) {
                widgetProps.title = componentSettings.name;
            }
            if (widget.id === image_id && componentSettings['profile-image']) {
                widgetProps.image = componentSettings['profile-image'];
            }
            if (widget.id === title_id && componentSettings.title) {
                widgetProps.title = componentSettings.title;
            }
            // End of overrides

            console.log( widget.widgetType, widgetProps );
            const propsResolver = createPropsResolver( {
                transformers: settingsTransformersRegistry,
                schema: widgetConfig.atomic_props_schema,
            } );

            const resolvedSettings = await propsResolver( {
                props: widgetProps,
                
            } );

            // Same as the Backend.
            const twigContext = {
                id: widget.id,
                type: widget.widgetType,
                settings: resolvedSettings,
                base_styles: widgetConfig.base_styles_dictionary,
            };

            console.log( twigContext );

            const templateKey = widgetConfig.twig_main_template!;
            const html = await renderer.render( templateKey, twigContext );

            console.log( widget.widgetType, html );
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
