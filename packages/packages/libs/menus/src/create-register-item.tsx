import * as React from 'react';
import { type ComponentPropsWithoutRef, type ComponentType } from 'react';

import { type LocationsMap, type MenuGroups } from './types';

export type RegisterItem< TGroups extends string, TComponent extends ComponentType > = (
	args: {
		id: string;
		group?: MenuGroups< TGroups >;
		priority?: number;
		overwrite?: boolean;
	} & Props< ComponentPropsWithoutRef< TComponent > >
) => void;

type Props< TProps extends object > = unknown extends TProps ? NoProps : PropsOrUseProps< TProps >;

type NoProps = { props?: never; useProps?: never };

type PropsOrUseProps< TProps extends object > =
	| { props: TProps; useProps?: never }
	| {
			useProps: () => TProps;
			props?: never;
	  };

export function createRegisterItem< TGroups extends string, TComponent extends ComponentType >(
	locations: LocationsMap< MenuGroups< TGroups > >,
	component: TComponent
): RegisterItem< TGroups, TComponent > {
	return ( { id, group = 'default', priority = 10, overwrite = false, props: _props, useProps: _useProps } ) => {
		if ( ! ( group in locations ) ) {
			return;
		}

		const Component = component as ComponentType;
		const useProps = _useProps || ( () => _props );

		const InjectedComponent = ( props: object ) => {
			const componentProps = useProps();

			return <Component { ...props } { ...componentProps } />;
		};

		locations[ group ].inject( {
			id,
			component: InjectedComponent,
			options: {
				priority,
				overwrite,
			},
		} );
	};
}
