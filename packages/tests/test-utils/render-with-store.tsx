import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { __StoreProvider as StoreProvider, type Store } from '@elementor/store';

import { renderWithTheme } from './render-with-theme';

export default function renderWithStore( Component: React.ReactElement, store: Store ) {
	const Wrapper = ( { children }: PropsWithChildren< unknown > ) => (
		<StoreProvider store={ store }>{ children }</StoreProvider>
	);

	const { rerender, ...rest } = renderWithTheme( <Wrapper>{ Component }</Wrapper> );

	return {
		...rest,
		rerender: ( newComponent: React.ReactElement ) => {
			rerender( <Wrapper>{ newComponent }</Wrapper> );
		},
	};
}
