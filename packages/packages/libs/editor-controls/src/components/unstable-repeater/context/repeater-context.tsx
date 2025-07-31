import * as React from 'react';
import { createContext, useMemo, useState } from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { createLocation } from '@elementor/locations';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type Item, type RepeatablePropValue } from '../types';

type Slot< T extends object = object > =
	| ReturnType< typeof createLocation< T > >[ 'Slot' ]
	| ReturnType< typeof createLocation< T > >[ 'Slot' ];

type SetterFn< T extends RepeatablePropValue > = ( prevItems: T[] ) => T[];

type RepeaterContextType< T extends RepeatablePropValue > = {
	isOpen: boolean;
	openItem: number;
	setOpenItem: ( key: number ) => void;
	items: Item< T >[];
	setItems: ( items: T[] | SetterFn< T > ) => void;
	initial: T;
	config: {
		headerItems: {
			Slot: Slot< { value: T } >;
			inject: ( component: React.ComponentType< { value: T } >, actionName: string ) => void;
		};
		itemActions: {
			Slot: Slot< { index: number } >;
			inject: ( component: React.ComponentType< { index: number } >, actionName: string ) => void;
		};
	};
	addItem: ( item?: T, index?: number ) => void;
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

	return {
		isOpen: context.isOpen,
		openItem: context.openItem,
		setOpenItem: context.setOpenItem,
		items: context.items,
		setItems: context.setItems,
		config: context.config,
		initial: context.initial,
		addItem: context.addItem,
		updateItem: context.updateItem,
		removeItem: context.removeItem,
	};
};

export const RepeaterContextProvider = < T extends RepeatablePropValue = RepeatablePropValue >( {
	children,
	initial,
	propTypeUtil,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] >; isSortable?: boolean } > ) => {
	const config = useMemo( () => getConfiguredSlots(), [] );
	const { value: repeaterValues, setValue: setRepeaterValues } = useBoundProp( propTypeUtil );

	const [ items, setItems ] = useSyncExternalState( {
		external: repeaterValues,
		fallback: () => [] as T[],
		setExternal: setRepeaterValues,
		persistWhen: () => true,
	} );

	const [ openItem, setOpenItem ] = useState( EMPTY_OPEN_ITEM );

	const isOpen = openItem !== EMPTY_OPEN_ITEM;

	const addItem = ( item: T = initial, index: number = -1 ) => {
		const newKey = items.length;

		if ( index === -1 ) {
			setItems( [ ...items, item ] );
		} else {
			const newItems = [ ...items ];

			newItems.splice( index, 0, item );
			setItems( newItems );
		}

		setOpenItem( newKey );
	};

	const removeItem = ( index: number ) => {
		setItems( ( prevItems ) => prevItems.filter( ( _, pos ) => pos !== index ) );
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
				config,
				items: ( items ?? [] ) as Item< T >[],
				setItems: setItems as ( items: RepeatablePropValue[] | SetterFn< RepeatablePropValue > ) => void,
				initial,
				addItem: addItem as ( item?: RepeatablePropValue, index?: number ) => void,
				updateItem: updateItem as ( item: RepeatablePropValue, index: number ) => void,
				removeItem,
			} }
		>
			{ children }
		</RepeaterContext.Provider>
	);
};

function getConfiguredSlots() {
	const headerActions = createLocation< { value: RepeatablePropValue } >();
	const itemActions = createLocation< { index: number } >();

	const injectHeaderItems = (
		component: React.ComponentType< { value: RepeatablePropValue } >,
		actionName: string
	) => {
		headerActions.inject( {
			id: 'repeater-header-items-' + actionName,
			component,
			options: { overwrite: true },
		} );
	};

	const injectItemActions = ( component: React.ComponentType< { index: number } >, actionName: string ) => {
		itemActions.inject( {
			id: 'repeater-items-actions-' + actionName,
			component,
			options: { overwrite: true },
		} );
	};

	return {
		headerItems: { Slot: headerActions.Slot, inject: injectHeaderItems },
		itemActions: { Slot: itemActions.Slot, inject: injectItemActions },
	};
}
