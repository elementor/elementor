import * as React from 'react';
import { createContext, useState } from 'react';
import { type PropTypeUtil, type PropValue } from '@elementor/editor-props';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type Item } from '../types';

type SetterFn< T extends PropValue > = ( prevItems: T[] ) => T[];

type AddItem< T > = { item?: T; index?: number };

type RepeaterContextType< T extends PropValue > = {
	isOpen: boolean;
	openItem: number;
	setOpenItem: ( key: number ) => void;
	items: Item< T >[];
	setItems: ( items: T[] | SetterFn< T > ) => void;
	initial: T;
	uniqueKeys: number[];
	setUniqueKeys: ( keys: number[] ) => void;
	isSortable: boolean;
	generateNextKey: ( source: number[] ) => number;
	addItem: ( config?: AddItem< T > ) => void;
	updateItem: ( item: T, index: number ) => void;
	removeItem: ( index: number ) => void;
	sortItemsByKeys: ( newKeysOrder: number[] ) => void;
};

const RepeaterContext = createContext< RepeaterContextType< PropValue > | null >( null );

const EMPTY_OPEN_ITEM = -1;

export const useRepeaterContext = () => {
	const context = React.useContext( RepeaterContext );

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return {
		isOpen: context.isOpen,
		openItem: context.openItem,
		setOpenItem: context.setOpenItem,
		items: context.items,
		setItems: context.setItems,
		uniqueKeys: context.uniqueKeys,
		setUniqueKeys: context.setUniqueKeys,
		initial: context.initial,
		isSortable: context.isSortable,
		generateNextKey: context.generateNextKey,
		sortItemsByKeys: context.sortItemsByKeys,
		addItem: context.addItem,
		updateItem: context.updateItem,
		removeItem: context.removeItem,
	};
};

export const RepeaterContextProvider = < T extends PropValue = PropValue >( {
	children,
	initial,
	propTypeUtil,
	isSortable = true,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] >; isSortable?: boolean } > ) => {
	const { value: repeaterValues, setValue: setRepeaterValues } = useBoundProp( propTypeUtil );

	const [ items, setItems ] = useSyncExternalState( {
		external: repeaterValues,
		fallback: () => [] as T[],
		setExternal: setRepeaterValues,
		persistWhen: () => true,
	} );

	const [ openItem, setOpenItem ] = useState( EMPTY_OPEN_ITEM );
	const [ uniqueKeys, setUniqueKeys ] = useState( items?.map( ( _, index ) => index ) ?? [] );

	const isOpen = openItem !== EMPTY_OPEN_ITEM;

	const sortItemsByKeys = ( keysOrder: number[] ) => {
		setUniqueKeys( keysOrder );
		setItems( ( prevItems ) =>
			keysOrder.map( ( key ) => {
				const index = uniqueKeys.indexOf( key );

				return prevItems[ index ];
			} )
		);
	};

	const addItem = ( config?: AddItem< T > ) => {
		const item = config?.item ?? initial;
		const index = config?.index ?? items.length;
		const newItems = [ ...items ];

		newItems.splice( index, 0, item );
		setItems( newItems );
		setUniqueKeys( newItems.map( ( _, i ) => i ) );

		setOpenItem( index );
	};

	const removeItem = ( index: number ) => {
		setItems( ( prevItems ) => prevItems.filter( ( _, pos ) => pos !== index ) );
		setUniqueKeys( ( prevKeys ) => prevKeys.slice( 0, -1 ) );
	};

	const updateItem = ( updatedItem: T, index: number ) => {
		setItems( ( prevItems ) => prevItems.map( ( item, pos ) => ( pos === index ? updatedItem : item ) ) );
	};

	return (
		<RepeaterContext.Provider
			value={ {
				isOpen,
				openItem,
				setOpenItem,
				items: ( items ?? [] ) as Item< T >[],
				setItems: setItems as ( items: PropValue[] | SetterFn< PropValue > ) => void,
				initial,
				uniqueKeys,
				setUniqueKeys,
				isSortable,
				generateNextKey,
				sortItemsByKeys,
				addItem: addItem as ( config?: AddItem< PropValue > ) => void,
				updateItem: updateItem as ( item: PropValue, index: number ) => void,
				removeItem,
			} }
		>
			{ children }
		</RepeaterContext.Provider>
	);
};

const generateNextKey = ( source: number[] ) => {
	return 1 + Math.max( 0, ...source );
};
