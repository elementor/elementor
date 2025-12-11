import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';
import { getElementType } from '@elementor/editor-elements';
import {
	htmlPropTypeUtil,
	stringPropTypeUtil,
	type StringPropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { ThemeProvider } from '@elementor/editor-ui';

import { getHtmlPropType, getInlineEditablePropertyName, getWidgetType } from '../utils/inline-editing-utils';
import { type CreateTemplatedElementTypeOptions, createTemplatedElementView } from './create-templated-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

const legacyWindow = window as unknown as LegacyWindow;

export function createInlineEditingElementType( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType {
	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createInlineEditingElementView( {
				type,
				renderer,
				element,
			} );
		}
	};
}

export function createInlineEditingElementView( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementView {
	const TemplatedView = createTemplatedElementView( { type, renderer, element } );

	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	return class extends TemplatedView {
		inlineEditorRoot: Root | null = null;
		handlerAttached = false;

		render() {
			if ( this.inlineEditorRoot ) {
				this.resetInlineEditorRoot();
			}

			if ( ! this.isValueDynamic() && ! this.handlerAttached ) {
				this.$el.on( 'dblclick', '*', this.handleRenderInlineEditor.bind( this ) );
				this.handlerAttached = true;
			}

			TemplatedView.prototype.render.apply( this );
		}

		handleRenderInlineEditor( event: Event ) {
			event.stopPropagation();
			this.$el.off( 'dblclick', '*' );
			this.handlerAttached = false;

			if ( ! this.isValueDynamic() ) {
				this.renderInlineEditor();
			}
		}

		handleUnmountInlineEditor( event: Event ) {
			event.stopPropagation();
			this.unmountInlineEditor();
		}

		onDestroy( ...args: unknown[] ) {
			this.resetInlineEditorRoot();
			TemplatedView.prototype.onDestroy.apply( this, args );
		}

		resetInlineEditorRoot() {
			this.$el.off( 'dblclick', '*' );
			this.handlerAttached = false;
			this.inlineEditorRoot?.unmount?.();
			this.inlineEditorRoot = null;
		}

		unmountInlineEditor() {
			this.resetInlineEditorRoot();
			this.render();
		}

		isValueDynamic() {
			const settingKey = getInlineEditablePropertyName( this.container );
			const propValue = this.model.get( 'settings' )?.get( settingKey ) as TransformablePropValue< string >;

			return propValue?.$$type === 'dynamic';
		}

		getValue() {
			const prop = getHtmlPropType( this.container );
			const defaultValue = ( prop?.default as StringPropValue | null )?.value ?? '';
			const settingKey = getInlineEditablePropertyName( this.container );

			return (
				htmlPropTypeUtil.extract( this.model.get( 'settings' )?.get( settingKey ) ?? null ) ??
				htmlPropTypeUtil.extract( prop?.default ?? null ) ??
				defaultValue ??
				''
			);
		}

		getBlockedValue( value: string ) {
			const widgetType = getWidgetType( this.container );

			if ( ! widgetType ) {
				return value;
			}

			const propsSchema = getElementType( widgetType )?.propsSchema;

			if ( ! propsSchema?.tag ) {
				return value;
			}

			const expectedTag =
				stringPropTypeUtil.extract( this.model.get( 'settings' ).get( 'tag' ) ?? null ) ??
				stringPropTypeUtil.extract( propsSchema.tag.default ?? null );

			if ( ! expectedTag ) {
				return value;
			}

			const pseudoElement = document.createElement( 'div' );

			pseudoElement.innerHTML = value;

			if ( ! pseudoElement?.children.length ) {
				return `<${ expectedTag }>${ value }</${ expectedTag }>`;
			}

			const firstChild = pseudoElement.children[ 0 ];
			const lastChild = Array.from( pseudoElement.children ).slice( -1 )[ 0 ];

			if ( firstChild === lastChild && pseudoElement.textContent === firstChild.textContent ) {
				return this.compareTag( firstChild, expectedTag )
					? value
					: `<${ expectedTag }>${ firstChild.innerHTML }</${ expectedTag }>`;
			}

			if ( ! value.startsWith( `<${ expectedTag }` ) || ! value.endsWith( `</${ expectedTag }>` ) ) {
				return `<${ expectedTag }>${ value }</${ expectedTag }>`;
			}

			if ( firstChild !== lastChild || ! this.compareTag( firstChild, expectedTag ) ) {
				return `<${ expectedTag }>${ value }</${ expectedTag }>`;
			}

			return value;
		}

		ensureProperValue() {
			const actualValue = this.getValue();
			const wrappedValue = this.getBlockedValue( actualValue );
			const settingKey = getInlineEditablePropertyName( this.container );

			if ( actualValue !== wrappedValue ) {
				this.model.get( 'settings' )?.set( settingKey, htmlPropTypeUtil.create( wrappedValue ) );

				return false;
			}

			return true;
		}

		compareTag( el: Element, tag: string ) {
			return el.tagName.toUpperCase() === tag.toUpperCase();
		}

		renderInlineEditor() {
			this.ensureProperValue();

			const propValue = this.getValue();
			const settingKey = getInlineEditablePropertyName( this.container );
			const classes = ( this.el?.children?.[ 0 ]?.classList.toString() ?? '' ) + ' strip-styles';

			const setValue = ( value: string | null ) => {
				const valueToSave = value ? htmlPropTypeUtil.create( value ) : null;

				this.model.get( 'settings' )?.set( settingKey, valueToSave );
			};

			this.$el.html( '' );

			if ( this.inlineEditorRoot ) {
				this.resetInlineEditorRoot();
			}

			this.inlineEditorRoot = createRoot( this.el );

			const getInitialPopoverPosition = () => {
				const positionFallback = { left: 0, top: 0 };

				const iFrameElement = legacyWindow?.elementor?.$preview?.get( 0 );
				const iFramePosition = iFrameElement?.getBoundingClientRect() ?? positionFallback;

				const previewElement = legacyWindow?.elementor?.$previewWrapper?.get( 0 );
				const previewPosition = previewElement
					? { left: previewElement.scrollLeft, top: previewElement.scrollTop }
					: positionFallback;

				return {
					left: iFramePosition.left + previewPosition.left,
					top: iFramePosition.top + previewPosition.top,
				};
			};

			this.inlineEditorRoot.render(
				<ThemeProvider>
					<InlineEditor
						attributes={ { class: classes } }
						value={ propValue }
						setValue={ setValue }
						onBlur={ this.handleUnmountInlineEditor.bind( this ) }
						autofocus
						showToolbar
						getInitialPopoverPosition={ getInitialPopoverPosition }
						ensureBlockedValue={ this.getBlockedValue.bind( this ) }
					/>
				</ThemeProvider>
			);
		}
	};
}
