import { createLocation } from '@elementor/locations';

import { createRegisterItem, type RegisterItem } from './create-register-item';
import { createUseMenuItems, type UseMenuItems } from './create-use-menu-items';
import { type Components, type LocationsMap, type MenuGroups } from './types';

export type Menu< TComponents extends Components, TGroups extends string > = {
	useMenuItems: UseMenuItems< TGroups >;
} & RegisterFns< TGroups, TComponents >;

export function createMenu< TComponents extends Components, TGroups extends string = 'default' >( {
	groups = [],
	components,
}: {
	groups?: TGroups[];
	components: TComponents;
} ): Menu< TComponents, TGroups > {
	const locations = createLocations< MenuGroups< TGroups > >( [ ...groups, 'default' ] );

	const registerFns = createRegisterFns( locations, components );
	const useMenuItems = createUseMenuItems( locations );

	return {
		useMenuItems,
		...registerFns,
	};
}

function createLocations< TGroups extends string >( groups: TGroups[] ) {
	return groups.reduce( ( acc, group ) => {
		acc[ group ] = createLocation();

		return acc;
	}, {} as LocationsMap< TGroups > );
}

type RegisterFns< TGroups extends string, TComponents extends Components > = {
	[ K in keyof TComponents as `register${ Capitalize< K & string > }` ]: RegisterItem< TGroups, TComponents[ K ] >;
};

function createRegisterFns< TGroups extends string, TComponents extends Components >(
	locations: LocationsMap< MenuGroups< TGroups > >,
	components: TComponents
) {
	return Object.entries( components ).reduce(
		( acc, [ key, component ] ) => {
			const name = `register${ capitalize( key ) }`;

			return {
				...acc,
				[ name ]: createRegisterItem( locations, component ),
			};
		},
		{} as RegisterFns< TGroups, TComponents >
	);
}

function capitalize( str: string ) {
	return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
}
