import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getContainer } from '../sync/get-container';
import { type ElementID } from '../types';

export type ElementModel = {
	id: string;
};

export type ElementChildren = Record< string, ElementModel[] >;

export function useElementChildren< T extends ElementChildren >(
	elementId: ElementID,
	childrenTypes: Record< string, string >
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

			const elementChildren = Object.entries( childrenTypes ).reduce( ( acc, [ parentType, childType ] ) => {
				const parent = container?.children?.findRecursive?.(
					( { model } ) => model.get( 'elType' ) === parentType
				);

				const children = parent?.children ?? [];

				acc[ childType ] = children
					.filter( ( { model } ) => model.get( 'elType' ) === childType )
					.map( ( { id } ) => ( { id } ) );

				return acc;
			}, {} as ElementChildren );

			return elementChildren;
		},
		[ elementId ]
	) as T;
}
