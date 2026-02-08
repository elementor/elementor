import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { InteractionsList } from '../components/interactions-list';
import { PopupStateProvider } from '../contexts/popup-state-context';
import { type ElementInteractions } from '../types';

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
								duration: {
									$$type: 'size',
									value: {
										size: duration,
										unit: 'ms',
									},
								},
								delay: {
									$$type: 'size',
									value: {
										size: delay,
										unit: 'ms',
									},
								},
							},
						},
						config: {
							$$type: 'config',
							value: {
								replay: { $$type: 'boolean', value: false },
								easing: { $$type: 'string', value: 'easeIn' },
								relativeTo: { $$type: 'string', value: 'viewport' },
								offsetTop: { $$type: 'size', value: { size: 15, unit: '%' } },
								offsetBottom: { $$type: 'size', value: { size: 85, unit: '%' } },
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

describe( 'InteractionsList onPlayInteraction', () => {
	it( 'should call onPlayInteraction when preview button is clicked', () => {
		const mockOnPlayInteraction = jest.fn();
		const interactions = createInteraction( 'load', 'fade', 'in', '', 300, 0 );

		render(
			<PopupStateProvider>
				<InteractionsList
					interactions={ interactions }
					onSelectInteractions={ jest.fn() }
					onPlayInteraction={ mockOnPlayInteraction }
				/>
			</PopupStateProvider>
		);

		const previewButton = screen.getByLabelText( /play interaction/i );
		fireEvent.click( previewButton );

		expect( mockOnPlayInteraction ).toHaveBeenCalledWith( 'test-id' );
	} );

	it( 'should call onPlayInteraction with correct interaction ID for each item', () => {
		const mockOnPlayInteraction = jest.fn();
		const interactions = {
			version: 1,
			items: [
				{
					$$type: 'interaction-item',
					value: {
						interaction_id: { $$type: 'string', value: 'id-1' },
						trigger: { $$type: 'string', value: 'load' },
						animation: {
							$$type: 'animation-preset-props',
							value: {
								effect: { $$type: 'string', value: 'fade' },
								type: { $$type: 'string', value: 'in' },
								direction: { $$type: 'string', value: '' },
								timing_config: {
									$$type: 'timing-config',
									value: {
										duration: {
											$$type: 'size',
											value: {
												size: 300,
												unit: 'ms',
											},
										},
										delay: {
											$$type: 'size',
											value: {
												size: 0,
												unit: 'ms',
											},
										},
									},
								},
							},
						},
					},
				},
				{
					$$type: 'interaction-item',
					value: {
						interaction_id: { $$type: 'string', value: 'id-2' },
						trigger: { $$type: 'string', value: 'scrollIn' },
						animation: {
							$$type: 'animation-preset-props',
							value: {
								effect: { $$type: 'string', value: 'slide' },
								type: { $$type: 'string', value: 'in' },
								direction: { $$type: 'string', value: 'top' },
								timing_config: {
									$$type: 'timing-config',
									value: {
										duration: {
											$$type: 'number',
											value: {
												size: 500,
												unit: 'ms',
											},
										},
										delay: {
											$$type: 'number',
											value: {
												size: 0,
												unit: 'ms',
											},
										},
									},
								},
							},
						},
					},
				},
			],
		};

		render(
			<PopupStateProvider>
				<InteractionsList
					interactions={ interactions as ElementInteractions }
					onSelectInteractions={ jest.fn() }
					onPlayInteraction={ mockOnPlayInteraction }
				/>
			</PopupStateProvider>
		);

		const previewButtons = screen.getAllByLabelText( /play interaction/i );
		fireEvent.click( previewButtons[ 0 ] );
		expect( mockOnPlayInteraction ).toHaveBeenCalledWith( 'id-1' );

		fireEvent.click( previewButtons[ 1 ] );
		expect( mockOnPlayInteraction ).toHaveBeenCalledWith( 'id-2' );
	} );

	it( 'should handle interactions with breakpoints data', () => {
		const mockOnPlayInteraction = jest.fn();
		const interactions = {
			version: 1,
			items: [
				{
					$$type: 'interaction-item',
					value: {
						interaction_id: { $$type: 'string', value: 'id-with-breakpoints' },
						trigger: { $$type: 'string', value: 'load' },
						animation: {
							$$type: 'animation-preset-props',
							value: {
								effect: { $$type: 'string', value: 'fade' },
								type: { $$type: 'string', value: 'in' },
								direction: { $$type: 'string', value: '' },
								timing_config: {
									$$type: 'timing-config',
									value: {
										duration: {
											$$type: 'size',
											value: {
												size: 300,
												unit: 'ms',
											},
										},
										delay: {
											$$type: 'size',
											value: {
												size: 0,
												unit: 'ms',
											},
										},
									},
								},
							},
						},
						breakpoints: {
							$$type: 'interaction-breakpoints',
							value: {
								excluded: {
									$$type: 'excluded-breakpoints',
									value: [
										{ $$type: 'string', value: 'desktop' },
										{ $$type: 'string', value: 'tablet' },
									],
								},
							},
						},
					},
				},
			],
		};

		render(
			<PopupStateProvider>
				<InteractionsList
					interactions={ interactions as ElementInteractions }
					onSelectInteractions={ jest.fn() }
					onPlayInteraction={ mockOnPlayInteraction }
				/>
			</PopupStateProvider>
		);

		expect( screen.getByText( 'On page load: Fade In' ) ).toBeInTheDocument();
	} );
} );
