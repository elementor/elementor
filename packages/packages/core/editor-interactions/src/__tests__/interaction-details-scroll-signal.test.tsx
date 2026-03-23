import * as React from 'react';
import { renderWithTheme } from 'test-utils';

import { InteractionDetails } from '../components/interaction-details';
import { setActiveScrollInteraction } from '../stores/active-scroll-interaction-store';
import { createInteractionItemValue } from './utils';

jest.mock( '../interactions-controls-registry', () => ( {
	getInteractionsControl: jest.fn( () => null ),
} ) );

jest.mock( '../stores/active-scroll-interaction-store', () => ( {
	setActiveScrollInteraction: jest.fn(),
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

	it( 'should call setActiveScrollInteraction when trigger is scrollOn', () => {
		renderDetails( { trigger: 'scrollOn', start: 85, end: 15 } );

		expect( setActiveScrollInteraction ).toHaveBeenCalledWith(
			expect.objectContaining( {
				relativeTo: 'viewport',
			} )
		);
	} );

	it( 'should not set active scroll interaction for non-scrollOn triggers', () => {
		renderDetails( { trigger: 'load' } );

		expect( setActiveScrollInteraction ).toHaveBeenCalledWith( null );
	} );

	it( 'should clear active scroll interaction on unmount', () => {
		const { unmount } = renderDetails( { trigger: 'scrollOn', start: 80, end: 20 } );

		jest.clearAllMocks();
		unmount();

		expect( setActiveScrollInteraction ).toHaveBeenCalledWith( null );
	} );
} );
