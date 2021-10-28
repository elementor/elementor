import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { createContext, useContextSelector } from 'use-context-selector';

const ListStateContext = createContext( {} );

export function useListStateContext( elementId ) {
	const listState = useContextSelector(
		ListStateContext,
		( [ v ] ) => v[ elementId ]
	);

	const setListStateOriginal = useContextSelector(
		ListStateContext,
		( [ , v ] ) => v
	);

	const setListState =
		( value ) => setListStateOriginal(
			( prev ) => ( {
				...prev,
				[ elementId ]: value,
			} )
		);

	useEffect( () => setListState( false ), [ elementId ] );

	return [
		listState,
		setListState,
	];
}

export function useGlobalListState() {
	const listState = useContextSelector(
		ListStateContext,
		( [ v ] ) => v
	);

	const setListState = useContextSelector(
		ListStateContext,
		( [ , v ] ) => v
	);

	const isAllOpen = useMemo(
		() => Object.entries( listState ).every( ( [ , v ] ) => v ),
		[ listState ]
	);

	const toggleAll = () => {
		setListState( Object.fromEntries(
			Object.entries( listState ).map( ( [ k ] ) => {
				return [ k, ! isAllOpen ];
			} )
		) );
	};

	return { isAllOpen, toggleAll };
}

export function ListStateProvider( { children } ) {
	return (
		<ListStateContext.Provider value={ useState( {} ) } >
			{ children }
		</ListStateContext.Provider>
	);
}

ListStateProvider.propTypes = {
	children: PropTypes.node,
};
