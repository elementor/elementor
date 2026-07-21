import * as React from 'react';
import { useSyncExternalStore } from 'react';

import InjectedComponentWrapper from './components/injected-component-wrapper';
import { type AnyProps, type Id, type InjectedComponent, type Injection, type Location } from './types';

type InjectionsMap< TProps extends object = AnyProps > = Map< Id, Injection< TProps > >;

export const DEFAULT_PRIORITY = 10;

// Allow flushing all injections at once, for testing purposes.
export const flushInjectionsFns: ( () => void )[] = [];

export function flushAllInjections() {
	flushInjectionsFns.forEach( ( flush ) => flush() );
}

export type Subscribe = ( listener: () => void ) => () => void;

export function createSubscription() {
	const listeners = new Set< () => void >();

	return {
		subscribe: ( listener: () => void ) => {
			listeners.add( listener );

			return () => listeners.delete( listener );
		},
		notify: () => listeners.forEach( ( listener ) => listener() ),
	};
}

export function createGetInjections< TProps extends object = AnyProps >( injections: InjectionsMap< TProps > ) {
	return () => [ ...injections.values() ].sort( ( a, b ) => a.priority - b.priority );
}

// Injections registered after the `Slot` has already mounted (e.g. by an external plugin's
// script that loads after the editor has rendered) must still be reflected in the UI, so the
// snapshot is invalidated and re-read whenever `notify()` is called.
export function createUseInjections< TProps extends object = AnyProps >(
	getInjections: Location< TProps >[ 'getInjections' ],
	subscribe: Subscribe
) {
	let snapshot: ReturnType< Location< TProps >[ 'getInjections' ] > | null = null;

	subscribe( () => {
		snapshot = null;
	} );

	const getSnapshot = () => {
		if ( ! snapshot ) {
			snapshot = getInjections();
		}

		return snapshot;
	};

	return () => useSyncExternalStore( subscribe, getSnapshot );
}

export function wrapInjectedComponent< TProps extends object = AnyProps >( Component: InjectedComponent< TProps > ) {
	return ( props: TProps ) => (
		<InjectedComponentWrapper>
			<Component { ...props } />
		</InjectedComponentWrapper>
	);
}
