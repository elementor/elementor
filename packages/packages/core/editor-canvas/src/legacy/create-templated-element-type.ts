import { type ExtendedWindow, TOP_LEVEL_SINGLE_SETTING_FILTER, type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import {
	type ElementType,
	type ElementView,
	type LegacyWindow,
	type NamespacedRenderContext,
	type RenderContext,
} from './types';

export type CreateTemplatedElementTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: TemplatedElementConfig;
};

export type TemplatedElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
>;

const extendedWindow = window as ExtendedWindow;

export function createTemplatedElementType( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	const view = createTemplatedElementView( {
		type,
		renderer,
		element,
	} );

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return view;
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
		#lastResolvedSettingsHash: string | null = null;
		#domUpdateWasSkipped = false;

		getTemplateType() {
			return 'twig';
		}

		getNamespaceKey() {
			return type;
		}

		renderOnChange() {
			this.render();
		}

		getRenderContext(): NamespacedRenderContext | undefined {
			return this._parent?.getRenderContext?.();
		}

		getResolverRenderContext(): RenderContext | undefined {
			return this._parent?.getResolverRenderContext?.();
		}

		invalidateRenderCache() {
			this.#lastResolvedSettingsHash = null;
		}

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
			this.#childrenRenderPromises = [];

			// Optimize rendering by reusing existing child views instead of recreating them.
			if ( this.#shouldReuseChildren() ) {
				this.#rerenderExistingChildren();
			} else {
				super._renderChildren();
			}

			this.#collectChildrenRenderPromises();
			await this._waitForChildrenToComplete();
		}

		#shouldReuseChildren() {
			return this.#domUpdateWasSkipped && this.children?.length > 0;
		}

		#rerenderExistingChildren() {
			this.children?.each( ( childView: ElementView ) => {
				childView.render();
			} );
		}

		#collectChildrenRenderPromises() {
			this.children?.each( ( childView: ElementView ) => {
				if ( childView._currentRenderPromise ) {
					this.#childrenRenderPromises.push( childView._currentRenderPromise );
				}
			} );
		}

		async _waitForChildrenToComplete() {
			if ( this.#childrenRenderPromises.length > 0 ) {
				await Promise.all( this.#childrenRenderPromises );
			}
		}

		async _renderTemplate() {
			this.triggerMethod( 'before:render:template' );

			const process = signalizedProcess( this.#abortController?.signal as AbortSignal )
				.then( ( _, signal ) => {
					const settings = this.model.get( 'settings' ).toJSON();
					return resolveProps( {
						props: this.filterSettings( settings ),
						signal,
						renderContext: this.getResolverRenderContext(),
					} );
				} )
				.then( ( settings ) => {
					return this.afterSettingsResolve( settings );
				} )
				.then( async ( settings ) => {
					const settingsHash = JSON.stringify( settings );
					const settingsChanged = settingsHash !== this.#lastResolvedSettingsHash;

					if ( ! settingsChanged && this.isRendered ) {
						this.#domUpdateWasSkipped = true;
						return null;
					}
					this.#domUpdateWasSkipped = false;

					this.#lastResolvedSettingsHash = settingsHash;

					const context = {
						id: this.model.get( 'id' ),
						type,
						settings,
						base_styles: baseStylesDictionary,
					};

					return renderer.render( templateKey, context );
				} )
				.then( ( html ) => {
					if ( html === null ) {
						return;
					}

					this.$el.html( html );
				} );

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
		}

		filterSettings( settings: { [ key: string ]: unknown } ) {
			return Object.entries( settings ).reduce( ( newSettings, [ settingKey, settingValue ] ) => {
				const formattedValue = extendedWindow.elementor?.hooks?.applyFilters
					? extendedWindow.elementor.hooks?.applyFilters( TOP_LEVEL_SINGLE_SETTING_FILTER, settingValue )
					: settingValue;

				return { ...newSettings, [ settingKey ]: formattedValue };
			}, {} );
		}
	};
}
