import { type Element, type ElementType, getElementType, type V1Element } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { findWidgetPart } from './find-widget-part';

export type WidgetPartElement = {
	element: Element;
	elementType: ElementType;
	settings: Record< string, AnyTransformable | null >;
};

export function useWidgetPartElement( root: V1Element, part: string ): WidgetPartElement | null {
	return useListenTo(
		[
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
		],
		() => getWidgetPartElement( root, part ),
		[ root, part ]
	);
}

function getWidgetPartElement( root: V1Element, part: string ): WidgetPartElement | null {
	const container = findWidgetPart( root, part );
	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );
	const elementType = type ? getElementType( type ) : null;

	if ( ! container || ! type || ! elementType ) {
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
