import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import {
	createAfterRender,
	createBeforeRender,
	createTwigRenderSetup,
	renderChildrenWithOptimization,
	renderTwigTemplate,
	type TwigViewInterface,
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

	const setup = createTwigRenderSetup( { renderer, element } );

	return class extends BaseView {
		_abortController: AbortController | null = null;

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
			setup.cacheState.invalidate();
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
			await renderChildrenWithOptimization( {
				children: this.children,
				domUpdateWasSkipped: setup.cacheState.domUpdateWasSkipped,
				renderNewChildren: () => super._renderChildren(),
			} );
		}

		async _renderTemplate() {
			await renderTwigTemplate( {
				view: this,
				signal: this._abortController?.signal,
				setup,
				buildContext: ( resolvedSettings ) => ( {
					id: this.model.get( 'id' ),
					type,
					settings: resolvedSettings,
					base_styles: setup.baseStylesDictionary,
				} ),
				attachContent: ( html: string ) => this.$el.html( html ),
				transformSettings: ( settings ) => this.afterSettingsResolve( settings ),
			} );
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
