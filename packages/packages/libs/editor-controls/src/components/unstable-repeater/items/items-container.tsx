import * as React from "react";

import { ItemsDataContextProvider, useDataContext } from "../context/items-data-context";
import { Item } from "./item";

type ItemsContainerProps = {
	children: React.ReactNode;
	initialValue?: Record< string, unknown >;
};

export const ItemsContainer = ( { children, initialValue }: ItemsContainerProps ) => {
	// const { value, setValue } = usePropContext();

	return (
		<ItemsDataContextProvider>
			<ItemsList itemTemplate={ children } />
		</ItemsDataContextProvider>
	);
};

type ItemsListProps = {
	itemTemplate?: React.ReactNode;
};

const ItemsList = ( { itemTemplate }: ItemsListProps ) => {
	const { values } = useDataContext();

	if ( ! itemTemplate ) {
		return null;
	}

	return (
		<>
			{ values.map( ( value, index ) => (
				<Item key={ index } />
			) ) }
		</>
	);
};
