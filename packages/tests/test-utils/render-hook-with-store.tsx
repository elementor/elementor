import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { __StoreProvider as StoreProvider, type Store } from '@elementor/store';
import { renderHook } from '@testing-library/react';

export default function renderHookWithStore< T >( hook: () => T, store: Store ) {
	const wrapper = ( { children }: PropsWithChildren< unknown > ) => (
		<StoreProvider store={ store }>{ children }</StoreProvider>
	);

	return renderHook( hook, {
		wrapper,
	} );
}
