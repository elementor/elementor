import * as React from 'react';
import { createContext } from 'react';
import { type Element, type ElementChildren, useElementChildren } from '@elementor/editor-elements';

import { useElement } from '../contexts/element-context';

type ChildElement = {
	type: string;
	target_container_selector: string;
};

type ElementsFieldProps = React.PropsWithChildren< {
	childElements: ChildElement[];
} >;

type ElementsFieldContext = {
	values: ElementChildren;
	childElements: ChildElement[];
	element: Element;
};

const Context = createContext< ElementsFieldContext | null >( null );

export const ElementsField = ( { children, childElements }: ElementsFieldProps ) => {
	const { element } = useElement();

	const values = useElementChildren(
		element.id,
		childElements.map( ( child ) => child.type )
	);

	return (
		<Context.Provider
			value={ {
				values,
				childElements,
				element,
			} }
		>
			{ children }
		</Context.Provider>
	);
};

export const useElementsField = () => {
	const context = React.useContext( Context );

	if ( ! context ) {
		throw new Error( 'useElementsField must be used within an ElementsField' );
	}

	return context;
};
