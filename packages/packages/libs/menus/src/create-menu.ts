import { createLocation } from '@elementor/locations';
import { capitalize } from '@elementor/utils';

import { createRegisterItem, type RegisterItem } from './create-register-item';
import { createUseMenuItems, type UseMenuItems } from './create-use-menu-items';
import { type Components, type LocationsMap, type MenuGroups } from './types';

export type Menu< TComponents extends Components, TGroups extends string > = {
	useMenuItems: UseMenuItems< TGroups >;
} & RegisterFns< TGroups, TComponents >;

type Subscription = {
	subscribe: ( listener: () => void ) => () => void;
	notify: () => void;
};

function createSubscription(): Subscription {
	const listeners = new Set< () => void >();

	return {
		subscribe: ( listener ) => {
			listeners.add( listener );
			return () => listeners.delete( listener );
		},
		notify: () => listeners.forEach( ( listener ) => listener() ),
	};
}

export function createMenu< TComponents extends Components, TGroups extends string = 'default' >( {
	groups = [],
	components,
}: {
	groups?: TGroups[];
	components: TComponents;
} ): Menu< TComponents, TGroups > {
	const locations = createLocations< MenuGroups< TGroups > >( [ ...groups, 'default' ] );
	const { subscribe, notify } = createSubscription();

	const registerFns = createRegisterFns( locations, components, notify );
	const useMenuItems = createUseMenuItems( locations, subscribe );

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
	components: TComponents,
	notify: () => void
) {
	return Object.entries( components ).reduce(
		( acc, [ key, component ] ) => {
			const name = `register${ capitalize( key ) }`;

			return {
				...acc,
				[ name ]: createRegisterItem( locations, component, notify ),
			};
		},
		{} as RegisterFns< TGroups, TComponents >
	);
}
