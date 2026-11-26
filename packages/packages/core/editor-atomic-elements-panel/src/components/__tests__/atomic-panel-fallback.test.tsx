import * as React from 'react';
import { render } from '@testing-library/react';

import { getElementsPanelSelection, setElementsPanelSelection } from '../../elements-panel-selection';
import { isLegacyHidingDisabled } from '../../legacy-hiding/legacy-hiding-state';
import { AtomicPanelFallback } from '../atomic-panel-fallback';

describe( 'AtomicPanelFallback', () => {
	beforeEach( () => {
		setElementsPanelSelection( 'atomic' );
	} );

	it( 'should disable legacy hiding and switch to the legacy panel', () => {
		// Arrange.
		const close = jest.fn().mockResolvedValue( undefined );

		// Act.
		render( <AtomicPanelFallback close={ close } /> );

		// Assert.
		expect( isLegacyHidingDisabled() ).toBe( true );
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
		expect( close ).toHaveBeenCalledTimes( 1 );
	} );
} );
