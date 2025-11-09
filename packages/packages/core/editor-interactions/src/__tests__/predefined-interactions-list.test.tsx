import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { PredefinedInteractionsList } from '../components/interactions-list';
import { PopupStateProvider } from '../contexts/popup-state-context';
import { getInteractionsConfig } from '../utils/get-interactions-config';

jest.mock( '../utils/get-interactions-config' );

const mockedGetInteractionsConfig = getInteractionsConfig as jest.MockedFunction< typeof getInteractionsConfig >;

describe( 'PredefinedInteractionsList', () => {
	beforeEach( () => {
		mockedGetInteractionsConfig.mockReturnValue( {
			animationOptions: [
				{ value: 'load-fade-in-', label: 'Page Load - Fade In' },
				{ value: 'scrollIn-slide-in-top', label: 'Scroll Into View - Slide In Up' },
				{ value: 'scrollOut-fade-out-', label: 'Scroll Out Of View - Fade Out' },
			],
			constants: {
				defaultDuration: 300,
				defaultDelay: 0,
				slideDistance: 0,
				scaleStart: 0,
				easing: '',
			},
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	test.each( [
		[ 'load-fade-in-', 'Page Load - Fade In' ],
		[ 'load-fade-in--500', 'Page Load - Fade In (500ms)' ],
		[ 'scrollOut-fade-out--800-200', 'Scroll Out Of View - Fade Out (800ms, 200ms delay)' ],
		[ 'scrollIn-slide-in-top-600', 'Scroll Into View - Slide In Up (600ms)' ],
	] )( 'displays formatted label "%s" for interaction "%s"', ( selectedInteraction, expectedLabel ) => {
		// Arrange.
		const onSelectInteraction = jest.fn();

		// Act.
		render(
			<PopupStateProvider>
				<PredefinedInteractionsList
					selectedInteraction={ selectedInteraction }
					onSelectInteraction={ onSelectInteraction }
				/>
			</PopupStateProvider>
		);

		// Assert.
		expect( screen.getByText( expectedLabel ) ).toBeInTheDocument();
	} );
} );
