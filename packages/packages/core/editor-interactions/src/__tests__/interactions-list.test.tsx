import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { InteractionsList } from '../components/interactions-list';
import { PopupStateProvider } from '../contexts/popup-state-context';
import type { ElementInteractions } from '../types';

jest.mock( '../utils/get-interactions-config' );

const createInteraction = (
	trigger: string,
	effect: string,
	type: string,
	direction: string,
	duration: number,
	delay: number
): ElementInteractions => ( {
	version: 1,
	items: [
		{
			$$type: 'interaction-item',
			value: {
				interaction_id: { $$type: 'string', value: 'test-id' },
				trigger: { $$type: 'string', value: trigger },
				animation: {
					$$type: 'animation-preset-props',
					value: {
						effect: { $$type: 'string', value: effect },
						type: { $$type: 'string', value: type },
						direction: { $$type: 'string', value: direction },
						timing_config: {
							$$type: 'timing-config',
							value: {
								duration: { $$type: 'number', value: duration },
								delay: { $$type: 'number', value: delay },
							},
						},
					},
				},
			},
		},
	],
} );

describe( 'InteractionsList', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	test.each( [
		[ 'load', 'fade', 'in', '', 300, 0, 'On page load: Fade In' ],
		[ 'load', 'fade', 'in', '', 500, 0, 'On page load: Fade In' ],
		[ 'scrollOut', 'fade', 'out', '', 800, 200, 'Scroll out of view: Fade Out' ],
		[ 'scrollIn', 'slide', 'in', 'top', 600, 0, 'Scroll into view: Slide In' ],
	] )(
		'displays formatted label for trigger=%s effect=%s type=%s',
		( trigger, effect, type, direction, duration, delay, expectedLabel ) => {
			// Arrange
			const onSelectInteractions = jest.fn();
			const interactions = createInteraction( trigger, effect, type, direction, duration, delay );

			// Act
			render(
				<PopupStateProvider>
					<InteractionsList
						interactions={ interactions }
						onSelectInteractions={ onSelectInteractions }
						onPlayInteraction={ jest.fn() }
					/>
				</PopupStateProvider>
			);

			// Assert
			expect( screen.getByText( expectedLabel ) ).toBeInTheDocument();
		}
	);
} );
