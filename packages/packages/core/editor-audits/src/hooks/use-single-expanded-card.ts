import { useState } from 'react';

export function useSingleExpandedCard( initialId: string | null = null ) {
	const [ expandedId, setExpandedId ] = useState< string | null >( initialId );

	const toggle = ( id: string ) => {
		setExpandedId( ( current ) => ( current === id ? null : id ) );
	};

	return { expandedId, toggle };
}
