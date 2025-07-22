import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { useRepeaterContext } from './repeater-context';

type ItemsDataContextType< T > = {
	items?: T[];
	uniqueKeys?: number[];
	openItem: number;
	setOpenItem: ( key: number ) => void;
};

const ItemsDataContext = createContext< ItemsDataContextType< unknown > | null >( null );

export const useDataContext = < T, >() => {
	const context = useContext( ItemsDataContext ) as ItemsDataContextType< T > | null;

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return {
		items: context.items,
		uniqueKeys: context.uniqueKeys,
		openItem: context.openItem,
		setOpenItem: context.setOpenItem,
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

	const [ uniqueKeys, setUniqueKeys ] = useState( items.map( ( _, index ) => index ) );
	const { isOpen, setIsOpen } = useRepeaterContext();
	const [ openItem, setOpenItem ] = useState( EMPTY_OPEN_ITEM );

	const generateNextKey = ( source: number[] ) => {
		return 1 + Math.max( 0, ...source );
	};

	const addRepeaterItem = useCallback( () => {
		const newItem = structuredClone( initial );
		const newKey = generateNextKey( uniqueKeys );

		setItems( [ ...items, newItem ] );
		setUniqueKeys( [ ...uniqueKeys, newKey ] );

		setOpenItem( newKey );
	}, [ initial, uniqueKeys, items, setItems ] );

	useEffect( () => {
		if ( isOpen ) {
			addRepeaterItem();
			setIsOpen( false );
		}
	}, [ addRepeaterItem, isOpen, setIsOpen ] );

	return (
		<ItemsDataContext.Provider
			value={ { items, uniqueKeys, openItem, setOpenItem } as ItemsDataContextType< unknown > }
		>
			{ children }
		</ItemsDataContext.Provider>
	);
};
