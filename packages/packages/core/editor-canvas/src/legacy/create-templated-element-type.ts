import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { type TransformerRenderContext } from '../transformers/types';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

export type CreateTemplatedElementTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: TemplatedElementConfig;
};

export type TemplatedElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
>;

export function createTemplatedElementType( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createTemplatedElementView( {
				type,
				renderer,
				element,
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

export function createTemplatedElementView( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementView {
	const BaseView = createElementViewClassDeclaration();

	const templateKey = element.twig_main_template;

	const baseStylesDictionary = element.base_styles_dictionary;

	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	const resolveProps = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return class extends BaseView {
		#abortController: AbortController | null = null;
		#childrenRenderPromises: Promise< void >[] = [];

		getTemplateType() {
			return 'twig';
		}

		renderOnChange() {
			this.render();
		}

		getRenderContext(): TransformerRenderContext | undefined {
			return this._parent?.getRenderContext?.();
		}

		// Override `render` function to support async `_renderTemplate`
		// Note that `_renderChildren` asynchronity is still NOT supported, so only the parent element rendering can be async
		render() {
			this.#abortController?.abort();
			this.#abortController = new AbortController();

			const process = signalizedProcess( this.#abortController.signal )
				.then( () => this._beforeRender() )
				.then( () => this._renderTemplate() )
				.then( () => this._renderChildren() )
				.then( () => this._afterRender() );

			this._currentRenderPromise = process.execute();

			return this._currentRenderPromise;
		}

		async _renderChildren() {
			super._renderChildren();

			this.#childrenRenderPromises = [];

			this.children?.each( ( childView: ElementView ) => {
				if ( childView._currentRenderPromise ) {
					this.#childrenRenderPromises.push( childView._currentRenderPromise );
				}
			} );

			await this._waitForChildrenToComplete();
		}

		async _waitForChildrenToComplete() {
			if ( this.#childrenRenderPromises.length > 0 ) {
				await Promise.all( this.#childrenRenderPromises );
			}
		}

		// Overriding Marionette original `_renderTemplate` method to inject our renderer.
		async _renderTemplate() {
			this.triggerMethod( 'before:render:template' );

			const process = signalizedProcess( this.#abortController?.signal as AbortSignal )
				.then( ( _, signal ) => {
					const settings = this.model.get( 'settings' ).toJSON();

					return resolveProps( {
						props: settings,
						signal,
						renderContext: this.getRenderContext(),
					} );
				} )
				.then( ( settings ) => {
					return this.afterSettingsResolve( settings );
				} )
				.then( async ( settings ) => {
					// Same as the Backend.
					const context = {
						id: this.model.get( 'id' ),
						type,
						settings,
						base_styles: baseStylesDictionary,
					};

					return renderer.render( templateKey, context );
				} )
				.then( ( html ) => this.$el.html( html ) );

			await process.execute();

			this.bindUIElements();

			this.triggerMethod( 'render:template' );
		}

		afterSettingsResolve( settings: { [ key: string ]: unknown } ) {
			return settings;
		}

		_beforeRender() {
			this._ensureViewIsIntact();

			this._isRendering = true;

			this.resetChildViewContainer();

			this.triggerMethod( 'before:render', this );
		}

		_afterRender() {
			this._isRendering = false;
			this.isRendered = true;

			this.triggerMethod( 'render', this );
			this.afterRenderResolve();
		}

		afterRenderResolve() {}
	};
}
