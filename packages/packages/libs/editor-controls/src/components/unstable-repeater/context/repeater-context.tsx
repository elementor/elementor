import * as React from 'react';
import { createContext, useMemo, useState } from 'react';
import { type ArrayPropValue, type PropTypeUtil, type PropValue } from '@elementor/editor-props';
import { createLocation, createReplaceableLocation } from '@elementor/locations';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { useSyncExternalState } from '../../../hooks/use-sync-external-state';

type Slot< T extends object = object > =
	| ReturnType< typeof createReplaceableLocation< T > >[ 'Slot' ]
	| ReturnType< typeof createLocation< T > >[ 'Slot' ];

type Items< T extends PropValue > = {
	$$type: string;
	value: T[];
};

type ItemActionProps< T extends PropValue = PropValue > = {
	openItem: number;
	isOpen: boolean;
	uniqueKeys: number[];
	setUniqueKeys: ( keys: number[] ) => void;
	setItems: ( setter: T[] | SetterFunc ) => void;
	itemKey: number;
};

type RepeaterContextType< T extends PropValue = PropValue > = {
	isOpen: boolean;
	openItem: number;
	setOpenItem: ( key: number ) => void;
	items: T[];
	setItems: ( items: T[] ) => void;
	initial: T;
	uniqueKeys: number[];
	setUniqueKeys: ( keys: number[] ) => void;
	config: {
		headerItems: {
			Slot: Slot< { value: PropValue } >;
			inject: ( component: React.ComponentType< { value: PropValue } > ) => void;
		};
		itemActions: {
			Slot: Slot< ItemActionProps< T > >;
			inject: ( component: React.ComponentType< ItemActionProps< T > > ) => void;
		};
	};
};

const RepeaterContext = createContext< RepeaterContextType | null >( null );

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
	};
};

export const RepeaterContextProvider = < T extends PropValue >( {
	children,
	initial,
	propTypeUtil,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] > } > ) => {
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
				items: items ?? [],
				setItems,
				initial,
				uniqueKeys,
				setUniqueKeys,
			} }
		>
			{ children }
		</RepeaterContext.Provider>
	);
};

function getConfiguredSlots(): RepeaterContextType[ 'config' ] {
	const headerActions = createLocation< { value: PropValue } >();
	const itemActions = createLocation< ItemActionProps >();
	const itemIcon = createReplaceableLocation< { value: PropValue } >();

	const injectHeaderItems = ( component: React.ComponentType< { value: PropValue } > ) => {
		headerActions.inject( {
			id: 'repeater-header-items',
			component,
		} );
	};

	const injectItemActions = ( component: React.ComponentType< ItemActionProps > ) => {
		itemActions.inject( {
			id: 'repeater-items-actions',
			component,
		} );
	};

	return {
		headerItems: { Slot: headerActions.Slot, inject: injectHeaderItems },
		itemActions: { Slot: itemActions.Slot, inject: injectItemActions },
	};
}
