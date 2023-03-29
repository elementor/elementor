import * as React from 'react';
import useInjectionsOf from '../hooks/use-injections-of';
import { Location } from '../types';

type Props = {
	location: Location
}

export default function Slot( { location }: Props ) {
	const injections = useInjectionsOf( location );

	return (
		<>
			{ injections.map( ( { id, filler: Filler } ) => (
				<Filler key={ id } />
			) ) }
		</>
	);
}
