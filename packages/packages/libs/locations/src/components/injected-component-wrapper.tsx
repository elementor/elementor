import * as React from 'react';
import { type ReactNode, Suspense } from 'react';

import ErrorBoundary from './error-boundary';

export default function InjectedComponentWrapper( { children }: { children: ReactNode } ) {
	return (
		<ErrorBoundary fallback={ null }>
			<Suspense fallback={ null }>{ children }</Suspense>
		</ErrorBoundary>
	);
}
