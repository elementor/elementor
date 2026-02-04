import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { Easing } from '../components/controls/easing';
import { Trigger } from '../components/controls/trigger';
import { InteractionDetails } from '../components/interaction-details';
import type { InteractionItemValue } from '../types';
import { extractExcludedBreakpoints } from '../utils/prop-value-utils';
import { createInteractionItemValue } from './utils';

jest.mock( '../interactions-controls-registry', () => ( {
	getInteractionsControl: jest.fn(),
} ) );

const getEffectCombobox = (): HTMLElement => {
	const allComboboxes = screen.getAllByRole( 'combobox' );
	const effectSelectByProximity = allComboboxes.find( ( cb ) => {
		try {
			const container = within( cb );
			container.getByText( 'Effect' );
			return true;
		} catch {
			return false;
		}
	} );
	if ( effectSelectByProximity ) {
		return effectSelectByProximity;
	}
	const labelParent = screen.getByText( 'Effect', { selector: 'label' } );
	const labelContainer = within( labelParent );
	try {
		return labelContainer.getByRole( 'combobox' );
	} catch {
		return allComboboxes[ 1 ];
	}
};

describe( 'InteractionDetails', () => {
	const mockOnChange = jest.fn();

	const mockReplayControl = jest.fn( ( { value, onChange, disabled } ) => (
		<div>
			<span>Replay: { String( value ) }</span>
			<span>Disabled: { String( disabled ) }</span>
			<button onClick={ () => onChange( ! value ) }>Toggle Replay</button>
		</div>
	) );

	const mockOnPlayInteraction = jest.fn();

	const renderInteractionDetails = ( interaction: InteractionItemValue ) => {
		return render(
			<InteractionDetails
				interaction={ interaction }
				onChange={ mockOnChange }
				onPlayInteraction={ mockOnPlayInteraction }
			/>
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
		const { getInteractionsControl } = require( '../interactions-controls-registry' );

		getInteractionsControl.mockImplementation( ( type: string ) => {
			if ( type === 'trigger' ) {
				return {
					component: Trigger,
				};
			}

			if ( type === 'replay' ) {
				return {
					component: mockReplayControl,
				};
			}

			if ( type === 'easing' ) {
				return {
					component: Easing,
				};
			}

			return null;
		} );
	} );

	describe( 'Rendering', () => {
		it( 'should render with default values', () => {
			const interaction = createInteractionItemValue();

			renderInteractionDetails( interaction );

			expect( screen.getByText( 'Trigger' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Effect' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Direction' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Duration' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delay' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Easing' ) ).toBeInTheDocument();
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
				easing: 'easeIn',
			} );

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

			expect( screen.queryByText( 'Replay' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /toggle replay/i } ) ).not.toBeInTheDocument();
		} );

		it( 'should render replay control for scrollIn trigger', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
			} );

			renderInteractionDetails( interaction );

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

				renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

			const sizeInputs = screen.getAllByRole( 'spinbutton' );
			const durationInput = sizeInputs[ 0 ];

			expect( durationInput ).toHaveValue( 300 );

			fireEvent.input( durationInput, { target: { value: 354 } } );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toEqual( {
				size: 354,
				unit: 'ms',
			} );
		} );

		it( 'should call onChange when delay changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
			} );

			renderInteractionDetails( interaction );

			const sizeInputs = screen.getAllByRole( 'spinbutton' );
			const durationInput = sizeInputs[ 1 ];

			expect( durationInput ).toHaveValue( 0 );

			fireEvent.input( durationInput, { target: { value: 200 } } );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toEqual( {
				size: 200,
				unit: 'ms',
			} );
		} );

		it( 'should prevent negative values for duration', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 0,
				delay: 0,
			} );

			renderInteractionDetails( interaction );

			const sizeInputs = screen.getAllByRole( 'spinbutton' );
			fireEvent.keyDown( sizeInputs[ 0 ], { key: '-' } );

			expect( mockOnChange ).not.toHaveBeenCalled();
		} );

		it( 'should call onChange when replay changes', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
				replay: false,
			} );

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

			const sizeInputs = screen.getAllByRole( 'spinbutton' );
			const durationInput = sizeInputs[ 0 ];

			expect( durationInput ).toHaveValue( 300 );

			fireEvent.input( durationInput, { target: { value: 500 } } );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'right' );
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toEqual( {
				size: 500,
				unit: 'ms',
			} );
		} );

		it( 'should preserve direction when updating delay', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'left',
				delay: 0,
			} );

			renderInteractionDetails( interaction );

			const sizeInputs = screen.getAllByRole( 'spinbutton' );
			const durationInput = sizeInputs[ 1 ];

			expect( durationInput ).toHaveValue( 0 );

			fireEvent.input( durationInput, { target: { value: 200 } } );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'left' );
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toEqual( {
				size: 200,
				unit: 'ms',
			} );
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

			renderInteractionDetails( interaction );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const triggerSelect = comboboxes[ 0 ];
			fireEvent.mouseDown( triggerSelect );
			const scrollInOption = screen.getByRole( 'option', { name: /scroll into view/i } );
			fireEvent.click( scrollInOption );

			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'fade' );
			expect( updatedInteraction.animation.value.type.value ).toBe( 'in' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'left' );
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toEqual( {
				size: 500,
				unit: 'ms',
			} );
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toEqual( {
				size: 200,
				unit: 'ms',
			} );
		} );

		it( 'should preserve breakpoints when updating other properties', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				excludedBreakpoints: [ 'desktop', 'tablet' ],
			} );

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
			fireEvent.mouseDown( effectSelect );
			const slideOption = screen.getByRole( 'option', { name: /slide/i } );
			fireEvent.click( slideOption );

			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.breakpoints ).toBeDefined();

			const excluded = extractExcludedBreakpoints( updatedInteraction.breakpoints );
			expect( excluded ).toEqual( [ 'desktop', 'tablet' ] );
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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
			fireEvent.mouseDown( effectSelect );
			const scaleOption = screen.getByRole( 'option', { name: /scale/i } );
			fireEvent.click( scaleOption );

			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.trigger.value ).toBe( 'load' );
			expect( updatedInteraction.animation.value.type.value ).toBe( 'out' );
			expect( updatedInteraction.animation.value.direction.value ).toBe( 'right' );
			expect( updatedInteraction.animation.value.timing_config.value.duration.value ).toEqual( {
				size: 750,
				unit: 'ms',
			} );
			expect( updatedInteraction.animation.value.timing_config.value.delay.value ).toEqual( {
				size: 100,
				unit: 'ms',
			} );
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

			renderInteractionDetails( interaction );

			const effectSelect = getEffectCombobox();
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

			renderInteractionDetails( interaction );

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

			renderInteractionDetails( interaction );

			expect( screen.getByText( 'Direction' ) ).toBeInTheDocument();
		} );

		it( 'should handle missing replay control from registry', () => {
			const { getInteractionsControl } = require( '../interactions-controls-registry' );
			getInteractionsControl.mockReturnValue( null );

			const interaction = createInteractionItemValue( {
				trigger: 'scrollIn',
			} );

			renderInteractionDetails( interaction );

			expect( screen.queryByText( 'Replay' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /toggle replay/i } ) ).not.toBeInTheDocument();
		} );
	} );

	/**
	 * Test case mind map: Offset Top / Offset Bottom — number → size
	 *
	 * 1. VISIBILITY
	 *    - Offset Top and Offset Bottom controls are visible only when trigger === 'scrollOn'
	 *    - Offset Top and Offset Bottom are not rendered when trigger is 'load' | 'scrollIn' | 'scrollOut'
	 *
	 * 2. VALUE SHAPE (controls receive size, not string of number)
	 *    - OffsetTopControl receives `value` as SizePropValue (e.g. { size: number, unit: string } or wrapped $$type form)
	 *    - OffsetBottomControl receives `value` as SizePropValue
	 *    - Not as string (e.g. "15") so pro controls can work with size + unit
	 *
	 * 3. ONCHANGE SHAPE (pro controls send size; we store size)
	 *    - OffsetTopControl onChange is called by pro with SizePropValue (size object)
	 *    - OffsetBottomControl onChange is called by pro with SizePropValue
	 *    - updateInteraction stores offsetTop / offsetBottom as size in animation config (not number)
	 *
	 * 4. EXTRACTION FROM INTERACTION
	 *    - When config has offsetTop as number (legacy), extract to default size (e.g. 15, '%')
	 *    - When config has offsetTop as size, use it as-is for control value
	 *    - Same for offsetBottom (legacy number → default size; size → as-is)
	 *
	 * 5. DEFAULTS
	 *    - Default offsetTop when missing: size { size: 15, unit: '%' }
	 *    - Default offsetBottom when missing: size { size: 85, unit: '%' }
	 */
	describe( 'Offset Top / Offset Bottom (size)', () => {
		let offsetTopControlProps: { value: unknown; onChange: ( v: unknown ) => void };
		let offsetBottomControlProps: { value: unknown; onChange: ( v: unknown ) => void };

		const MockOffsetTopControl = ( props: { value: unknown; onChange: ( v: unknown ) => void } ) => {
			offsetTopControlProps = props;
			return (
				<div data-testid="offset-top-control">
					<span data-value={ JSON.stringify( props.value ) } />
					<button type="button" onClick={ () => props.onChange( { size: 25, unit: '%' } ) }>
						Set offset top 25%
					</button>
				</div>
			);
		};

		const MockOffsetBottomControl = ( props: { value: unknown; onChange: ( v: unknown ) => void } ) => {
			offsetBottomControlProps = props;
			return (
				<div data-testid="offset-bottom-control">
					<span data-value={ JSON.stringify( props.value ) } />
					<button type="button" onClick={ () => props.onChange( { size: 75, unit: '%' } ) }>
						Set offset bottom 75%
					</button>
				</div>
			);
		};

		beforeEach( () => {
			const { getInteractionsControl } = require( '../interactions-controls-registry' );
			getInteractionsControl.mockImplementation( ( type: string ) => {
				if ( type === 'trigger' ) {
					return { component: Trigger };
				}
				if ( type === 'replay' ) {
					return { component: mockReplayControl };
				}
				if ( type === 'easing' ) {
					return { component: Easing };
				}
				if ( type === 'offsetTop' ) {
					return { component: MockOffsetTopControl };
				}
				if ( type === 'offsetBottom' ) {
					return { component: MockOffsetBottomControl };
				}
				if ( type === 'relativeTo' ) {
					return { component: () => <div data-testid="relative-to" /> };
				}
				return null;
			} );
		} );

		it( 'should render Offset Top and Offset Bottom when trigger is scrollOn', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			expect( screen.getByText( 'Offset Top' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Offset Bottom' ) ).toBeInTheDocument();

			// eslint-disable-next-line testing-library/no-test-id-queries
			expect( screen.getByTestId( 'offset-top-control' ) ).toBeInTheDocument();

			// eslint-disable-next-line testing-library/no-test-id-queries
			expect( screen.getByTestId( 'offset-bottom-control' ) ).toBeInTheDocument();
		} );

		it( 'should not render Offset Top or Offset Bottom when trigger is load', () => {
			const interaction = createInteractionItemValue( { trigger: 'load' } );

			renderInteractionDetails( interaction );

			expect( screen.queryByText( 'Offset Top' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Offset Bottom' ) ).not.toBeInTheDocument();
		} );

		it( 'should pass value to OffsetTopControl as size object (not string)', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			expect( offsetTopControlProps ).toBeDefined();
			// TDD: value should be size shape (e.g. { size: 15, unit: '%' } or $$type size), not string "15"
			const value = offsetTopControlProps.value;

			expect( typeof value === 'string' ).toBe( false );
			expect( value ).toBeDefined();

			if ( value && typeof value === 'object' && 'size' in value ) {
				expect( ( value as { size: number; unit: string } ).size ).toBe( 15 );
				expect( ( value as { size: number; unit: string } ).unit ).toBe( '%' );
			}
		} );

		it( 'should pass value to OffsetBottomControl as size object (not string)', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			expect( offsetBottomControlProps ).toBeDefined();
			const value = offsetBottomControlProps.value;
			expect( typeof value === 'string' ).toBe( false );
			expect( value ).toBeDefined();
			if ( value && typeof value === 'object' && 'size' in value ) {
				expect( ( value as { size: number; unit: string } ).size ).toBe( 85 );
				expect( ( value as { size: number; unit: string } ).unit ).toBe( '%' );
			}
		} );

		it( 'should call onChange with interaction containing offsetTop as size when OffsetTopControl onChange is called', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			fireEvent.click( screen.getByRole( 'button', { name: /set offset top 25%/i } ) );

			expect( mockOnChange ).toHaveBeenCalled();
			const updated = mockOnChange.mock.calls[ 0 ][ 0 ];
			const configOffsetTop = updated.animation.value.config?.value?.offsetTop;
			// TDD: config should store size (e.g. $$type 'size' with value { size, unit } or raw { size, unit })
			expect( configOffsetTop ).toBeDefined();
			const raw = configOffsetTop?.value ?? configOffsetTop;
			if ( raw && typeof raw === 'object' && 'size' in raw ) {
				expect( ( raw as { size: number; unit: string } ).size ).toBe( 25 );
				expect( ( raw as { size: number; unit: string } ).unit ).toBe( '%' );
			}
		} );

		it( 'should call onChange with interaction containing offsetBottom as size when OffsetBottomControl onChange is called', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			fireEvent.click( screen.getByRole( 'button', { name: /set offset bottom 75%/i } ) );

			expect( mockOnChange ).toHaveBeenCalled();
			const updated = mockOnChange.mock.calls[ 0 ][ 0 ];
			const configOffsetBottom = updated.animation.value.config?.value?.offsetBottom;
			expect( configOffsetBottom ).toBeDefined();
			const raw = configOffsetBottom?.value ?? configOffsetBottom;
			if ( raw && typeof raw === 'object' && 'size' in raw ) {
				expect( ( raw as { size: number; unit: string } ).size ).toBe( 75 );
				expect( ( raw as { size: number; unit: string } ).unit ).toBe( '%' );
			}
		} );

		it( 'should use default size for offsetTop when config has no offsetTop', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetBottom: 85,
			} );
			// Ensure offsetTop is not set in config (default from createAnimationPreset may still set it)
			renderInteractionDetails( interaction );

			expect( offsetTopControlProps ).toBeDefined();
			// TDD: value should reflect default offset top as size (e.g. 15, '%')
			const value = offsetTopControlProps.value;
			if ( value && typeof value === 'object' && 'size' in value ) {
				expect( ( value as { size: number } ).size ).toBe( 15 );
			}
		} );

		it( 'should use default size for offsetBottom when config has no offsetBottom', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
			} );

			renderInteractionDetails( interaction );

			expect( offsetBottomControlProps ).toBeDefined();
			const value = offsetBottomControlProps.value;
			if ( value && typeof value === 'object' && 'size' in value ) {
				expect( ( value as { size: number } ).size ).toBe( 85 );
			}
		} );
	} );
} );
