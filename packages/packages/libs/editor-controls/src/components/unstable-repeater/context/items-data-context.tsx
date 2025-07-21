import * as React from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

import { useRepeaterContext } from './repeater-context';

type ItemsDataContextType = {
	values: Record< string, unknown >[];
	setValues: ( values: Record< string, unknown >[] ) => void;
};

const ItemsDataContext = createContext< ItemsDataContextType | null >( null );

export const useDataContext = () => {
	const context = React.useContext( ItemsDataContext );

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return {
		values: context.values,
		setValues: context.setValues,
	};
};

const initial = {
	text: '',
};

export const ItemsDataContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ values, setValues ] = useState< Record< string, unknown >[] >( [] );
	const [ uniqueKeys, setUniqueKeys ] = useState( values.map( ( _, index ) => index ) );
	const { isOpen, setIsOpen } = useRepeaterContext();

	const generateNextKey = ( source: number[] ) => {
		return 1 + Math.max( 0, ...source );
	};

	const addRepeaterItem = useCallback( () => {
		const newItem = structuredClone( initial );
		const newKey = generateNextKey( uniqueKeys );

		setValues( [ ...values, newItem ] );
		setUniqueKeys( [ ...uniqueKeys, newKey ] );
	}, [ uniqueKeys, values ] );

	useEffect( () => {
		if ( isOpen ) {
			addRepeaterItem();
			setIsOpen( false );
		}
	}, [ addRepeaterItem, isOpen, setIsOpen ] );

	return <ItemsDataContext.Provider value={ { values, setValues } }>{ children }</ItemsDataContext.Provider>;
};
