import * as React from 'react';
import { createContext, useState } from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { type PopupState, usePopupState } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type Item, type RepeatablePropValue } from '../types';

type SetterFn< T > = ( prevItems: T ) => T;

type AddItem< T > = { item?: T; index?: number };

type ItemWithKey< T > = { key: number; item: T };

type RepeaterContextType< T extends RepeatablePropValue > = {
	isOpen: boolean;
	openItemIndex: number;
	setOpenItemIndex: ( key: number ) => void;
	items: ItemWithKey< Item< T > >[];
	setItems: ( items: ItemWithKey< T >[] ) => void;
	popoverState: PopupState;
	initial: T;
	addItem: ( ev: React.MouseEvent, config?: AddItem< T > ) => void;
	updateItem: ( item: T, index: number ) => void;
	removeItem: ( index: number ) => void;
	rowRef: HTMLElement | null;
	setRowRef: ( ref: HTMLElement | null | SetterFn< HTMLElement | null > ) => void;
};

const RepeaterContext = createContext< RepeaterContextType< RepeatablePropValue > | null >( null );

export const EMPTY_OPEN_ITEM = -1;

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

	const itemWithKeysState = useState< ItemWithKey< T >[] >(
		items?.map( ( item, index ) => ( { key: index, item } ) ) ?? []
	);

	const itemsWithKeys = itemWithKeysState[ 0 ];
	const setItemsWithKeys = ( newItems: ItemWithKey< T >[] ) => {
		itemWithKeysState[ 1 ]( newItems as ItemWithKey< T >[] );
		setItems( newItems.map( ( { item } ) => item as T ) );
	};

	const [ openItemIndex, setOpenItemIndex ] = useState( EMPTY_OPEN_ITEM );
	const [ rowRef, setRowRef ] = useState< HTMLElement | null >( null );

	const isOpen = openItemIndex < 0;
	const popoverState = usePopupState( { variant: 'popover' } );

	const addItem = ( ev: React.MouseEvent, config?: AddItem< T > ) => {
		const item = config?.item ?? initial;
		const newIndex = config?.index ?? items.length;
		const newKey = generateNextKey( itemsWithKeys.map( ( { key } ) => key ) );

		setItemsWithKeys( itemsWithKeys.toSpliced( newIndex, 0, { item, key: newKey } ) );

		setOpenItemIndex( newIndex );
		popoverState.open( rowRef ?? ev );
	};

	const removeItem = ( index: number ) => {
		setItemsWithKeys( itemsWithKeys.filter( ( _, pos ) => pos !== index ) );
	};

	const updateItem = ( updatedItem: T, index: number ) => {
		const item = itemsWithKeys[ index ];

		setItemsWithKeys( itemsWithKeys.toSpliced( index, 1, { ...item, item: updatedItem } ) );
	};

	return (
		<RepeaterContext.Provider
			value={ {
				isOpen,
				openItemIndex,
				setOpenItemIndex,
				items: ( itemsWithKeys ?? [] ) as RepeaterContextType< T >[ 'items' ],
				setItems: setItemsWithKeys as RepeaterContextType< RepeatablePropValue >[ 'setItems' ],
				popoverState,
				initial,
				updateItem: updateItem as RepeaterContextType< RepeatablePropValue >[ 'updateItem' ],
				addItem: addItem as RepeaterContextType< RepeatablePropValue >[ 'addItem' ],
				removeItem,
				rowRef,
				setRowRef,
			} }
		>
			{ children }
		</RepeaterContext.Provider>
	);
};

const generateNextKey = ( source: number[] ) => {
	return 1 + Math.max( 0, ...source );
};
