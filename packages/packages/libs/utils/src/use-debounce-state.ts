import { useCallback, useEffect, useRef, useState } from 'react';
import type * as React from 'react';

import { debounce } from './debounce';

export type UseDebounceStateOptions = {
	delay?: number;
	initialValue?: string;
};

export type UseDebounceStateResult = {
	debouncedValue: string;
	inputValue: string;
	handleChange: ( val: string ) => void;
	setInputValue: React.Dispatch< React.SetStateAction< string > >;
};

export function useDebounceState( options: UseDebounceStateOptions = {} ): UseDebounceStateResult {
	const { delay = 300, initialValue = '' } = options;

	const [ debouncedValue, setDebouncedValue ] = useState( initialValue );
	const [ inputValue, setInputValue ] = useState( initialValue );

	const runRef = useRef< ReturnType< typeof debounce > | null >( null );

	useEffect( () => {
		return () => {
			runRef.current?.cancel?.();
		};
	}, [] );

	const debouncedSetValue = useCallback(
		( val: string ) => {
			runRef.current?.cancel?.();
			runRef.current = debounce( () => {
				setDebouncedValue( val );
			}, delay );
			runRef.current();
		},
		[ delay ]
	);

	const handleChange = ( val: string ) => {
		setInputValue( val );
		debouncedSetValue( val );
	};

	return {
		debouncedValue,
		inputValue,
		handleChange,
		setInputValue,
	};
}
