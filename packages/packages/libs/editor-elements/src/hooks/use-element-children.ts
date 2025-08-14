import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getContainer } from '../sync/get-container';
import { type ElementID } from '../types';

type ElementModel = {
	id: string;
};

export type ElementChildren = Record< string, ElementModel[] >;

export function useElementChildren< T extends ElementChildren >(
	elementId: ElementID,
	childrenTypes: ( keyof T & string )[]
): T {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/update' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const container = getContainer( elementId );

			const children = container?.children || [];

			return childrenTypes.reduce( ( acc, type ) => {
				const childElements = children
					.filter( ( child ) => child.model?.get( 'widgetType' ) === type )
					.map( ( child ) => ( { id: child.id } ) );

				if ( childElements ) {
					acc[ type ] = childElements;
				}

				return acc;
			}, {} as ElementChildren );
		},
		[ elementId ]
	) as T;
}
