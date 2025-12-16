import * as React from 'react';
import { createContext, useMemo, useState } from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { type PopupState, usePopupState } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { eventBus } from '../../../services/event-bus';
import { type Item, type RepeatablePropValue } from '../types';
import { ItemContext } from './item-context';

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
	isItemDisabled: ( index: number ) => boolean;
};

const RepeaterContext = createContext< RepeaterContextType< RepeatablePropValue > | null >( null );

export const EMPTY_OPEN_ITEM = -1;

export const useRepeaterContext = () => {
	const context = React.useContext( RepeaterContext );
	const itemContext = React.useContext( ItemContext );

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return { ...context, ...itemContext };
};

export const RepeaterContextProvider = < T extends RepeatablePropValue = RepeatablePropValue >( {
	children,
	initial,
	propTypeUtil,
	isItemDisabled = () => false,
}: React.PropsWithChildren< {
	initial: T;
	propTypeUtil: PropTypeUtil< string, T[] >;
	isSortable?: boolean;
	isItemDisabled?: ( item: Item< T > ) => boolean;
} > ) => {
	const { value: repeaterValues, setValue: setRepeaterValues } = useBoundProp( propTypeUtil );

	const [ items, setItems ] = useSyncExternalState( {
		external: repeaterValues,
		fallback: () => [] as T[],
		setExternal: setRepeaterValues,
		persistWhen: () => true,
	} );

	const [ uniqueKeys, setUniqueKeys ] = useState( () => {
		return items?.map( ( _, index ) => index ) ?? [];
	} );

	const itemsWithKeys = useMemo(
		() =>
			uniqueKeys
				.map( ( key, index ) => ( {
					key,
					item: items[ index ],
				} ) )
				.filter( ( { item } ) => item !== undefined ),
		[ uniqueKeys, items ]
	);

	const handleSetItems = ( newItemsWithKeys: ItemWithKey< T >[] ) => {
		setItems( newItemsWithKeys.map( ( { item } ) => item ) );
	};

	const [ openItemIndex, setOpenItemIndex ] = useState( EMPTY_OPEN_ITEM );
	const [ rowRef, setRowRef ] = useState< HTMLElement | null >( null );

	const isOpen = openItemIndex !== EMPTY_OPEN_ITEM;
	const popoverState = usePopupState( { variant: 'popover' } );

	const addItem = ( ev: React.MouseEvent, config?: AddItem< T > ) => {
		const item = config?.item ?? { ...initial };
		const newIndex = config?.index ?? items.length;
		const newKey = generateUniqueKey();
		const newItems = [ ...items ];

		newItems.splice( newIndex, 0, item );
		setItems( newItems );

		setUniqueKeys( [ ...uniqueKeys.slice( 0, newIndex ), newKey, ...uniqueKeys.slice( newIndex ) ] );

		setOpenItemIndex( newIndex );
		popoverState.open( rowRef ?? ev );

		eventBus.emit( `${ propTypeUtil.key }-item-added`, {
			itemValue: initial.value,
		} );
	};

	const removeItem = ( index: number ) => {
		const itemToRemove = items[ index ];

		setItems( items.filter( ( _, pos ) => pos !== index ) );
		setUniqueKeys( uniqueKeys.filter( ( _, pos ) => pos !== index ) );

		eventBus.emit( `${ propTypeUtil.key }-item-removed`, {
			itemValue: itemToRemove?.value,
		} );
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
				isItemDisabled: ( index: number ) => isItemDisabled( itemsWithKeys[ index ].item ),
			} }
		>
			{ children }
		</RepeaterContext.Provider>
	);
};

const generateUniqueKey = () => {
	return Date.now() + Math.floor( Math.random() * 1000000 );
};
