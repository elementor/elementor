import { type Element, type ElementType, getElementType, type V1Element } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { type CompositeWidgetDefinition } from '../types';
import { findWidgetPart } from './find-widget-part';
import { getSectionFields, getSections } from './general-fields';

export type WidgetPartElement = {
	element: Element;
	elementType: ElementType;
	settings: Record< string, AnyTransformable | null >;
};

type WidgetPartElements = Record< string, WidgetPartElement | null >;

export function useWidgetPartElements( root: V1Element, definition: CompositeWidgetDefinition ): WidgetPartElements {
	return useListenTo(
		[
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
		],
		() => getWidgetPartElements( root, definition ),
		[ root, definition ]
	);
}

function getWidgetPartElements( root: V1Element, definition: CompositeWidgetDefinition ): WidgetPartElements {
	const parts = getSections( definition )
		.flatMap( getSectionFields )
		.map( ( field ) => field.target.part );

	return Object.fromEntries(
		[ ...new Set( parts ) ].map( ( part ) => [ part, getWidgetPartElement( root, part ) ] )
	);
}

function getWidgetPartElement( root: V1Element, part: string ): WidgetPartElement | null {
	const container = findWidgetPart( root, part );

	if ( ! container ) {
		return null;
	}

	const type = container.model.get( 'widgetType' ) || container.model.get( 'elType' );
	const elementType = getElementType( type );

	if ( ! elementType ) {
		return null;
	}

	return {
		element: { id: container.id, type },
		elementType,
		settings: readSettings( container, Object.keys( elementType.propsSchema ) ),
	};
}

function readSettings( container: V1Element, keys: string[] ): Record< string, AnyTransformable | null > {
	return Object.fromEntries(
		keys.map( ( key ) => [ key, ( container.settings?.get( key ) as AnyTransformable ) ?? null ] )
	);
}
