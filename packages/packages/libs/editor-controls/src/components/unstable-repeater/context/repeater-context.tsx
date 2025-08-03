import * as React from 'react';
import { createContext, useState } from 'react';
import { type PropTypeUtil, type PropValue } from '@elementor/editor-props';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type Item, type RepeatablePropValue } from '../types';

type SetterFn< T extends PropValue > = ( prevItems: T[] ) => T[];

type AddItem< T > = { item?: T; index?: number };

type RepeaterContextType< T extends RepeatablePropValue > = {
	isOpen: boolean;
	openItem: number;
	setOpenItem: ( key: number ) => void;
	items: Item< T >[];
	setItems: ( items: T[] | SetterFn< T > ) => void;
	uniqueKeys: number[];
	setUniqueKeys: ( keys: number[] | SetterFn< number > ) => void;
	initial: T;
	addItem: ( config?: AddItem< T > ) => void;
	updateItem: ( item: T, index: number ) => void;
	removeItem: ( index: number ) => void;
};

const RepeaterContext = createContext< RepeaterContextType< RepeatablePropValue > | null >( null );

const EMPTY_OPEN_ITEM = -1;

export const useRepeaterContext = () => {
	const context = React.useContext( RepeaterContext );

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return context;
};

export const RepeaterContextProvider = < T extends RepeatablePropValue = RepeatablePropValue >( {
	children,
	initial,
	propTypeUtil,
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

	const addItem = ( config?: AddItem< T > ) => {
		const item = config?.item ?? initial;
		const index = config?.index ?? items.length;
		const newItems = [ ...items ];
		const newUniqueKeys = [ ...uniqueKeys ];

		newItems.splice( index, 0, item );
		newUniqueKeys.splice( index, 0, generateNextKey( newUniqueKeys ) );

		setItems( newItems );
		setUniqueKeys( newUniqueKeys );

		setOpenItem( index );
	};

	const removeItem = ( index: number ) => {
		setItems( ( prevItems ) => prevItems.filter( ( _, pos ) => pos !== index ) );
		setUniqueKeys( ( prevKeys ) => prevKeys.filter( ( _, pos ) => pos !== index ) );
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
				setItems: setItems as ( items: RepeatablePropValue[] | SetterFn< RepeatablePropValue > ) => void,
				uniqueKeys,
				setUniqueKeys,
				initial,
				updateItem: updateItem as ( item: RepeatablePropValue, index: number ) => void,
				addItem: addItem as ( config?: AddItem< RepeatablePropValue > ) => void,
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
