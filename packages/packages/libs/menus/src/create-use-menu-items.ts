import { type ComponentType, useSyncExternalStore } from 'react';

import { type LocationsMap, type MenuGroups } from './types';

export type UseMenuItems< TGroups extends string > = () => GroupedMenuItems< TGroups >;

type GroupedMenuItems< TGroups extends string > = Record<
	MenuGroups< TGroups >,
	Array< {
		id: string;
		MenuItem: ComponentType;
	} >
>;

export function createUseMenuItems< TGroups extends string >(
	locations: LocationsMap< MenuGroups< TGroups > >,
	subscribe: ( listener: () => void ) => () => void
): UseMenuItems< TGroups > {
	let snapshot: GroupedMenuItems< TGroups > | null = null;

	subscribe( () => {
		snapshot = null;
	} );

	const getMenuItems = () => {
		if ( snapshot ) {
			return snapshot;
		}
		snapshot = Object.entries( locations ).reduce( ( carry, [ groupName, location ] ) => {
			const items = location.getInjections().map( ( injection ) => ( {
				id: injection.id,
				MenuItem: injection.component,
			} ) );

			return {
				...carry,
				[ groupName ]: items,
			};
		}, {} as GroupedMenuItems< TGroups > );

		return snapshot;
	};

	return () => useSyncExternalStore( subscribe, getMenuItems );
}
