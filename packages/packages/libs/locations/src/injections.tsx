import * as React from 'react';
import { useMemo } from 'react';

import InjectedComponentWrapper from './components/injected-component-wrapper';
import { type AnyProps, type Id, type InjectedComponent, type Injection, type Location } from './types';

type InjectionsMap< TProps extends object = AnyProps > = Map< Id, Injection< TProps > >;

export const DEFAULT_PRIORITY = 10;

// Allow flushing all injections at once, for testing purposes.
export const flushInjectionsFns: ( () => void )[] = [];

export function flushAllInjections() {
	flushInjectionsFns.forEach( ( flush ) => flush() );
}

export function createGetInjections< TProps extends object = AnyProps >( injections: InjectionsMap< TProps > ) {
	return () => [ ...injections.values() ].sort( ( a, b ) => a.priority - b.priority );
}

export function createUseInjections< TProps extends object = AnyProps >(
	getInjections: Location< TProps >[ 'getInjections' ]
) {
	return () => useMemo( () => getInjections(), [] );
}

export function wrapInjectedComponent< TProps extends object = AnyProps >( Component: InjectedComponent< TProps > ) {
	return ( props: TProps ) => (
		<InjectedComponentWrapper>
			<Component { ...props } />
		</InjectedComponentWrapper>
	);
}
