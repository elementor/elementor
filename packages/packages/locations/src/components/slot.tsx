import * as React from 'react';
import useInjectionsAt from '../hooks/use-injections-at';
import { Location } from '../types';

export default function Slot( { location }: { location: Location } ) {
	const injections = useInjectionsAt( location );

	return (
		<>
			{ injections.map( ( { id, filler: Filler } ) => (
				<Filler key={ id } />
			) ) }
		</>
	);
}
