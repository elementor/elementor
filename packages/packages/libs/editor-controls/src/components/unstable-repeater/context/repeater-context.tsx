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

	const [ itemsWithKeys, setItemsWithKeys ] = useState< ItemWithKey< T >[] >( () => {
		return items?.map( ( item ) => ( { key: generateUniqueKey(), item } ) ) ?? [];
	} );

	React.useEffect( () => {
		setItemsWithKeys( ( prevItemsWithKeys ) => {
			const newItemsWithKeys =
				items?.map( ( item ) => {
					const existingItem = prevItemsWithKeys.find( ( i ) => i.item === item );
					return existingItem || { key: generateUniqueKey(), item };
				} ) ?? [];

			return newItemsWithKeys;
		} );
	}, [ items ] );

	const handleSetItems = ( newItemsWithKeys: ItemWithKey< T >[] ) => {
		setItems( newItemsWithKeys.map( ( { item } ) => item ) );
	};

	const [ openItemIndex, setOpenItemIndex ] = useState( EMPTY_OPEN_ITEM );
	const [ rowRef, setRowRef ] = useState< HTMLElement | null >( null );

	const isOpen = openItemIndex !== EMPTY_OPEN_ITEM;
	const popoverState = usePopupState( { variant: 'popover' } );

	const addItem = ( ev: React.MouseEvent, config?: AddItem< T > ) => {
		const item = config?.item ?? initial;
		const newIndex = config?.index ?? items.length;
		const newItems = [ ...items ];

		newItems.splice( newIndex, 0, item );
		setItems( newItems );

		setOpenItemIndex( newIndex );
		popoverState.open( rowRef ?? ev );
	};

	const removeItem = ( index: number ) => {
		setItems( items.filter( ( _, pos ) => pos !== index ) );
	};

	const updateItem = ( updatedItem: T, index: number ) => {
		const newItems = [ ...items.slice( 0, index ), updatedItem, ...items.slice( index + 1 ) ];
		setItems( newItems );
	};

	return (
		<RepeaterContext.Provider
			value={ {
				isOpen,
				openItemIndex,
				setOpenItemIndex,
				items: ( itemsWithKeys ?? [] ) as RepeaterContextType< T >[ 'items' ],
				setItems: handleSetItems as RepeaterContextType< RepeatablePropValue >[ 'setItems' ],
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

const generateUniqueKey = () => {
	return Date.now() + Math.floor( Math.random() * 1000000 );
};
