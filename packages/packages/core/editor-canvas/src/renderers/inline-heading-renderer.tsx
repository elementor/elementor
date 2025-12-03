/**
 * Example custom widget renderer implementation.
 *
 * Demonstrates how to replace the default heading widget rendering with an inline editor.
 * This allows users to directly edit heading text by double-clicking on the canvas.
 *
 * Key concepts:
 * 1. MountTrigger - defines when to activate (double-click in this case)
 * 2. Component - React component receives widget props and Backbone model access
 * 3. Registration - connects the renderer to a specific widget type via condition
 */
import * as React from 'react';
import { InlineEditor } from '@elementor/editor-controls';
import { getElementType, type V1Element } from '@elementor/editor-elements';
import { htmlPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';

import {
	getHtmlPropType,
	getInlineEditablePropertyName,
} from '../utils/inline-editing-utils';
import { widgetRendererRegistry, type MountTrigger, type WidgetRendererProps } from '../widget-renderer-location';

/**
 * Trigger function that activates the inline editor on double-click.
 */
const dblClickMountTrigger: MountTrigger = ( { $el, mount } ) => {
	$el.on( 'dblclick', '*', ( event: Event ) => {
		event.stopImmediatePropagation();
		$el.off( 'dblclick', '*' );
		mount();
	} );
};

/**
 * Custom renderer component for atomic-heading widget.
 * Renders an inline editor that syncs with the Backbone model.
 */
function InlineHeadingRenderer( { container, model, onUnmount }: WidgetRendererProps ) {
	const typedContainer = container as V1Element | null;
	const prop = getHtmlPropType( typedContainer );
	const settingKey = getInlineEditablePropertyName( typedContainer );

	const settingValue =
		htmlPropTypeUtil.extract( ( model as any ).get( 'settings' )?.get( settingKey ) ?? null ) ??
		htmlPropTypeUtil.extract( prop?.default ?? null ) ??
		'';

	const setValue = ( value: string ) => {
		( model as any ).get( 'settings' )?.set( settingKey, htmlPropTypeUtil.create( value ) );
	};

	const formatValue = () => {
		const propsSchema = getElementType( 'atomic-heading' )?.propsSchema;

		if ( ! propsSchema?.tag ) {
			return settingValue;
		}

		const tag =
			stringPropTypeUtil.extract( ( model as any ).get( 'settings' ).get( 'tag' ) ?? null ) ??
			stringPropTypeUtil.extract( propsSchema.tag.default ?? null );

		if ( ! tag || settingValue?.trim().startsWith( `<${ tag }` ) ) {
			return settingValue;
		}

		return `<${ tag }>${ settingValue }</${ tag }>`;
	};

	return (
		<InlineEditor
			value={ formatValue() }
			setValue={ setValue }
			onBlur={ onUnmount }
			autofocus
		/>
	);
}

/**
 * Registers the inline heading renderer with the widget renderer registry.
 * This should be called during application initialization.
 *
 * Registration config:
 * - id: unique identifier for this renderer
 * - condition: determines which widgets this renderer applies to
 * - component: the React component to render
 * - mountTrigger: optional custom trigger (defaults to double-click if omitted)
 */
export function registerInlineHeadingRenderer() {
	widgetRendererRegistry.register( {
		id: 'inline-heading-renderer',
		condition: ( { widgetType } ) => widgetType === 'atomic-heading',
		component: InlineHeadingRenderer,
		mountTrigger: dblClickMountTrigger,
	} );
}

