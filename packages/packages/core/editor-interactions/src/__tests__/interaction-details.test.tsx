import * as React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWithTheme } from 'test-utils';

import { Direction } from '../components/controls/direction';
import { Easing } from '../components/controls/easing';
import { Effect } from '../components/controls/effect';
import { EffectType } from '../components/controls/effect-type';
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
		return renderWithTheme(
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

			if ( type === 'effect' ) {
				return {
					component: Effect,
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

			if ( type === 'direction' ) {
				return {
					component: Direction,
				};
			}

			if ( type === 'effectType' ) {
				return {
					component: EffectType,
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

		it( 'should not render scrollOn-only controls for load or scrollIn triggers', () => {
			// Arrange + Assert (load)
			renderInteractionDetails( createInteractionItemValue( { trigger: 'load' } ) );
			expect( screen.queryByText( 'Relative To' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Offset Top' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Offset Bottom' ) ).not.toBeInTheDocument();

			// Arrange + Assert (scrollIn)
			renderInteractionDetails( createInteractionItemValue( { trigger: 'scrollIn' } ) );
			expect( screen.queryByText( 'Relative To' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Offset Top' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Offset Bottom' ) ).not.toBeInTheDocument();
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

	describe( 'Trigger menu options', () => {
		it( 'should show "While scrolling" option as disabled in the trigger menu', () => {
			const interaction = createInteractionItemValue( { trigger: 'load' } );

			renderInteractionDetails( interaction );

			const comboboxes = screen.getAllByRole( 'combobox' );
			const triggerSelect = comboboxes[ 0 ];

			fireEvent.mouseDown( triggerSelect );

			// Sanity: core UI enables only these trigger options.
			expect( screen.getByRole( 'option', { name: /page load/i, hidden: true } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: /scroll into view/i, hidden: true } ) ).toBeInTheDocument();

			// Guard: Pro-only trigger should be present but disabled in the core trigger control.
			const scrollOnOption = screen.getByRole( 'option', { name: /while scrolling/i, hidden: true } );
			expect( scrollOnOption ).toBeInTheDocument();
			expect( scrollOnOption ).toHaveAttribute( 'aria-disabled', 'true' );
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
			const scrollInOption = screen.getByRole( 'option', { name: /scroll into view/i, hidden: true } );
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
			const scrollInOption = screen.getByRole( 'option', { name: /scroll into view/i, hidden: true } );
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

	describe( 'Offset Top / Offset Bottom (size)', () => {
		let offsetTopControlProps: { value: unknown; onChange: ( v: unknown ) => void };
		let offsetBottomControlProps: { value: unknown; onChange: ( v: unknown ) => void };

		const MockOffsetTopControl = ( props: { value: unknown; onChange: ( v: unknown ) => void } ) => {
			offsetTopControlProps = props;
			return (
				<div data-testid="offset-top-control">
					<span data-value={ JSON.stringify( props.value ) } />
					<button type="button" onClick={ () => props.onChange( '25' ) }>
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
					<button type="button" onClick={ () => props.onChange( '75' ) }>
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
				if ( type === 'effect' ) {
					return { component: Effect };
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

		it( 'should pass value to OffsetTopControl as size string value', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			expect( offsetTopControlProps ).toBeDefined();
			const value = offsetTopControlProps.value;

			expect( value ).toEqual( '15' );
		} );

		it( 'should call onChange with size string value when OffsetTopControl onChange is called', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			fireEvent.click( screen.getByRole( 'button', { name: /set offset top 25%/i } ) );

			expect( mockOnChange ).toHaveBeenCalled();

			const updated = mockOnChange.mock.calls[ 0 ][ 0 ];
			const offsetTop = updated.animation.value.config?.value?.offsetTop;

			expect( offsetTop ).toEqual( {
				$$type: 'size',
				value: {
					size: 25,
					unit: '%',
				},
			} );
		} );

		it( 'should call onChange with size string when OffsetBottomControl onChange is called', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			fireEvent.click( screen.getByRole( 'button', { name: /set offset bottom 75%/i } ) );

			expect( mockOnChange ).toHaveBeenCalled();

			const updated = mockOnChange.mock.calls[ 0 ][ 0 ];
			const offsetBottom = updated.animation.value.config?.value?.offsetBottom;

			expect( offsetBottom ).toEqual( {
				$$type: 'size',
				value: {
					size: 75,
					unit: '%',
				},
			} );
		} );

		it( 'should use default size for offsetTop when config has no offsetTop', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetBottom: 85,
			} );

			renderInteractionDetails( interaction );

			const offsetTopValue = offsetTopControlProps.value;

			expect( offsetTopValue ).toEqual( '15' );
		} );

		it( 'should use default size for offsetBottom when config has no offsetBottom', () => {
			const interaction = createInteractionItemValue( {
				trigger: 'scrollOn',
				offsetTop: 15,
			} );

			renderInteractionDetails( interaction );

			const offsetBottomValue = offsetBottomControlProps.value;

			expect( offsetBottomValue ).toEqual( '85' );
		} );
	} );
} );
