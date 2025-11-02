import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';

// @ts-ignore - Dynamic import for rich text editor
import { type ElementType, type ElementView, type LegacyWindow } from './types';

console.log( 12321232123 );
// Technically it shouldn't have a return type annotation, but for some
// reason TypeScript can't infer the types properly when emitting DTS.
//
// See: https://github.com/microsoft/TypeScript/issues/9944#issuecomment-244448079
export function createElementType( type: string ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createElementViewClassDeclaration();
		}
	};
}

export function createElementViewClassDeclaration(): typeof ElementView {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.views.Widget {
		#reactRoot: Root | null = null;
		#isEditingRichText = false;

		// Dispatch `render` event so the overlay layer will be updated
		onRender( ...args: unknown[] ) {
			super.onRender( ...args );

			this.#dispatchEvent( 'elementor/preview/atomic-widget/render' );
			this.#dispatchPreviewEvent( 'elementor/element/render' );
		}

		// Dispatch `destroy` event so the overlay layer will be updated
		onDestroy( ...args: unknown[] ) {
			super.onDestroy( ...args );

			this.#dispatchEvent( 'elementor/preview/atomic-widget/destroy' );
			this.#dispatchPreviewEvent( 'elementor/element/destroy' );
		}

		onBeforeDestroy() {}

		ui() {
			return {
				...super.ui(),
			};
		}

		renderRichTextEditor( content: string ) {
			// This will be called by _renderTemplate when in edit mode
			const container = this.$el.get( 0 );

			this.#reactRoot = this.#reactRoot ?? createRoot( container );

			const handleSave = ( html: string ) => {
				const parser = new DOMParser();
				const docHtml = parser.parseFromString( html, 'text/html' );

				this.model.get( 'settings' )?.set( 'paragraph', {
					$$type: 'string',
					value: docHtml.body.firstElementChild.innerHTML,
				} );
			};

			const formatContent = ( innerHtml: string ) => {
				const parser = new DOMParser();
				const docHtml = parser.parseFromString( innerHtml, 'text/html' );
				const nodes = Array.from( docHtml.body.childNodes );
				const length = nodes.length;

				if ( ! length ) {
					return '<span></span>';
				}

				if ( [ nodes[ 0 ].nodeType, nodes[ length - 1 ].nodeType ].includes( Node.TEXT_NODE ) ) {
					return `<span>${ innerHtml }</span>`;
				}

				return innerHtml;
			};

			const getAttributes = ( innerHtml: string ) => {
				const parser = new DOMParser();
				const docHtml = parser.parseFromString( innerHtml, 'text/html' );
				const firstElementChild = docHtml.body.firstElementChild;
				const attributes = firstElementChild?.attributes ?? [];

				return Object.fromEntries(
					Array.from( attributes ?? [] ).map( ( { name, value } ) => [ name, value ] )
				);
			};

			this.#reactRoot.render(
				<InlineEditor
					value={ content }
					setValue={ handleSave }
					attributes={ getAttributes( content ) }
					displayToolbar={ true }
					getContainer={ () => this.$el?.[ 0 ]?.querySelector( '.inline-editing-root' ) }
				/>
			);
		}

		setInlineEditing( state: boolean ) {
			this.#isEditingRichText = state;
		}

		isInlineEditing() {
			return this.#isEditingRichText;
		}

		getInitialRichTextContent(): string {
			return ( this.model.get( 'settings' )?.get( 'paragraph' )?.value as string ) ?? '<span></span>';
		}

		parseHtmlToStructure( htmlString: string ): unknown[] {
			const parser = new DOMParser();
			const doc = parser.parseFromString( htmlString, 'text/html' );
			const bodyContent = doc.body;

			const parseNode = ( node: ChildNode ): unknown | null => {
				if ( node.nodeType === Node.TEXT_NODE ) {
					const textContent = node.textContent || '';
					if ( textContent === '' ) {
						return null;
					}
					return {
						tag: null,
						content: textContent,
					};
				}

				if ( node.nodeType === Node.ELEMENT_NODE ) {
					const elem = node as Element;
					const tagName = elem.tagName.toLowerCase();
					const childNodes = Array.from( elem.childNodes );

					if ( childNodes.length === 0 ) {
						return {
							tag: tagName,
							content: '',
						};
					}

					const hasOnlyTextContent = childNodes.every( ( child ) => child.nodeType === Node.TEXT_NODE );

					if ( hasOnlyTextContent ) {
						return {
							tag: tagName,
							content: elem.textContent || '',
						};
					}

					const parsedChildren = childNodes
						.map( parseNode )
						.filter( ( child ): child is unknown => child !== null );

					return {
						tag: tagName,
						content: parsedChildren,
					};
				}

				return null;
			};

			const result = Array.from( bodyContent.childNodes )
				.map( parseNode )
				.filter( ( node ): node is unknown => node !== null );

			return result;
		}

		structureToHtml( nodes: unknown[] ): string {
			const convertNode = ( node: unknown ): string => {
				if ( ! node || typeof node !== 'object' ) {
					return '';
				}

				const typedNode = node as { tag: string | null; content: unknown };

				if ( typedNode.tag === null ) {
					return typeof typedNode.content === 'string' ? typedNode.content : '';
				}

				const tag = typedNode.tag;
				let contentHtml = '';

				if ( typeof typedNode.content === 'string' ) {
					contentHtml = typedNode.content;
				} else if ( Array.isArray( typedNode.content ) ) {
					contentHtml = typedNode.content.map( convertNode ).join( '' );
				}

				return `<${ tag }>${ contentHtml }</${ tag }>`;
			};

			return nodes.map( convertNode ).join( '' );
		}

		attributes() {
			return {
				...super.attributes(),

				// Mark the widget as atomic, so external APIs (such as the overlay layer) can reference it.
				'data-atomic': '',

				// Make the wrapper is non-existent in terms of CSS to mimic the frontend DOM tree.
				style: 'display: contents !important;',
			};
		}

		// Removes behaviors that are not needed for atomic widgets (that are implemented in the overlay layer).
		behaviors() {
			const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];

			const behaviorsAsEntries = Object.entries( super.behaviors() ).filter(
				( [ key ] ) => ! disabledBehaviors.includes( key )
			);

			return Object.fromEntries( behaviorsAsEntries );
		}

		// Change the drag handle because the $el is not the draggable element (`display: contents`).
		getDomElement() {
			return this.$el.find( ':first-child' );
		}

		// Remove the overlay, so we can use the new overlay layer.
		getHandlesOverlay() {
			return null;
		}

		#dispatchEvent( eventType: string ) {
			window.top?.dispatchEvent(
				new CustomEvent( eventType, {
					detail: { id: this.model.get( 'id' ) },
				} )
			);
		}

		#dispatchPreviewEvent( eventType: string ) {
			legacyWindow.elementor?.$preview?.[ 0 ]?.contentWindow.dispatchEvent(
				new CustomEvent( eventType, {
					detail: {
						id: this.model.get( 'id' ),
						type: this.model.get( 'widgetType' ),
						element: this.getDomElement().get( 0 ),
					},
				} )
			);
		}

		getContextMenuGroups() {
			return super.getContextMenuGroups().filter( ( group ) => group.name !== 'save' );
		}
	};
}
