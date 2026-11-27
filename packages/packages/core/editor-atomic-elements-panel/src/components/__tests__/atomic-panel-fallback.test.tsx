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
		let isDisabledOnClose: boolean | null = null;
		const close = jest.fn( () => {
			// Closing rebuilds Legacy synchronously, so hiding must already be off by then.
			isDisabledOnClose = isLegacyHidingDisabled();

			return Promise.resolve();
		} );

		// Act.
		render( <AtomicPanelFallback close={ close } /> );

		// Assert.
		expect( close ).toHaveBeenCalledTimes( 1 );
		expect( isDisabledOnClose ).toBe( true );
		expect( isLegacyHidingDisabled() ).toBe( true );
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
	} );
} );
