import { useEffect, useRef } from 'react';

export type UseTypingBufferOptions = {
	limit?: number;
	timeout?: number;
};

export function useTypingBuffer( options: UseTypingBufferOptions = {} ) {
	const { limit = 3, timeout = 600 } = options;

	const inputBufferRef = useRef( '' );
	const timeoutRef = useRef< number | null >( null );

	const appendKey = ( key: string ) => {
		inputBufferRef.current = ( inputBufferRef.current + key ).slice( -limit );

		if ( timeoutRef.current ) {
			window.clearTimeout( timeoutRef.current );
		}

		timeoutRef.current = window.setTimeout( () => {
			inputBufferRef.current = '';
			timeoutRef.current = null;
		}, timeout );

		return inputBufferRef.current;
	};

	const reset = () => {
		inputBufferRef.current = '';
		if ( timeoutRef.current ) {
			window.clearTimeout( timeoutRef.current );
			timeoutRef.current = null;
		}
	};

	const startsWith = ( haystack: string, needle: string ) => {
		// At least 2 characters in needle for longer haystack.
		if ( 3 < haystack.length && 2 > needle.length ) {
			return false;
		}
		return haystack.startsWith( needle );
	};

	useEffect( () => {
		return () => {
			reset();
		};
	}, [] );

	return {
		buffer: inputBufferRef.current,
		reset,
		appendKey,
		startsWith,
	};
}
