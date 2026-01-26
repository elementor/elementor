import { ELEMENT_CHILDREN_RENDERED_EVENT, ELEMENT_STYLE_CHANGE_EVENT } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { signalizedProcess } from '../utils/signalized-process';
import { canBeTemplated, type TemplatedElementConfig } from './create-templated-element-type';
import {
	createAfterRender,
	createBeforeRender,
	renderTwigTemplate,
	setupTwigRenderer,
	type TwigRenderContext,
	type TwigViewInterface,
} from './twig-rendering-utils';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

export type NestedTemplatedElementConfig = TemplatedElementConfig & {
	support_nesting: boolean;
};

export type ViewExtensions = Record< string, unknown >;

export type CreateNestedTemplatedElementTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: NestedTemplatedElementConfig;
	viewExtensions?: ViewExtensions;
	modelExtensions?: ViewExtensions;
};

export function canBeNestedTemplated(
	element: Partial< NestedTemplatedElementConfig >
): element is NestedTemplatedElementConfig {
	return canBeTemplated( element ) && 'support_nesting' in element && !! element.support_nesting;
}

export function createNestedTemplatedElementType( {
	type,
	renderer,
	element,
	viewExtensions,
	modelExtensions,
}: CreateNestedTemplatedElementTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Base {
		getType() {
			return type;
		}

		getView() {
			return createNestedTemplatedElementView( { type, renderer, element, viewExtensions } );
		}

		getModel() {
			const BaseModel = legacyWindow.elementor.modules.elements.models.AtomicElementBase;

			if ( modelExtensions && Object.keys( modelExtensions ).length > 0 ) {
				return BaseModel.extend( modelExtensions ) as typeof BaseModel;
			}

			return BaseModel;
		}
	};
}

type JQueryElement = ReturnType< ElementView[ 'getDomElement' ] >;

interface NestedTwigView extends TwigViewInterface {
	setElement: ( element: JQueryElement ) => void;
	dispatchPreviewEvent: ( eventName: string ) => void;
	getHandlesOverlay: () => JQueryElement | null;
	_beforeRender: () => void;
	_onTemplateReady: () => void;
	_afterRender: () => void;
	_renderTemplate: () => Promise< void >;
	_renderChildren: () => Promise< void >;
	_attachTwigContent: ( html: string ) => void;
	_destroyAlpine: () => void;
	_initAlpine: () => void;
	childViewContainer: string;
	children: ElementView[ 'children' ];
	_buildTypeSpecificContext?: ( baseContext: TwigRenderContext ) => TwigRenderContext;
}

function buildEditorAttributes( model: { get: ( key: 'id' ) => string; cid?: string } ): string {
	const id = model.get( 'id' );
	const cid = model.cid ?? '';

	const attrs: Record< string, string > = {
		'data-model-cid': cid,
		'data-interaction-id': id,
		'x-ignore': 'true',
	};

	return Object.entries( attrs )
		.map( ( [ key, value ] ) => `${ key }="${ value }"` )
		.join( ' ' );
}

function buildEditorClasses( model: { get: ( key: 'id' ) => string } ): string {
	const id = model.get( 'id' );

	return [ 'elementor-element', 'elementor-element-edit-mode', `elementor-element-${ id }` ].join( ' ' );
}

