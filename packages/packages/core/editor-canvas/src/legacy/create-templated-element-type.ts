import type { V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver, type PropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

type CreateTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: TemplatedElementConfig;
};

type TemplatedElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
>;

export function createTemplatedElementType( { type, renderer, element }: CreateTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	const propsResolver = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createTemplatedElementViewClassDeclaration( {
				type,
				renderer,
				propsResolver,
				baseStylesDictionary: element.base_styles_dictionary,
				templateKey: element.twig_main_template,
			} );
		}
	};
}

export function canBeTemplated( element: Partial< TemplatedElementConfig > ): element is TemplatedElementConfig {
	return !! (
		element.atomic_props_schema &&
		element.twig_templates &&
		element.twig_main_template &&
		element.base_styles_dictionary
	);
}

type CreateViewOptions = {
	type: string;
	renderer: DomRenderer;
	propsResolver: PropsResolver;
	templateKey: string;
	baseStylesDictionary: Record< string, string >;
};

function createTemplatedElementViewClassDeclaration( {
	type,
	renderer,
	propsResolver: resolveProps,
	templateKey,
	baseStylesDictionary,
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

			this.#abortController?.abort();
			this.#abortController = new AbortController();

			const process = signalizedProcess( this.#abortController.signal )
				.then( ( _, signal ) => {
					const settings = this.model.get( 'settings' ).toJSON();

					return resolveProps( {
						props: settings,
						signal,
					} );
				} )
				.then( ( resolvedSettings ) => {
					// Same as the Backend.
					const context = {
						id: this.model.get( 'id' ),
						type,
						settings: resolvedSettings,
						base_styles: baseStylesDictionary,
					};

					return renderer.render( templateKey, context );
				} )
				.then( ( html ) => this.$el.html( html ) );

			await process.execute();

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
