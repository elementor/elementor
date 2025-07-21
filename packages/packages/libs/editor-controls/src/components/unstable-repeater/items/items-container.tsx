import * as React from 'react';

import { ItemsDataContextProvider, useDataContext } from '../context/items-data-context';

type ItemsContainerProps< T > = {
	children: React.ReactNode;
	initial: T;
};

export const ItemsContainer = < T, >( { children, initial }: ItemsContainerProps< T > ) => {
	return (
		<ItemsDataContextProvider< T > initial={ initial }>
			<ItemsList itemTemplate={ children as React.ReactElement< { value: T } > } />
		</ItemsDataContextProvider>
	);
};

type ItemsListProps< T > = {
	itemTemplate?: React.ReactElement< { value: T } >;
};

const ItemsList = < T, >( { itemTemplate }: ItemsListProps< T > ) => {
	const { values } = useDataContext< T >();

	if ( ! itemTemplate ) {
		return null;
	}

	return (
		<>
			{ values?.map( ( value, index ) =>
				React.isValidElement( itemTemplate ) ? React.cloneElement( itemTemplate, { key: index, value } ) : null
			) }
		</>
	);
};
