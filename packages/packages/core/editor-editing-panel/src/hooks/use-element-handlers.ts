import { useState } from 'react';
import { type ElementHandler, getElementHandlers, updateElementHandlers } from '@elementor/editor-elements';

const NEW_HANDLER: ElementHandler = { event: 'init', code: '' };

export const useElementHandlers = ( elementId: string ) => {
	const [ handlers, setHandlers ] = useState< ElementHandler[] >( () => getElementHandlers( elementId ) );

	const saveHandlers = ( nextHandlers: ElementHandler[] ) => {
		setHandlers( nextHandlers );
		updateElementHandlers( { elementId, handlers: nextHandlers } );
	};

	return {
		handlers,
		addHandler: () => saveHandlers( [ ...handlers, NEW_HANDLER ] ),
		updateHandler: ( index: number, changes: Partial< ElementHandler > ) =>
			saveHandlers(
				handlers.map( ( handler, handlerIndex ) => ( handlerIndex === index ? { ...handler, ...changes } : handler ) )
			),
		removeHandler: ( index: number ) =>
			saveHandlers( handlers.filter( ( _, handlerIndex ) => handlerIndex !== index ) ),
	};
};
