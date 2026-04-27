import { ELEMENT_STYLE_CHANGE_EVENT, type V1ElementModelProps } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { signalizedProcess } from '../utils/signalized-process';
import { createPendingElement } from './create-pending-element';
import { canBeTemplated, type TemplatedElementConfig } from './create-templated-element-type';
import {
	createAfterRender,
	createBeforeRender,
	rerenderExistingChildren,
	setupTwigRenderer,
	waitForChildrenToComplete,
} from './twig-rendering-utils';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

export type NestedTemplatedElementConfig = TemplatedElementConfig & {
	allowed_child_types?: string[];
	support_nesting: boolean;
};

export type ModelExtensions = Record< string, unknown >;

export type CreateNestedTemplatedElementTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: NestedTemplatedElementConfig;
	modelExtensions?: ModelExtensions;
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
	modelExtensions,
}: CreateNestedTemplatedElementTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Base {
		getType() {
			return type;
		}

		getView() {
			return createNestedTemplatedElementView( { type, renderer, element } );
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

function buildEditorAttributes( model: ElementView[ 'model' ] ): string {
	const id = model.get( 'id' );
	const originId = model.get( 'originId' );
	const cid = model.cid ?? '';

	const attrs: Record< string, string > = {
		'data-model-cid': cid,
		'data-interaction-id': originId ?? id,
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

type CreateNestedTemplatedElementViewOptions = Omit< CreateNestedTemplatedElementTypeOptions, 'modelExtensions' >;

export function createNestedTemplatedElementView( {
	type,
	renderer,
	element,
}: CreateNestedTemplatedElementViewOptions ): typeof ElementView {
	const legacyWindow = window as unknown as LegacyWindow;

	const { templateKey, baseStylesDictionary, resolveProps } = setupTwigRenderer( {
		type,
		renderer,
		element,
	} );

	const AtomicElementBaseView = legacyWindow.elementor.modules.elements.views.createAtomicElementBase( type );
	const parentRenderChildren = AtomicElementBaseView.prototype._renderChildren;
	const parentOpenEditingPanel = AtomicElementBaseView.prototype._openEditingPanel;
	const parentAddElement = AtomicElementBaseView.prototype.addElement;

	return AtomicElementBaseView.extend( {
		_abortController: null as AbortController | null,
		_lastResolvedSettingsHash: null as string | null,
		_domUpdateWasSkipped: false,

		template: false,

		attributes() {
			return {
				'data-model-cid': this.model.cid,
			};
		},

		getTemplateType() {
			return 'twig';
		},

		invalidateRenderCache() {
			this._lastResolvedSettingsHash = null;
		},

		renderOnChange() {
			this.render();
		},

		render() {
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

		_beforeRender() {
			createBeforeRender( this );
		},

		_onTemplateReady() {
			this.dispatchPreviewEvent( 'elementor/element/render' );
		},

		_afterRender() {
			createAfterRender( this );
			this.dispatchPreviewEvent( 'elementor/element/rendered' );

			requestAnimationFrame( () => {
				this._initAlpine();
			} );

			this.model.trigger( 'render:complete' );
			window.dispatchEvent( new CustomEvent( ELEMENT_STYLE_CHANGE_EVENT ) );
		},

		async _renderTemplate() {
			const model = this.model;

			this.triggerMethod( 'before:render:template' );

			const process = signalizedProcess( this._abortController?.signal as AbortSignal )
				.then( ( _, signal ) => {
					const settings = model.get( 'settings' ).toJSON();
					return resolveProps( {
						props: settings,
						signal,
						renderContext: this.getResolverRenderContext?.(),
					} );
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
						id: model.get( 'id' ),
						interaction_id: this.getInteractionId(),
						type,
						settings,
						base_styles: baseStylesDictionary,
						editor_attributes: buildEditorAttributes( model ),
						editor_classes: buildEditorClasses( model ),
					};

					return renderer.render( templateKey, context );
				} )
				.then( ( html ) => {
					if ( html === null ) {
						return;
					}

					this._attachTwigContent( html );
				} );

			await process.execute();

			this.bindUIElements();

			this.triggerMethod( 'render:template' );
		},

		getRenderContext() {
			return this._parent?.getRenderContext?.();
		},

		getResolverRenderContext() {
			return this._parent?.getResolverRenderContext?.();
		},

		getChildType(): string[] {
			const allowedTypes = element.allowed_child_types ?? [];

			if ( allowedTypes && allowedTypes.length > 0 ) {
				return allowedTypes;
			}

			return AtomicElementBaseView.prototype.getChildType.call( this );
		},

		_attachTwigContent( html: string ) {
			const $newContent = legacyWindow.jQuery( html );
			const oldEl = this.$el.get( 0 );
			const newEl = $newContent.get( 0 );

			if ( ! oldEl || ! newEl ) {
				return;
			}

			this._destroyAlpine();

			const overlayHTML = this.getHandlesOverlay()?.get( 0 )?.outerHTML ?? '';
			const needsTagSwap = oldEl.tagName !== newEl.tagName;
			const targetEl = needsTagSwap ? ( oldEl.ownerDocument ?? document ).createElement( newEl.tagName ) : oldEl;

			Array.from( newEl.attributes ).forEach( ( attr ) => {
				targetEl.setAttribute( attr.name, attr.value );
			} );

			targetEl.setAttribute( 'draggable', 'true' );
			targetEl.innerHTML = overlayHTML + newEl.innerHTML;

			if ( needsTagSwap ) {
				oldEl.replaceWith( targetEl );
				this.setElement( legacyWindow.jQuery( targetEl as unknown as string ) );
			}
		},

		async _renderChildren() {
			if ( this._shouldReuseChildren() ) {
				rerenderExistingChildren( this );
			} else {
				parentRenderChildren.call( this );
			}

			await waitForChildrenToComplete( this );
			this._removeChildrenPlaceholder();
		},

		_shouldReuseChildren() {
			return this._domUpdateWasSkipped && this.children?.length > 0;
		},

		_removeChildrenPlaceholder() {
			const el = this.$el.get( 0 );
			if ( ! el ) {
				return;
			}

			const placeholderComment = Array.from( el.childNodes ).find(
				( node ) =>
					node.nodeType === Node.COMMENT_NODE && node.nodeValue?.trim() === 'elementor-children-placeholder'
			);

			placeholderComment?.remove();
		},

		getChildViewContainer() {
			this.childViewContainer = '';
			return this.$el;
		},

		attachBuffer( _collectionView: ElementView, buffer: DocumentFragment ) {
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
				// Insert children at the placeholder location and remove the placeholder
				placeholderComment.parentNode?.insertBefore( buffer, placeholderComment );
				placeholderComment.remove();
			} else {
				// Fallback: append to root
				el.append( buffer );
			}
		},

		getDomElement() {
			return this.$el;
		},

		onBeforeDestroy() {
			this._abortController?.abort();
		},

		onDestroy() {
			this.dispatchPreviewEvent( 'elementor/element/destroy' );
		},

		_destroyAlpine() {
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

		_initAlpine() {
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

		_doAfterRender( callback: () => void ) {
			if ( this.isRendered ) {
				callback();
			} else {
				this.once( 'render', callback );
			}
		},

		_openEditingPanel( options?: { scrollIntoView: boolean } ) {
			this._doAfterRender( () => parentOpenEditingPanel.call( this, options ) );
		},

		addElement( data: Partial< V1ElementModelProps >, options?: { edit?: boolean; at?: number } ) {
			if ( this.isRendered ) {
				return parentAddElement.call( this, data, options );
			}

			return createPendingElement( this, data, options );
		},

		getInteractionId() {
			const originId = this.model.get( 'originId' );
			const id = this.model.get( 'id' );

			return originId ?? id;
		},
	} ) as unknown as typeof ElementView;
}
