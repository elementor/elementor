import React, { createContext, useCallback, useState } from 'react';

export const ActiveElementContext = createContext( null );

const ActiveElement = ({ children } ) => {
	const [ activeElement, setActiveElement ] = useState( null );

	const getUid = ( source, id ) => `${ source }-${ id }`;

	const isActive = useCallback( ( id, source ) => {
		const uid = getUid( source, id );
		return activeElement === uid;
	}, [ activeElement ] );

	const setActive = ( id, source ) => {
		const uid = getUid( source, id );

		setActiveElement( uid );
	};

	const unsetActive = () => {
		setActiveElement( null );
	};

	return (
		<ActiveElementContext.Provider value={ { isActive, setActive, unsetActive } }>
			{ children }
		</ActiveElementContext.Provider>
	);
};

export default ActiveElement;