export function createNestedTemplatedElementView( {
	type,
	renderer,
	element,
	viewExtensions = {},
}: CreateNestedTemplatedElementTypeOptions ): typeof ElementView {
	const legacyWindow = window as unknown as LegacyWindow;

	const { templateKey, baseStylesDictionary, resolveProps } = setupTwigRenderer( {
		type,
		renderer,
		element,
	} );

	const AtomicElementBaseView = legacyWindow.elementor.modules.elements.views.createAtomicElementBase( type );
	const parentRenderChildren = AtomicElementBaseView.prototype._renderChildren;

	return AtomicElementBaseView.extend( {
		_abortController: null as AbortController | null,

		template: false,

		getTemplateType() {
			return 'twig';
		},

		render( this: NestedTwigView ) {
			this._abortController?.abort();
			this._abortController = new AbortController();

			const process = signalizedProcess( this._abortController.signal )
				.then( () => this._beforeRender() )
				.then( () => this._renderTemplate() )
				// Dispatch the render event after the template is ready
				.then( () => this._onTemplateReady() )
				.then( () => this._renderChildren() )
				.then( () => this._afterRender() );

			this._currentRenderPromise = process.execute();

			return this._currentRenderPromise;
		},

		_beforeRender( this: NestedTwigView ) {
			createBeforeRender( this );
		},

		_onTemplateReady( this: NestedTwigView ) {
			this.dispatchPreviewEvent( 'elementor/element/render' );
		},

		_afterRender( this: NestedTwigView ) {
			createAfterRender( this );
			this.dispatchPreviewEvent( 'elementor/element/rendered' );

			requestAnimationFrame( () => {
				this._initAlpine();
			} );

			this.model.trigger( 'render:complete' );
			window.dispatchEvent( new CustomEvent( ELEMENT_STYLE_CHANGE_EVENT ) );
		},

		async _renderTemplate( this: NestedTwigView ) {
			const model = this.model;

			await renderTwigTemplate( {
				view: this,
				signal: this._abortController?.signal as AbortSignal,
				resolveProps,
				templateKey,
				baseStylesDictionary,
				type,
				renderer,
				buildContext: ( context: TwigRenderContext ) => {
					const baseContext = {
						...context,
						editor_attributes: buildEditorAttributes( model ),
						editor_classes: buildEditorClasses( model ),
					};

					if ( this._buildTypeSpecificContext ) {
						return this._buildTypeSpecificContext( baseContext );
					}

					return baseContext;
				},
				attachContent: ( html: string ) => this._attachTwigContent( html ),
			} );
		},

		...viewExtensions,

		_attachTwigContent( this: NestedTwigView, html: string ) {
			const $newContent = legacyWindow.jQuery( html );
			const oldEl = this.$el.get( 0 );
			const newEl = $newContent.get( 0 );

			if ( ! oldEl || ! newEl ) {
				return;
			}

			this._destroyAlpine();

			Array.from( newEl.attributes ).forEach( ( attr ) => {
				oldEl.setAttribute( attr.name, attr.value );
			} );

			oldEl.setAttribute( 'draggable', 'true' );

			const overlayHTML = this.getHandlesOverlay()?.get( 0 )?.outerHTML ?? '';
			oldEl.innerHTML = overlayHTML + newEl.innerHTML;
		},

		async _renderChildren( this: NestedTwigView ) {
			parentRenderChildren.call( this );

			const renderPromises: Promise< void >[] = [];

			this.children.each( ( childView: ElementView ) => {
				if ( childView._currentRenderPromise ) {
					renderPromises.push( childView._currentRenderPromise );
				}
			} );

			await Promise.all( renderPromises );

			const elementId = this.model.get( 'id' );
			const targetEl = this.$el.get( 0 );
			const elementType = targetEl?.getAttribute( 'data-element_type' ) ?? 'unknown';

			targetEl?.dispatchEvent(
				new CustomEvent( ELEMENT_CHILDREN_RENDERED_EVENT, {
					bubbles: true,
					detail: { elementId, elementType },
				} )
			);

			// Also dispatch globally for listeners on window
			window.dispatchEvent( new CustomEvent( ELEMENT_CHILDREN_RENDERED_EVENT ) );
		},

		getChildViewContainer( this: NestedTwigView ) {
			this.childViewContainer = '';
			return this.$el;
		},

		attachBuffer( this: NestedTwigView, _collectionView: ElementView, buffer: DocumentFragment ) {
			const el = this.$el.get( 0 );
			if ( ! el ) {
				return;
			}

			// Find the placeholder comment
			const placeholderComment = Array.from( el.childNodes ).find(
				( node ) =>
					node.nodeType === Node.COMMENT_NODE && node.nodeValue?.trim() === 'elementor-children-placeholder'
			);

			if ( placeholderComment ) {
				// Insert children at the placeholder location
				placeholderComment.parentNode?.insertBefore( buffer, placeholderComment );
			} else {
				// Fallback: append to root
				el.append( buffer );
			}
		},

		getDomElement( this: NestedTwigView ) {
			return this.$el;
		},

		onBeforeDestroy( this: NestedTwigView ) {
			this._abortController?.abort();
		},

		onDestroy( this: NestedTwigView ) {
			this.dispatchPreviewEvent( 'elementor/element/destroy' );
		},

		_destroyAlpine( this: NestedTwigView ) {
			const el = this.$el.get( 0 );
			if ( ! el ) {
				return;
			}

			const xDataValue = el.getAttribute( 'x-data' );
			if ( ! xDataValue ) {
				return;
			}

			const previewWindow = el.ownerDocument?.defaultView as
				| ( Window & { Alpine?: { destroyTree: ( el: Element ) => void } } )
				| null;

			previewWindow?.Alpine?.destroyTree( el );
		},

		_initAlpine( this: NestedTwigView ) {
			const el = this.$el.get( 0 );
			if ( ! el ) {
				return;
			}

			el.removeAttribute( 'x-ignore' );

			const xDataValue = el.getAttribute( 'x-data' );
			if ( ! xDataValue ) {
				return;
			}

			const previewWindow = el.ownerDocument?.defaultView as
				| ( Window & { Alpine?: { initTree: ( el: Element ) => void } } )
				| null;

			previewWindow?.Alpine?.initTree( el );
		},
	} ) as unknown as typeof ElementView;
}
