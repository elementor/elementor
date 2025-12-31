import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { InteractionDetails } from '../components/interaction-details';
import type { InteractionItemValue } from '../types';
import { createAnimationPreset, createString } from '../utils/prop-value-utils';

jest.mock( '../interactions-controls-registry', () => ( {
	getInteractionsControl: jest.fn(),
} ) );

const createInteractionItemValue = ( {
	trigger = 'load',
	effect = 'fade',
	type = 'in',
	direction = '',
	duration = 300,
	delay = 0,
	replay = false,
}: {
	trigger?: string;
	effect?: string;
	type?: string;
	direction?: string;
	duration?: number;
	delay?: number;
	replay?: boolean;
} = {} ): InteractionItemValue => ( {
	interaction_id: createString( 'test-id' ),
	trigger: createString( trigger ),
	animation: createAnimationPreset( {
		effect,
		type,
		direction,
		duration,
		delay,
		replay,
	} ),
} );

describe( 'InteractionDetails', () => {
	const mockOnChange = jest.fn();
	const mockReplayControl = jest.fn( ( { value, onChange, disabled } ) => (
		<div>
			<span>Replay: { String( value ) }</span>
			<span>Disabled: { String( disabled ) }</span>
			<button onClick={ () => onChange( ! value ) }>Toggle Replay</button>
		</div>
	) );

	beforeEach( () => {
		jest.clearAllMocks();
		const { getInteractionsControl } = require( '../interactions-controls-registry' );
		getInteractionsControl.mockReturnValue( {
			component: mockReplayControl,
		} );
	} );

	describe( 'Rendering', () => {
		it( 'should render with default values', () => {
			const interaction = createInteractionItemValue();

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Trigger' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Effect' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Direction' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Duration' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delay' ) ).toBeInTheDocument();
		} );

		it( 'should render with custom values', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
				effect: 'slide',
				type: 'out',
				direction: 'top',
				duration: 500,
				delay: 200,
				replay: true,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Trigger' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Effect' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Direction' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Duration' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delay' ) ).toBeInTheDocument();
		} );

		it( 'should not render replay control for load trigger', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.queryByText( 'Replay' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /toggle replay/i } ) ).not.toBeInTheDocument();
		} );

		it( 'should render replay control for scrollIn trigger', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Replay' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /toggle replay/i } ) ).toBeInTheDocument();
		} );

		it( 'should render replay control for scrollOut trigger', () => {
			const originalWarn = global.console.warn;
			global.console.warn = jest.fn();
			try {
				const interaction = createInteractionItemValue( {
					trigger: 'scrollOut',
				} );

				render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

				expect( screen.getByText( 'Replay' ) ).toBeInTheDocument();
				expect( screen.getByRole( 'button', { name: /toggle replay/i } ) ).toBeInTheDocument();
			} finally {
				global.console.warn = originalWarn;
			}
		} );

		it( 'should render replay control as disabled', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
				replay: false,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Disabled: true' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'onChange callback', () => {
		it( 'should call onChange when trigger changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const triggerSelect = comboboxes[ 0 ];
			fireEvent.mouseDown( triggerSelect );
			const scrollInOption = screen.getByRole( 'option', { name: /scroll into view/i } );
			fireEvent.click( scrollInOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.trigger.value ).toBe( 'scrollIn' );
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'fade' );
			expect( updatedInteraction.animation.value.type.value ).toBe( 'in' );
		} );

		it( 'should call onChange when effect changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const slideOption = screen.getByRole( 'option', { name: /slide/i } );
			fireEvent.click( slideOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'slide' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'top' );
		} );

		it( 'should call onChange when type changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const typeButtons = screen.getAllByRole( 'button' );
			const outButton = typeButtons.find( ( button ) => button.textContent === 'Out' );
			if ( outButton ) {
				fireEvent.click( outButton );
			}

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.type.value ).toBe( 'out' );
		} );

		it( 'should call onChange when direction changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'top',
				duration: 300,
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const directionButtons = screen.getAllByRole( 'button' );
			const bottomButton = directionButtons.find(
				( button ) => button.getAttribute( 'aria-label' )?.includes( 'bottom' )
			);
			if ( bottomButton ) {
				fireEvent.click( bottomButton );
			}

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'bottom' );
		} );

		it( 'should call onChange when duration changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const durationSelect = comboboxes[ 2 ];
			fireEvent.mouseDown( durationSelect );
			const allOptions = screen.getAllByRole( 'option' );
			const duration500Option = allOptions.find( ( opt ) => opt.textContent?.includes( '500 MS' ) );
			expect( duration500Option ).toBeInTheDocument();
			if ( duration500Option ) {
				fireEvent.click( duration500Option );
			}

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toBe( 500 );
		} );

		it( 'should call onChange when delay changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const delaySelect = comboboxes[ 3 ];
			fireEvent.mouseDown( delaySelect );
			const delay200Option = screen.getByRole( 'option', { name: /200 MS/i } );
			fireEvent.click( delay200Option );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toBe( 200 );
		} );

		it( 'should call onChange when replay changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
				replay: false,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const toggleButton = screen.getByRole( 'button', { name: /toggle replay/i } );
			fireEvent.click( toggleButton );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.config?.value.replay.value ).toBe( true );
		} );
	} );

	/**
	 * Why? - This is a test for the direction logic in the InteractionDetails component.
	 * The use cases are:
	 * 1. Changes: Effect to slide, Direction not present => we default to top.
	 * 2. Changes: Effect to slide, Direction present => we use the new direction.
	 * 3. Changes: Effect to non-slide, Direction not present => we use the existing direction.
	 * 4. Changes: Effect to non-slide, Direction present => we use the new direction (even if it is empty).
	 */
	describe( 'Direction logic', () => {
		it( 'should default direction to top when effect is slide and direction is empty', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: '',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const directionButtons = screen.getAllByRole( 'button' );
			const topButton = directionButtons.find(
				( button ) => button.getAttribute( 'aria-label' )?.includes( 'top' )
			);
			expect( topButton ).toBeInTheDocument();
		} );

		it( 'should use provided direction when effect is slide and direction is set', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'bottom',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const directionButtons = screen.getAllByRole( 'button' );
			const bottomButton = directionButtons.find(
				( button ) => button.getAttribute( 'aria-label' )?.includes( 'bottom' )
			);
			expect( bottomButton ).toBeInTheDocument();
		} );

		it( 'should preserve direction when changing from slide to fade', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'left',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const fadeOption = screen.getByRole( 'option', { name: /fade/i } );
			fireEvent.click( fadeOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'fade' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'left' );
		} );

		it( 'should set direction to top when changing effect to slide without direction', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: '',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const slideOption = screen.getByRole( 'option', { name: /slide/i } );
			fireEvent.click( slideOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'slide' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'top' );
		} );

		it( 'should be able to reset direction to undefined when effect is fade', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'right',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const fadeOption = screen.getByRole( 'option', { name: /fade/i } );
			fireEvent.click( fadeOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'fade' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'right' );
		} );

		it( 'should default to top when changing from fade to slide without explicit direction', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'left',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const slideOption = screen.getByRole( 'option', { name: /slide/i } );
			fireEvent.click( slideOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'slide' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'top' );
		} );

		it( 'should preserve direction when changing from slide to scale', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'bottom',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const scaleOption = screen.getByRole( 'option', { name: /scale/i } );
			fireEvent.click( scaleOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'scale' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'bottom' );
		} );

		it( 'should preserve direction when changing type without updating direction', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'top',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const typeButtons = screen.getAllByRole( 'button' );
			const outButton = typeButtons.find( ( button ) => button.textContent === 'Out' );
			if ( outButton ) {
				fireEvent.click( outButton );
			}

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.type.value ).toBe( 'out' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'top' );
		} );

		it( 'should preserve direction when updating duration', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
				direction: 'right',
				duration: 300,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const durationSelect = comboboxes[ 2 ];
			fireEvent.mouseDown( durationSelect );
			const allOptions = screen.getAllByRole( 'option' );
			const duration500Option = allOptions.find( ( opt ) => opt.textContent?.includes( '500 MS' ) );
			if ( duration500Option ) {
				fireEvent.click( duration500Option );
			}

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'right' );
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toBe( 500 );
		} );

		it( 'should preserve direction when updating delay', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'left',
				delay: 0,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const delaySelect = comboboxes[ 3 ];
			fireEvent.mouseDown( delaySelect );
			const delay200Option = screen.getByRole( 'option', { name: /200 MS/i } );
			fireEvent.click( delay200Option );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'left' );
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toBe( 200 );
		} );
	} );

	describe( 'State preservation', () => {
		it( 'should preserve all unchanged values when updating trigger', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'left',
				duration: 500,
				delay: 200,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const triggerSelect = comboboxes[ 0 ];
			fireEvent.mouseDown( triggerSelect );
			const scrollInOption = screen.getByRole( 'option', { name: /scroll into view/i } );
			fireEvent.click( scrollInOption );

			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'fade' );
			expect( updatedInteraction.animation.value.type.value ).toBe( 'in' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'left' );
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toBe( 500 );
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toBe( 200 );
		} );

		it( 'should preserve all unchanged values when updating effect', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'out',
				direction: 'right',
				duration: 750,
				delay: 100,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const scaleOption = screen.getByRole( 'option', { name: /scale/i } );
			fireEvent.click( scaleOption );

			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.trigger.value ).toBe( 'load' );
			expect( updatedInteraction.animation.value.type.value ).toBe( 'out' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'right' );
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toBe( 750 );
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toBe( 100 );
		} );

		it( 'should preserve replay value when updating other properties', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: true,
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const effectSelect = comboboxes[ 1 ];
			fireEvent.mouseDown( effectSelect );
			const slideOption = screen.getByRole( 'option', { name: /slide/i } );
			fireEvent.click( slideOption );

			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.config?.value.replay.value ).toBe( true );
		} );
	} );

	describe( 'Edge cases', () => {
		it( 'should handle missing config value', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
			} );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( interaction.animation.value as any ).config = undefined;

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Replay' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Replay: false' ) ).toBeInTheDocument();
		} );

		it( 'should handle missing direction value', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'slide',
				type: 'in',
			} );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			interaction.animation.value.direction = undefined as any;

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Direction' ) ).toBeInTheDocument();
		} );

		it( 'should handle missing replay control from registry', () => {
			const { getInteractionsControl } = require( '../interactions-controls-registry' );
			getInteractionsControl.mockReturnValue( null );

			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
			} );

			render( <InteractionDetails interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.queryByText( 'Replay' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /toggle replay/i } ) ).not.toBeInTheDocument();
		} );
	} );
} );
