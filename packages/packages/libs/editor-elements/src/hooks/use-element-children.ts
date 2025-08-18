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

			const elementChildren = childrenTypes.reduce( ( acc, type ) => {
				acc[ type ] = [];

				return acc;
			}, {} as ElementChildren );

			container?.children?.forEachRecursive?.( ( child ) => {
				const widgetType = child.model.get( 'widgetType' );
				const id = child.id;

				if ( widgetType && widgetType in elementChildren ) {
					elementChildren[ widgetType ].push( { id } );
				}
			} );

			return elementChildren;
		},
		[ elementId ]
	) as T;
}
