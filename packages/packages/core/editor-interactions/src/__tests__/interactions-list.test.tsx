import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { InteractionsList } from '../components/interactions-list';
import { PopupStateProvider } from '../contexts/popup-state-context';
import { getInteractionsConfig } from '../utils/get-interactions-config';

jest.mock( '../utils/get-interactions-config' );

const mockedGetInteractionsConfig = getInteractionsConfig as jest.MockedFunction< typeof getInteractionsConfig >;

describe( 'InteractionsList', () => {
	beforeEach( () => {
		mockedGetInteractionsConfig.mockReturnValue( {
			animationOptions: [
				{ value: 'load-fade-in--300-0', label: 'On page load: Fade In (300ms/0ms)' },
				{ value: 'load-fade-in--500-0', label: 'On page load: Fade In (500ms/0ms)' },
				{ value: 'scrollIn-slide-in-top-600-0', label: 'Scroll into view: Slide In Top (600ms/0ms)' },
				{ value: 'scrollOut-fade-out--800-200', label: 'Scroll out of view: Fade Out (800ms/200ms)' },
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
		[ 'load-fade-in--300-0', 'On page load: Fade In (300ms/0ms)' ],
		[ 'load-fade-in--500-0', 'On page load: Fade In (500ms/0ms)' ],
		[ 'scrollOut-fade-out--800-200', 'Scroll out of view: Fade Out (800ms/200ms)' ],
		[ 'scrollIn-slide-in-top-600-0', 'Scroll into view: Slide In Top (600ms/0ms)' ],
	] )( 'displays formatted label "%s" for interaction "%s"', ( selectedInteraction, expectedLabel ) => {
		// Arrange.
		const onSelectInteractions = jest.fn();

		// Act.
		render(
			<PopupStateProvider>
				<InteractionsList
					interactions={ {
						version: 1,
						items: [ { animation: { animation_type: 'load-fade-in', animation_id: selectedInteraction } } ],
					} }
					onSelectInteractions={ onSelectInteractions }
					onPlayInteraction={ jest.fn() }
				/>
			</PopupStateProvider>
		);

		// Assert.
		expect( screen.getByText( expectedLabel ) ).toBeInTheDocument();
	} );
} );
