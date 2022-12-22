import React, { Suspense } from 'react';
import useFillers from '../hooks/use-fillers';

type SlotProps = {
	name: string;
}

// TODO: <ErrorBoundary />
export default function Slot( { name }: SlotProps ) {
	const fillers = useFillers( name );

	return (
		<>
			{ fillers.map( ( { component: Component }, index ) => (
				<Suspense fallback={ null } key={ index }>
					<Component />
				</Suspense>
			) ) }
		</>
	);
}
