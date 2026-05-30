import * as React from 'react';
import { type PropsWithChildren } from 'react';

import {
	createGetInjections,
	createUseInjections,
	DEFAULT_PRIORITY,
	flushInjectionsFns,
	wrapInjectedComponent,
} from './injections';
import {
	type AnyProps,
	type Id,
	type ReplaceableInjectArgs,
	type ReplaceableInjection,
	type ReplaceableLocation,
} from './types';

type ReplaceableInjectionsMap< TProps extends object = AnyProps > = Map< Id, ReplaceableInjection< TProps > >;

export function createReplaceableLocation< TProps extends object = AnyProps >(): ReplaceableLocation< TProps > {
	const injections: ReplaceableInjectionsMap< TProps > = new Map();
	const listeners = new Set< () => void >();

	const subscribe = ( listener: () => void ) => {
		listeners.add( listener );
		return () => listeners.delete( listener );
	};

	const notify = () => listeners.forEach( ( l ) => l() );

	const getInjections = createGetInjections( injections );
	const useInjections = createUseInjections( getInjections, subscribe );
	const Slot = createReplaceable( useInjections );
	const inject = createRegister( injections, notify );

	flushInjectionsFns.push( () => {
		injections.clear();
		notify();
	} );

	return {
		getInjections,
		useInjections,
		inject,
		Slot,
	};
}

function createReplaceable< TProps extends PropsWithChildren< object > = AnyProps >(
	useInjections: ReplaceableLocation< TProps >[ 'useInjections' ]
) {
	return ( props: TProps ) => {
		const injections = useInjections();

		const { component: Component } = injections.find( ( { condition } ) => condition?.( props ) ) ?? {};

		if ( ! Component ) {
			return props.children;
		}

		return <Component { ...props } />;
	};
}

function createRegister< TProps extends object = AnyProps >(
	injections: ReplaceableInjectionsMap< TProps >,
	notify: () => void
) {
	return ( { component, id, condition = () => true, options = {} }: ReplaceableInjectArgs< TProps > ) => {
		injections.set( id, {
			id,
			component: wrapInjectedComponent( component ),
			condition,
			priority: options.priority ?? DEFAULT_PRIORITY,
		} );

		notify();
	};
}
