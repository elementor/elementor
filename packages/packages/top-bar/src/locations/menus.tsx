import * as React from 'react';
import { ComponentPropsWithoutRef, ElementType, useMemo } from 'react';
import { inject, useInjectionsOf } from '@elementor/locations';
import Action from '../components/actions/action';
import ToggleAction from '../components/actions/toggle-action';
import Link from '../components/actions/link';

type MenuName = string;
type GroupName = string;

type Menu<TGroup extends GroupName = 'default'> = {
	name: MenuName,
	groups: TGroup[],
};

type MenuWithOptionalGroups<TGroup extends GroupName> = Omit<Menu<TGroup>, 'groups'> & { groups?: TGroup[] };

type MenuGroup<TGroup extends GroupName> = TGroup | 'default';

type GroupedItems<TGroup extends GroupName> = Record<MenuGroup<TGroup>, Array<{ id: string, MenuItem: ElementType }>>;

type MenuItem<
	TGroup extends GroupName,
	TComponent extends ElementType,
> = {
	name: string,
	group?: TGroup,
	priority?: number,
	overwrite?: boolean,
} & (
	{ props: ComponentPropsWithoutRef<TComponent>, useProps?: never } |
	{ useProps: () => ComponentPropsWithoutRef<TComponent>, props?: never }
)

export function createMenu<TGroup extends GroupName = 'default'>( { name: menuName, groups = [] }: MenuWithOptionalGroups<TGroup> ) {
	const menuGroups: MenuGroup<TGroup>[] = [
		...groups,
		'default' as const,
	];

	const registerAction = createRegisterMenuItem( {
		menuName,
		menuGroups,
		component: Action,
	} );

	const registerToggleAction = createRegisterMenuItem( {
		menuName,
		menuGroups,
		component: ToggleAction,
	} );

	const registerLink = createRegisterMenuItem( {
		menuName,
		menuGroups,
		component: Link,
	} );

	const useMenuItems = createUseMenuItems( {
		menuName,
		menuGroups,
	} );

	return {
		registerAction,
		registerToggleAction,
		registerLink,
		useMenuItems,
	};
}

function createRegisterMenuItem<
	TMenuName extends MenuName,
	TGroup extends GroupName,
	TComponent extends ElementType,
>( { menuName, menuGroups, component }: {
	menuName: TMenuName,
	menuGroups: MenuGroup<TGroup>[],
	component: TComponent,
} ) {
	return ( { group = 'default', name, overwrite, priority, ...args }: MenuItem<MenuGroup<TGroup>, TComponent> ) => {
		if ( ! menuGroups.includes( group ) ) {
			return;
		}

		const useProps = 'props' in args ? () => args.props : args.useProps;

		const Component = component as ElementType;

		const Filler = ( props: object ) => {
			const componentProps = useProps();

			return <Component { ...props } { ...componentProps } />;
		};

		const location = getMenuLocationId( menuName, group );

		inject( {
			location,
			name,
			filler: Filler,
			options: {
				priority,
				overwrite,
			},
		} );
	};
}

function createUseMenuItems<
	TMenuName extends MenuName,
	TGroup extends GroupName,
>( { menuName, menuGroups }: {
	menuName: TMenuName,
	menuGroups: MenuGroup<TGroup>[],
} ) {
	const locations = menuGroups.map( ( group ) => getMenuLocationId( menuName, group ) );

	return () => {
		const injectionsGroups = useInjectionsOf( locations );

		// Normalize the injections groups to an object with the groups as keys.
		return useMemo( () => {
			return injectionsGroups.reduce<GroupedItems<TGroup>>( ( acc, injections, index ) => {
				const groupName = menuGroups[ index ];

				return {
					...acc,
					[ groupName ]: injections.map( ( injection ) => ( {
						id: injection.id,
						MenuItem: injection.filler,
					} ) ),
				};
			}, {} as GroupedItems<TGroup> );
		}, [ injectionsGroups ] );
	};
}

function getMenuLocationId( menu: MenuName, group: GroupName ) {
	return `editor/top-bar/${ menu }/${ group }` as const;
}
