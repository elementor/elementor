import * as React from 'react';
import { render } from '@testing-library/react';

import { getElementsPanelSelection, setElementsPanelSelection } from '../../elements-panel-selection';
import { AtomicElementsPanel } from '../atomic-elements-panel';

jest.mock( '@elementor/editor-panels', () => {
	const Passthrough = ( { children }: React.PropsWithChildren ) => <>{ children }</>;
	const Throwing = () => {
		throw new Error( 'render failed' );
	};

	return {
		Panel: Throwing,
		PanelHeader: Passthrough,
		PanelHeaderTitle: Passthrough,
		PanelBody: Passthrough,
	};
} );

describe( 'AtomicElementsPanel', () => {
	it( 'should fall back to the legacy panel when the atomic panel fails to render', () => {
		// Arrange.
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		setElementsPanelSelection( 'atomic' );
		const close = jest.fn();

		// Act.
		render( <AtomicElementsPanel isBlocked={ false } open={ jest.fn() } close={ close } /> );

		// Assert.
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
		expect( close ).toHaveBeenCalled();
	} );
} );
