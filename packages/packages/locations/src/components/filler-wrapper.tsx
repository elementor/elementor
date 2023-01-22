import { ReactNode, Suspense } from 'react';

// TODO: <ErrorBoundary />
export default function FillerWrapper( { children }: { children: ReactNode } ) {
	return (
		<Suspense fallback={ null }>
			{ children }
		</Suspense>
	);
}
