import { useCallback, useLayoutEffect, useRef } from 'react';

type UseRovingFocusProps = {
	tabbableKey: string | undefined;
	mountedSignature: string;
};

export const useRovingFocus = < E extends HTMLElement >( { tabbableKey, mountedSignature }: UseRovingFocusProps ) => {
	const elements = useRef( new Map< string, E >() );
	const isFocusPending = useRef( false );

	useLayoutEffect( () => {
		if ( ! isFocusPending.current || tabbableKey === undefined ) {
			return;
		}

		const element = elements.current.get( tabbableKey );

		if ( element ) {
			element.focus();
			isFocusPending.current = false;
		}
	}, [ tabbableKey, mountedSignature ] );

	const registerRef = useCallback(
		( key: string ) => ( node: E | null ) => {
			if ( node ) {
				elements.current.set( key, node );
			} else {
				elements.current.delete( key );
			}
		},
		[]
	);

	const requestFocus = useCallback( () => {
		isFocusPending.current = true;
	}, [] );

	return { registerRef, requestFocus };
};
