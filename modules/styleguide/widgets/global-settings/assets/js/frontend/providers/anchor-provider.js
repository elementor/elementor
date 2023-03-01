import React, { createContext, useState } from 'react';

export const AnchorContext = createContext( null );

const AnchorProvider = ( { children } ) => {
	const [ anchors, setAnchors ] = useState( {} );

	const registerAnchor = ( name, ref ) => {
		setAnchors( ( prevAnchors ) => (
			{
				...prevAnchors,
				[ name ]: { ref },
			}
		) );
	};

	const scrollToAnchor = ( name ) => {
		const anchor = anchors[ name ];
		if ( anchor ) {
			anchor.ref.current.scrollIntoView( { behavior: 'smooth' } );
		}
	};

	return (
		<AnchorContext.Provider value={ { registerAnchor, scrollToAnchor } }>
			{ children }
        </AnchorContext.Provider>
	);
};

export default AnchorProvider;