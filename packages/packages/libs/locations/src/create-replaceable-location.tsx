import * as React from 'react';
import { type PropsWithChildren } from 'react';

import {
	createGetInjections,
	createSubscription,
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
	const { subscribe, notify } = createSubscription();

	const getInjections = createGetInjections( injections );
	const useInjections = createUseInjections( getInjections, subscribe );
	const Slot = createReplaceable( useInjections );
	const inject = createRegister( injections, notify );

	// Push the clear function to the flushInjectionsFns array, so we can flush all injections at once.
	// `notify()` is called too, so any mounted `Slot` (and its cached snapshot) reflects the flush,
	// which matters for test isolation between test cases.
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
