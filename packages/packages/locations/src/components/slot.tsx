import { Suspense } from 'react';
import useFills from '../hooks/use-fills';

type SlotProps = {
	location: string;
}

// TODO: <ErrorBoundary />
export default function Slot( { location }: SlotProps ) {
	const fillers = useFills( location );

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
