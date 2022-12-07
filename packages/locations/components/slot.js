import React, { Suspense } from 'react';
import elementorLocations from '../';

export const Slot = ( { name } ) => {
	const components = elementorLocations.get( name ) ?? [];

	return components.map( ( Component, index ) => (
		<Suspense key={ index } fallback={ null }>
			<Component />
		</Suspense>
	) );
};
