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
	const legacyWindow = window as unknown as LegacyWindow;

	const BaseView = createElementViewClassDeclaration();

	return class extends BaseView {
		#abortController: AbortController | null = null;

		__renderChildren: () => void;

		constructor( ...args: unknown[] ) {
			super( ...args );

			this.__renderChildren = this._renderChildren;

			this._renderChildren = () => {};
		}

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
				.then( async ( settings ) => {
					if ( settings?._children ) {
						const collection = legacyWindow.elementor.createBackboneElementsCollection(
							settings._children
						);

						this.collection = collection;
					}

					// Same as the Backend.
					const context = {
						id: this.model.get( 'id' ),
						type,
						settings,
						base_styles: baseStylesDictionary,
						children: '<template data-children-placeholder></template>',
					};

					return renderer.render( templateKey, context );
				} )
				.then( ( html ) => this.$el.html( html ) )
				.then( () => this.__renderChildren() );

			await process.execute();

			this.#afterRenderTemplate();
		}

		attachBuffer( collectionView: this, buffer: DocumentFragment ): void {
			const childrenPlaceholder = collectionView.$el.find( '[data-children-placeholder]' ).get( 0 );

			if ( ! childrenPlaceholder ) {
				super.attachBuffer( collectionView, buffer );

				return;
			}

			childrenPlaceholder.replaceWith( buffer );
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
