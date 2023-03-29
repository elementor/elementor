import { ReactNode, Suspense } from 'react';
import ErrorBoundary from './error-boundary';

export default function FillerWrapper( { children }: { children: ReactNode } ) {
	return (
		<ErrorBoundary fallback={ null }>
			<Suspense fallback={ null }>
				{ children }
			</Suspense>
		</ErrorBoundary>
	);
}
