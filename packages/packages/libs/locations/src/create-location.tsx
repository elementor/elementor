import * as React from 'react';

import {
	createGetInjections,
	createUseInjections,
	DEFAULT_PRIORITY,
	flushInjectionsFns,
	wrapInjectedComponent,
} from './injections';
import { type AnyProps, type Id, type InjectArgs, type Injection, type Location } from './types';

type InjectionsMap< TProps extends object = AnyProps > = Map< Id, Injection< TProps > >;

export function createLocation< TProps extends object = AnyProps >(): Location< TProps > {
	const injections: InjectionsMap< TProps > = new Map();

	const getInjections = createGetInjections( injections );
	const useInjections = createUseInjections( getInjections );
	const Slot = createSlot( useInjections );
	const inject = createInject( injections );

	// Push the clear function to the flushInjectionsFns array, so we can flush all injections at once.
	flushInjectionsFns.push( () => injections.clear() );

	return {
		inject,
		getInjections,
		useInjections,
		Slot,
	};
}

function createSlot< TProps extends object = AnyProps >( useInjections: Location< TProps >[ 'useInjections' ] ) {
	return ( props: TProps ) => {
		const injections = useInjections();

		return (
			<>
				{ injections.map( ( { id, component: Component } ) => (
					<Component { ...props } key={ id } />
				) ) }
			</>
		);
	};
}

function createInject< TProps extends object = AnyProps >( injections: InjectionsMap< TProps > ) {
	return ( { component, id, options = {} }: InjectArgs< TProps > ) => {
		if ( injections.has( id ) && ! options?.overwrite ) {
			// eslint-disable-next-line no-console
			console.warn(
				`An injection with the id "${ id }" already exists. Did you mean to use "options.overwrite"?`
			);

			return;
		}

		injections.set( id, {
			id,
			component: wrapInjectedComponent( component ),
			priority: options.priority ?? DEFAULT_PRIORITY,
		} );
	};
}
