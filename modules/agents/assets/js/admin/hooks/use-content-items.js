import { useCallback, useEffect, useRef, useState } from 'react';

import { listContentItems } from '../api';
import { SEARCH_DEBOUNCE_MS } from './use-markdown-items';

const FIRST_PAGE = 1;

const LOADING_STATE = {
	items: [],
	page: 0,
	hasMore: false,
	isLoading: true,
	hasError: false,
};

const appendNewItems = ( items, nextItems ) => {
	const knownIds = new Set( items.map( ( item ) => item.id ) );

	return [ ...items, ...nextItems.filter( ( item ) => ! knownIds.has( item.id ) ) ];
};

export const useContentItems = ( { module, postType, term = '' } ) => {
	const [ state, setState ] = useState( LOADING_STATE );
	const requestIdRef = useRef( 0 );
	const trimmedTerm = term.trim();

	const ignorePendingRequest = useCallback( () => ++requestIdRef.current, [] );

	const load = useCallback( ( page ) => {
		const requestId = ignorePendingRequest();
		const isFirstPage = FIRST_PAGE === page;

		setState( ( previous ) => ( isFirstPage ? LOADING_STATE : { ...previous, isLoading: true } ) );

		listContentItems( { module, postType, term: trimmedTerm, page } )
			.then( ( { items, hasMore } ) => {
				if ( requestId !== requestIdRef.current ) {
					return;
				}

				setState( ( previous ) => ( {
					items: isFirstPage ? items : appendNewItems( previous.items, items ),
					page,
					hasMore,
					isLoading: false,
					hasError: false,
				} ) );
			} )
			.catch( () => {
				if ( requestId === requestIdRef.current ) {
					setState( ( previous ) => ( { ...previous, hasMore: false, isLoading: false, hasError: true } ) );
				}
			} );
	}, [ module, postType, trimmedTerm, ignorePendingRequest ] );

	useEffect( () => {
		setState( LOADING_STATE );

		const timer = setTimeout( () => load( FIRST_PAGE ), trimmedTerm ? SEARCH_DEBOUNCE_MS : 0 );

		return () => {
			clearTimeout( timer );
			ignorePendingRequest();
		};
	}, [ load, trimmedTerm, ignorePendingRequest ] );

	const loadMore = useCallback( () => {
		if ( ! state.isLoading && state.hasMore ) {
			load( state.page + 1 );
		}
	}, [ load, state.isLoading, state.hasMore, state.page ] );

	const retry = useCallback( () => load( FIRST_PAGE ), [ load ] );

	return {
		items: state.items,
		hasMore: state.hasMore,
		isLoading: state.isLoading,
		hasError: state.hasError,
		loadMore,
		retry,
	};
};
