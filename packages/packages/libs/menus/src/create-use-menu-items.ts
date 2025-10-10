import { type ComponentType, useMemo } from 'react';

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
	locations: LocationsMap< MenuGroups< TGroups > >
): UseMenuItems< TGroups > {
	return () => {
		// Normalize the injections groups to an object with the groups as keys.
		return useMemo( () => {
			return Object.entries( locations ).reduce( ( carry, [ groupName, location ] ) => {
				const items = location.getInjections().map( ( injection ) => ( {
					id: injection.id,
					MenuItem: injection.component,
				} ) );

				return {
					...carry,
					[ groupName ]: items,
				};
			}, {} as GroupedMenuItems< TGroups > );
		}, [] );
	};
}
