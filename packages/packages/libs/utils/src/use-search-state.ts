import { useDebounceState, type UseDebounceStateResult } from './use-debounce-state';

export type UseSearchStateResult = UseDebounceStateResult;

export function useSearchState( { localStorageKey }: { localStorageKey?: string } ) {
	const getInitialSearchValue = () => {
		if ( localStorageKey ) {
			const storedValue = localStorage.getItem( localStorageKey );
			if ( storedValue ) {
				localStorage.removeItem( localStorageKey );
				return storedValue;
			}
		}
		return '';
	};
	const { debouncedValue, inputValue, handleChange, setInputValue } = useDebounceState( {
		delay: 300,
		initialValue: getInitialSearchValue(),
	} );
	return {
		debouncedValue,
		inputValue,
		handleChange,
		setInputValue,
	};
}
