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

import {
	getBlockedValue,
	getHtmlPropType,
	getInitialPopoverPosition,
	getInlineEditablePropertyName,
	getWidgetType,
	legacyWindow,
} from '../utils/inline-editing-utils';
import { type CreateTemplatedElementTypeOptions, createTemplatedElementView } from './create-templated-element-type';
import { type ElementType, type ElementView } from './types';

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

		getContentValue() {
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

		setContentValue( value: string | null ) {
			const settingKey = getInlineEditablePropertyName( this.container );
			const valueToSave = value ? htmlPropTypeUtil.create( value ) : null;

			this.model.get( 'settings' )?.set( settingKey, valueToSave );
		}

		getExpectedTag() {
			const widgetType = getWidgetType( this.container );

			if ( ! widgetType ) {
				return null;
			}

			const propsSchema = getElementType( widgetType )?.propsSchema;

			if ( ! propsSchema?.tag ) {
				return null;
			}

			return (
				stringPropTypeUtil.extract( this.model.get( 'settings' ).get( 'tag' ) ?? null ) ??
				stringPropTypeUtil.extract( propsSchema.tag.default ?? null ) ??
				null
			);
		}

		ensureProperValue() {
			const actualValue = this.getContentValue();
			const tagSettings = this.getExpectedTag();
			const wrappedValue = getBlockedValue( actualValue, tagSettings );

			if ( actualValue !== wrappedValue ) {
				this.setContentValue( wrappedValue );
			}
		}

		renderInlineEditor() {
			this.ensureProperValue();

			const propValue = this.getContentValue();
			const settingKey = getInlineEditablePropertyName( this.container );
			const classes = ( this.el?.children?.[ 0 ]?.classList.toString() ?? '' ) + ' strip-styles';
			const expectedTag = this.getExpectedTag();

			const setValue = ( value: string | null ) => {
				const valueToSave = value ? htmlPropTypeUtil.create( value ) : null;

				this.model.get( 'settings' )?.set( settingKey, valueToSave );
			};

			this.$el.html( '' );

			if ( this.inlineEditorRoot ) {
				this.resetInlineEditorRoot();
			}

			this.inlineEditorRoot = createRoot( this.el );

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
						expectedTag={ expectedTag }
					/>
				</ThemeProvider>
			);
		}
	};
}
