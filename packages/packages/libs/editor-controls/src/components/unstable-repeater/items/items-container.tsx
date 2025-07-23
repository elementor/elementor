import * as React from 'react';

import { ItemsDataContextProvider, useDataContext } from '../context/items-data-context';

type ItemsContainerProps< T > = {
	children: React.ReactNode;
	initial: T;
	values: T[];
	setValues: ( newValue: T[] ) => void;
};

export const ItemsContainer = < T, >( { children, initial, values = [], setValues }: ItemsContainerProps< T > ) => {
	return (
		<ItemsDataContextProvider< T > initial={ initial } values={ values } setValues={ setValues }>
			<ItemsList itemTemplate={ children as React.ReactElement< ItemProps< T > > } />
		</ItemsDataContextProvider>
	);
};

type ItemProps< T > = { value: T; index: number; openOnMount: boolean };

type ItemsListProps< T > = {
	itemTemplate?: React.ReactElement< ItemProps< T > >;
};

const ItemsList = < T, >( { itemTemplate }: ItemsListProps< T > ) => {
	const { items, uniqueKeys, openItem } = useDataContext< T >();

	if ( ! itemTemplate ) {
		return null;
	}

	return (
		<>
			{ uniqueKeys?.map( ( key: number, index: number ) => {
				const value = items?.[ index ];

				if ( ! value ) {
					return null;
				}

				return React.isValidElement( itemTemplate )
					? React.cloneElement( itemTemplate, { key, value, index, openOnMount: key === openItem } )
					: null;
			} ) }
		</>
	);
};
