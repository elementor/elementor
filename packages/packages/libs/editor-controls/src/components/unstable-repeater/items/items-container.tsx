import * as React from 'react';
import { type PropValue } from '@elementor/editor-props';

import { useRepeaterContext } from '../context/repeater-context';
import { type ItemProps } from '../types';

type ItemsContainerProps< T > = React.PropsWithChildren< {
	initial: T;
	values: T[];
	setValues: ( newValue: T[] ) => void;
} >;

export const ItemsContainer = < T extends PropValue >( { children }: ItemsContainerProps< T > ) => {
	return <ItemsList itemTemplate={ children } />;
};

// type ItemProps< T > = { value: T; index: number; openOnMount: boolean };

type ItemsListProps = {
	itemTemplate?: React.ReactNode;
};

const ItemsList = < T, >( { itemTemplate }: ItemsListProps ) => {
	const { items, uniqueKeys, openItem } = useRepeaterContext();

	if ( ! itemTemplate ) {
		return null;
	}

	return (
		<>
			{ uniqueKeys?.map( ( key: number, index: number ) => {
				const value = items?.[ index ] as T;

				if ( ! value ) {
					return null;
				}

				return React.isValidElement< ItemProps< T > >( itemTemplate )
					? React.cloneElement( itemTemplate, {
							key,
							value,
							index,
							openOnMount: key === openItem,
					  } )
					: null;
			} ) }
		</>
	);
};
