import * as React from 'react';
import { createContext, useMemo, useState } from 'react';
import { type PropTypeUtil, type PropValue } from '@elementor/editor-props';
import { createLocation } from '@elementor/locations';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type Item } from '../types';

type Slot< T extends object = object > =
	| ReturnType< typeof createLocation< T > >[ 'Slot' ]
	| ReturnType< typeof createLocation< T > >[ 'Slot' ];

type SetterFn< T extends PropValue > = ( prevItems: T[] ) => T[];

type RepeaterContextType< T extends PropValue > = {
	isOpen: boolean;
	openItem: number;
	setOpenItem: ( key: number ) => void;
	items: Item< T >[];
	setItems: ( items: T[] | SetterFn< T > ) => void;
	initial: T;
	uniqueKeys: number[];
	setUniqueKeys: ( keys: number[] ) => void;
	config: {
		headerItems: {
			Slot: Slot< { value: PropValue } >;
			inject: ( component: React.ComponentType< { value: PropValue } >, actionName: string ) => void;
		};
		itemActions: {
			Slot: Slot< { index: number } >;
			inject: ( component: React.ComponentType< { index: number } >, actionName: string ) => void;
		};
	};
	isSortable: boolean;
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
		config: context.config,
		uniqueKeys: context.uniqueKeys,
		setUniqueKeys: context.setUniqueKeys,
		initial: context.initial,
		isSortable: context.isSortable,
	};
};

export const RepeaterContextProvider = < T extends PropValue = PropValue >( {
	children,
	initial,
	propTypeUtil,
	isSortable = true,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] >; isSortable: boolean } > ) => {
	const config = useMemo( () => getConfiguredSlots(), [] );
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

	return (
		<RepeaterContext.Provider
			value={ {
				isOpen,
				openItem,
				setOpenItem,
				config,
				items: ( items ?? [] ) as Item< T >[],
				setItems: setItems as ( items: PropValue[] | SetterFn< PropValue > ) => void,
				initial,
				uniqueKeys,
				setUniqueKeys,
				isSortable,
			} }
		>
			{ children }
		</RepeaterContext.Provider>
	);
};

function getConfiguredSlots() {
	const headerActions = createLocation< { value: PropValue } >();
	const itemActions = createLocation< { index: number } >();

	const injectHeaderItems = ( component: React.ComponentType< { value: PropValue } >, actionName: string ) => {
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
