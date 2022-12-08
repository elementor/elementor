import React, { Suspense } from 'react';
import { useLocation } from '../hooks/useLocation';

export const Slot = ( { name } ) => {
	const components = useLocation( name );

	return components.map( ( Component, index ) => (
		<Suspense key={ index } fallback={ null }>
			<Component />
		</Suspense>
	) );
};
