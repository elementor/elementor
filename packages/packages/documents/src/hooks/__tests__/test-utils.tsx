import { Store, StoreProvider } from '@elementor/store';
import { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react-hooks';

export function renderHookWithStore( hook: () => unknown, store: Store ) {
	const wrapper = ( { children }: PropsWithChildren<unknown> ) => (
		<StoreProvider store={ store }>
			{ children }
		</StoreProvider>
	);

	return renderHook( hook, {
		wrapper,
	} );
}
