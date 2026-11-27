import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ComponentsPanel } from '../components-panel';

jest.mock( '@elementor/editor-elements-panel', () => ( {
	getTab: jest.fn( () => ( { component: () => <div>tab</div> } ) ),
} ) );

jest.mock( '@elementor/editor-panels', () => ( {
	Panel: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	PanelHeader: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	PanelHeaderTitle: ( { children }: { children: React.ReactNode } ) => <h2>{ children }</h2>,
	PanelBody: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

describe( 'ComponentsPanel', () => {
	it( 'should close the panel when the Close button is clicked', async () => {
		// Arrange.
		const close = jest.fn();
		render( <ComponentsPanel onRequestClose={ close } /> );

		// Act.
		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		// Assert.
		expect( close ).toHaveBeenCalledTimes( 1 );
	} );
} );
