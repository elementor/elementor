import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import {
	createAfterRender,
	createBeforeRender,
	rerenderExistingChildren,
	setupTwigRenderer,
	type TwigViewInterface,
	waitForChildrenToComplete,
} from './twig-rendering-utils';
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

	const { templateKey, baseStylesDictionary, resolveProps } = setupTwigRenderer( {
		type,
		renderer,
		element,
	} );

	return class extends BaseView {
		_abortController: AbortController | null = null;
		_lastResolvedSettingsHash: string | null = null;
		_domUpdateWasSkipped = false;

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
			this._lastResolvedSettingsHash = null;
		}

		render() {
			this._abortController?.abort();
			this._abortController = new AbortController();

			const process = signalizedProcess( this._abortController.signal )
				.then( () => this._beforeRender() )
				.then( () => this._renderTemplate() )
				.then( () => this._renderChildren() )
				.then( () => this._afterRender() );

			this._currentRenderPromise = process.execute();

			return this._currentRenderPromise;
		}

		async _renderChildren() {
			if ( this._shouldReuseChildren() ) {
				rerenderExistingChildren( this );
			} else {
				super._renderChildren();
			}

			await waitForChildrenToComplete( this );
		}

		_shouldReuseChildren() {
			return this._domUpdateWasSkipped && this.children?.length > 0;
		}

		async _renderTemplate() {
			this.triggerMethod( 'before:render:template' );

			const process = signalizedProcess( this._abortController?.signal as AbortSignal )
				.then( ( _, signal ) => {
					const settings = this.model.get( 'settings' ).toJSON();
					return resolveProps( {
						props: settings,
						signal,
						renderContext: this.getResolverRenderContext(),
					} );
				} )
				.then( ( settings ) => {
					return this.afterSettingsResolve( settings );
				} )
				.then( async ( settings ) => {
					const settingsHash = JSON.stringify( settings );
					const settingsChanged = settingsHash !== this._lastResolvedSettingsHash;

					if ( ! settingsChanged && this.isRendered ) {
						this._domUpdateWasSkipped = true;
						return null;
					}
					this._domUpdateWasSkipped = false;

					this._lastResolvedSettingsHash = settingsHash;

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
			createBeforeRender( this as unknown as TwigViewInterface );
		}

		_afterRender() {
			createAfterRender( this as unknown as TwigViewInterface );
		}

		_doAfterRender( callback: () => void ) {
			if ( this.isRendered ) {
				callback();
			} else {
				this.once( 'render', callback );
			}
		}
		_openEditingPanel( options?: { scrollIntoView: boolean } ) {
			this._doAfterRender( () => super._openEditingPanel( options ) );
		}
	};
}
