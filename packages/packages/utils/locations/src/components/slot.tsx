import React, { Suspense } from 'react';
import { useLocation } from '../hooks/use-location';

type Props = {
	  name: string;
}

export const Slot : React.FC<Props> = ( { name } ) => {
	const components = useLocation( name );

	return (
		<Suspense fallback={ null }>
			{
				components.map( ( Component, index ) => (
					<Component key={ index } />
				) )
			}
		</Suspense>
	);
};
