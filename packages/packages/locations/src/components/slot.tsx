import * as React from 'react';
import useInjectionsOf from '../hooks/use-injections-of';
import { Location } from '../types';

export default function Slot( { location }: { location: Location } ) {
	const injections = useInjectionsOf( location );

	return (
		<>
			{ injections.map( ( { id, filler: Filler } ) => (
				<Filler key={ id } />
			) ) }
		</>
	);
}
