import * as React from 'react';
import { renderWithTheme } from 'test-utils';

import { InteractionDetails } from '../components/interaction-details';
import { dispatchScrollInteraction } from '../scroll-interaction-event';
import { createInteractionItemValue } from './utils';

jest.mock( '../interactions-controls-registry', () => ( {
	getInteractionsControl: jest.fn( () => null ),
} ) );

jest.mock( '../scroll-interaction-event', () => ( {
	dispatchScrollInteraction: jest.fn(),
} ) );

const mockOnChange = jest.fn();
const mockOnPlayInteraction = jest.fn();

function renderDetails( overrides = {} ) {
	const interaction = createInteractionItemValue( overrides );
	return renderWithTheme(
		<InteractionDetails
			interaction={ interaction }
			onChange={ mockOnChange }
			onPlayInteraction={ mockOnPlayInteraction }
		/>
	);
}

describe( 'InteractionDetails scroll signal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should dispatch scroll interaction when trigger is scrollOn', () => {
		renderDetails( { trigger: 'scrollOn', start: 85, end: 15 } );

		expect( dispatchScrollInteraction ).toHaveBeenCalledWith(
			expect.objectContaining( {
				relativeTo: 'viewport',
			} )
		);
	} );

	it( 'should dispatch null for non-scrollOn triggers', () => {
		renderDetails( { trigger: 'load' } );

		expect( dispatchScrollInteraction ).toHaveBeenCalledWith( null );
	} );

	it( 'should dispatch null on unmount', () => {
		const { unmount } = renderDetails( { trigger: 'scrollOn', start: 80, end: 20 } );

		jest.clearAllMocks();
		unmount();

		expect( dispatchScrollInteraction ).toHaveBeenCalledWith( null );
	} );
} );
