import * as React from 'react';
import { createContext, useContext, useState } from 'react';

import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { useRepeaterContext } from './repeater-context';

type ItemsDataContextType< T > = {
	items: T[];
	setItems: ( items: T[] ) => void;
	uniqueKeys: number[];
	setUniqueKeys: ( keys: number[] ) => void;
	openItem: number;
	setOpenItem: ( key: number ) => void;
	initial: T;
};

const ItemsDataContext = createContext< ItemsDataContextType< unknown > | null >( null );

export const useDataContext = < T, >() => {
	const context = useContext( ItemsDataContext ) as ItemsDataContextType< T > | null;

	if ( ! context ) {
		throw new Error( 'useDataContext must be used within a DataContextProvider' );
	}

	return {
		items: context.items ?? [],
		setItems: context.setItems,
		uniqueKeys: context.uniqueKeys ?? [],
		setUniqueKeys: context.setUniqueKeys,
		openItem: context.openItem,
		setOpenItem: context.setOpenItem,
		initial: context.initial,
	};
};

const EMPTY_OPEN_ITEM = -1;

export const ItemsDataContextProvider = < T, >( {
	children,
	initial,
	values: repeaterValues = [],
	setValues: setRepeaterValues,
}: {
	children: React.ReactNode;
	initial: T;
	values: T[];
	setValues: ( newValue: T[] ) => void;
} ) => {
	const [ items, setItems ] = useSyncExternalState( {
		external: repeaterValues,
		// @ts-expect-error - as long as persistWhen => true, value will never be null
		setExternal: setRepeaterValues,
		persistWhen: () => true,
	} );

	const [ uniqueKeys, setUniqueKeys ] = useState( items.map( ( _, index ) => index ) ?? [] );
	// const { isOpen, setIsOpen } = useRepeaterContext();
	const [ openItem, setOpenItem ] = useState( EMPTY_OPEN_ITEM );

	// const addRepeaterItem = useCallback( () => {
	// 	const newItem = structuredClone( initial );
	// 	const newKey = generateNextKey( uniqueKeys );
	//
	// 	setItems( [ ...items, newItem ] );
	// 	setUniqueKeys( [ ...uniqueKeys, newKey ] );
	//
	// 	setOpenItem( newKey );
	// }, [ initial, uniqueKeys, items, setItems ] );
	//
	// useEffect( () => {
	// 	if ( isOpen ) {
	// 		addRepeaterItem();
	// 		setIsOpen( false );
	// 	}
	// }, [ addRepeaterItem, isOpen, setIsOpen ] );

	return (
		<ItemsDataContext.Provider
			value={
				{
					items,
					setItems,
					uniqueKeys,
					setUniqueKeys,
					openItem,
					setOpenItem,
					initial,
				} as ItemsDataContextType< unknown >
			}
		>
			{ children }
		</ItemsDataContext.Provider>
	);
};
