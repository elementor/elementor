import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { createContext, useContext, useContextSelector } from 'use-context-selector';

const ListStateContext = createContext( {} );

export function useListStateContext( elementId ) {
	// Instead of listening to changes of the entire context, we can select a specific portion to listen to of it using
	// `useContextSelector` package.
	const listState = useContextSelector(
		ListStateContext,
		( [ get ] ) => get[ elementId ]
	);

	const setListStateOriginal = useContextSelector(
		ListStateContext,
		( [ , set ] ) => set
	);

	const setListState =
		( value ) => setListStateOriginal(
			( prev ) => ( {
				...prev,
				[ elementId ]: value,
			} )
		);

	useEffect( () => {
		setListState( false );
	}, [ elementId ] );

	return [
		listState,
		setListState,
	];
};

export function useGlobalListState() {
	const [ listState, setListState ] = useContext( ListStateContext );

	const isAllOpen = useMemo(
		() => Object.entries( listState )
			.every( ( [ , value ] ) => value ),
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
