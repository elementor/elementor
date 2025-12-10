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

export function createInlineEditingElementType( {
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

		render() {
			if ( this.inlineEditorRoot ) {
				this.resetInlineEditorRoot();
			}

			if ( ! this.isValueDynamic() ) {
				this.$el.on( 'dblclick', '*', this.handleRenderInlineEditor.bind( this ) );
			}

			TemplatedView.prototype.render.apply( this );
		}

		handleRenderInlineEditor( event: Event ) {
			event.stopImmediatePropagation();
			this.$el.off( 'dblclick', '*' );

			if ( ! this.isValueDynamic() ) {
				this.renderInlineEditor();
			}
		}

		handleUnmountInlineEditor( event: Event ) {
			event.stopImmediatePropagation();
			this.unmountInlineEditor();
		}

		renderInlineEditor() {
			const prop = getHtmlPropType( this.container );
			const defaultValue = ( prop?.default as StringPropValue | null )?.value ?? '';
			const settingKey = getInlineEditablePropertyName( this.container );
			const settingValue =
				htmlPropTypeUtil.extract( this.model.get( 'settings' )?.get( settingKey ) ?? null ) ??
				htmlPropTypeUtil.extract( prop?.default ?? null ) ??
				defaultValue ??
				'';
			const classes = this.el?.children?.[ 0 ]?.classList.toString();

			const setValue = ( value: string ) => {
				this.model.get( 'settings' )?.set( settingKey, htmlPropTypeUtil.create( value ) );
			};

			this.$el.html( '' );

			if ( ! this.inlineEditorRoot ) {
				this.inlineEditorRoot = createRoot( this.el );
			} else {
				this.resetInlineEditorRoot();
			}

			const formatValue = () => {
				const widgetType = getWidgetType( this.container );

				if ( ! widgetType ) {
					return settingValue;
				}

				const propsSchema = getElementType( widgetType )?.propsSchema;

				if ( ! propsSchema?.tag ) {
					return settingValue;
				}

				const expectedTag =
					stringPropTypeUtil.extract( this.model.get( 'settings' ).get( 'tag' ) ?? null ) ??
					stringPropTypeUtil.extract( propsSchema.tag.default ?? null );

				if ( ! expectedTag ) {
					return settingValue;
				}

				const pseudoElement = document.createElement( 'div' );

				pseudoElement.innerHTML = settingValue;

				const actualTag = pseudoElement.children?.[ 0 ]?.tagName;

				if ( ! actualTag ) {
					return `<${ expectedTag }>${ settingValue }</${ expectedTag }>`;
				}

				if ( actualTag.toUpperCase() === expectedTag.toUpperCase() ) {
					return settingValue;
				}

				return `<${ expectedTag }>${ pseudoElement.children?.[ 0 ].innerHTML }</${ expectedTag }>`;
			};

			this.inlineEditorRoot.render(
				<ThemeProvider>
					<InlineEditor
						attributes={ { class: classes } }
						value={ formatValue() }
						setValue={ setValue }
						onBlur={ this.handleUnmountInlineEditor.bind( this ) }
						autofocus
						showToolbar
						stripStyle={ false }
					/>
				</ThemeProvider>
			);
		}

		onDestroy( ...args: unknown[] ) {
			this.resetInlineEditorRoot();
			TemplatedView.prototype.onDestroy.apply( this, args );
		}

		unmountInlineEditor() {
			this.resetInlineEditorRoot();
			this.render();
		}

		resetInlineEditorRoot() {
			this.$el.off( 'dblclick', '*' );
			this.inlineEditorRoot?.unmount?.();
			this.inlineEditorRoot = null;
		}

		isValueDynamic() {
			const settingKey = getInlineEditablePropertyName( this.container );

			const propValue = this.model.get( 'settings' )?.get( settingKey ) as TransformablePropValue< string >;

			return propValue?.$$type === 'dynamic';
		}
	};
}
