import * as React from 'react';
import { type RefObject } from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { type SizePropValue } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import { type AngleUnit, type LengthUnit } from '../../utils/size-control';
import { SizeControl } from '../size-control';

const mockSizeProp = ( value?: SizePropValue[ 'value' ] ) => ( {
	$$type: 'size',
	value: { unit: '', size: 0, ...value },
} );

const mockLengthUnits = (): LengthUnit[] => [ 'px', 'rem', '%', 'em' ];
const mockAngleUnits = (): AngleUnit[] => [ 'deg', 'rad', 'grad', 'turn' ];

jest.mock( '@elementor/editor-v1-adapters' );
jest.mocked( isExperimentActive ).mockReturnValue( true );

const propType = createMockPropType( {
	kind: 'union',
	prop_types: {
		size: createMockPropType( {
			key: 'size',
			kind: 'plain',
		} ),
		string: createMockPropType( { kind: 'plain' } ),
	},
} );

const customOptionElement =
	'd="M13.9697 4.96973C14.6408 4.29864 15.5509 3.92163 16.5 3.92163C17.4491 3.92163 18.3592 4.29864 19.0303 4.96973C19.7014 5.64081 20.0784 6.551 20.0784 7.50006C20.0784 8.44912 19.7014 9.3593 19.0303 10.0304L8.53033 20.5304C8.38968 20.671 8.19891 20.7501 8 20.7501H4C3.58579 20.7501 3.25 20.4143 3.25 20.0001V16.0001C3.25 15.8011 3.32902 15.6104 3.46967 15.4697L12.9641 5.97531C12.9659 5.97342 12.9678 5.97154 12.9697 5.96967C12.9715 5.9678 12.9734 5.96594 12.9753 5.96409L13.9697 4.96973ZM13.5 7.56069L4.75 16.3107V19.2501H7.68934L16.4394 10.5L13.5 7.56069ZM17.5 9.43937L14.5607 6.50003L15.0303 6.03039C15.4201 5.64061 15.9488 5.42163 16.5 5.42163C17.0512 5.42163 17.5799 5.64061 17.9697 6.03039C18.3595 6.42017 18.5784 6.94882 18.5784 7.50006C18.5784 8.05129 18.3595 8.57995 17.9697 8.96973L17.5 9.43937Z"';

describe( 'SizeControl', () => {
	it( 'should render the size control with its props', () => {
		// Arrange.
		const setValue = jest.fn();
		const units = mockLengthUnits();

		const props = { setValue, value: mockSizeProp(), bind: 'select', propType };

		// Act.
		renderControl( <SizeControl units={ units } placeholder="Enter size" disableCustom />, props );

		// Assert.
		const numberInput = screen.getByRole( 'spinbutton' );
		const selectInput = screen.getByRole( 'button' );

		expect( numberInput ).toHaveAttribute( 'placeholder', 'Enter size' );

		fireEvent.click( selectInput );

		screen.getAllByRole( 'menuitem' ).forEach( ( option, index ) => {
			expect( option ).toHaveTextContent( units[ index ].toUpperCase() );
		} );
	} );

	it( 'should pass the updated unit on change', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const select = screen.getByRole( 'button' );

		// Act.
		fireEvent.click( select );

		const option2 = screen.getByText( 'REM' );

		fireEvent.click( option2 );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 10, unit: 'rem' } } );
	} );

	it( 'should pass the updated size on change', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( sizeInput ).toHaveValue( 10 );

		// Act.
		fireEvent.change( sizeInput, { target: { value: '20' } } ); // pass 20 as string and make sure it's converted to number.

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 20, unit: 'px' } } );
	} );

	it( 'should pass null to setValue if the size is invalid', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.change( sizeInput, { target: { value: 'invalid' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should ignore restricted keys on size input', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.keyDown( sizeInput, { key: 'e' } );
		fireEvent.keyDown( sizeInput, { key: 'E' } );
		fireEvent.keyDown( sizeInput, { key: '-' } );
		fireEvent.keyDown( sizeInput, { key: '+' } );

		// Assert.
		expect( setValue ).not.toHaveBeenCalled();
	} );

	it( 'should pass null to setValue when the size value is empty', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };
		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.change( sizeInput, { target: { value: '' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should switch to plain size', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl extendedOptions={ [ 'auto' ] } />
			</ControlActionsProvider>,
			props
		);

		const select = screen.getByRole( 'button' );

		// Act.
		fireEvent.click( select );

		const option = screen.getByText( 'AUTO' );

		fireEvent.click( option );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: {
				unit: 'auto',
				size: '',
			},
		} );
	} );

	it( 'should restore the prev valid value on blur when the size is empty and the field is required', () => {
		// Arrange.
		const setValue = jest.fn();

		const requiredPropType = createMockPropType( {
			key: 'size',
			kind: 'plain',
			settings: {
				required: true,
			},
		} );

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: requiredPropType,
		};

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.change( sizeInput, { target: { value: '' } } );

		// Assert.
		expect( setValue ).not.toHaveBeenCalled();

		// Act.
		fireEvent.blur( sizeInput );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '10' );
	} );

	it( 'should not restore the previous value on blur when the size is empty and the field is not required', () => {
		// Arrange.
		const setValue = jest.fn();

		const notRequiredPropType = createMockPropType( {
			key: 'size',
			kind: 'plain',
			settings: {
				required: false,
			},
		} );

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: notRequiredPropType,
		};

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '10' );

		// Act.
		fireEvent.change( sizeInput, { target: { value: '' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );

		// Act.
		fireEvent.blur( sizeInput );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '' );
	} );

	it( 'should render 0 as a valid size', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			setValue,
			value: mockSizeProp( { size: 0, unit: 'px' } ),
			bind: 'select',
			propType,
		};

		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<SizeControl units={ mockLengthUnits() } />
			</ControlActionsProvider>,
			props
		);

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '0' );

		// Act.
		fireEvent.change( sizeInput, { target: { value: '1' } } );
		fireEvent.change( sizeInput, { target: { value: '0' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 0, unit: 'px' } } );
	} );

	it( 'should render custom value correctly', async () => {
		// Arrange.
		const setValue = jest.fn();

		const requiredPropType = createMockPropType( {
			key: 'size',
			kind: 'plain',
			settings: {
				required: true,
			},
		} );

		const props = {
			setValue,
			value: mockSizeProp( { size: 'my-custom-size', unit: 'custom' } ),
			bind: 'select',
			propType: requiredPropType,
		};

		const anchorEl = {
			current: document.body,
		} as unknown as RefObject< HTMLDivElement | null >;

		// Act.
		renderControl(
			<SizeControl units={ mockLengthUnits() } extendedOptions={ [ 'auto' ] } anchorRef={ anchorEl } />,
			props
		);

		const selectButton = screen.getByRole( 'button' );
		const customInput = screen.getByDisplayValue( 'my-custom-size' );

		// Assert.
		expect( customInput ).toHaveValue( 'my-custom-size' );
		expect( selectButton ).toContainHTML( customOptionElement );
	} );

	it( "should make sure custom unit is always last in unit's list", async () => {
		// Arrange.
		const setValue = jest.fn();

		const requiredPropType = createMockPropType( {
			key: 'size',
			kind: 'plain',
			settings: {
				required: true,
			},
		} );

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: requiredPropType,
		};

		const anchorEl = {
			current: document.body,
		} as unknown as RefObject< HTMLDivElement | null >;

		// Act.
		renderControl(
			<SizeControl units={ mockLengthUnits() } extendedOptions={ [ 'auto' ] } anchorRef={ anchorEl } />,
			props
		);

		const selectButton = screen.getByRole( 'button' );

		// Act.
		fireEvent.click( selectButton );

		const options = screen.getAllByRole( 'menuitem' );

		// Assert.
		expect( options.slice( -1 )[ 0 ] ).toContainHTML( customOptionElement );
	} );

	describe( 'Keyboard Unit Selection', () => {
		it.each( [
			{ input: '%', expected: '%', description: 'exact match' },
			{ input: 'r', expected: 'rem', description: 'prefix match' },
			{ input: 'e', expected: 'rem', description: 'prefix match' },
			{ input: 'x', expected: 'px', description: 'substring match' },
			{ input: 'k', description: 'no match - should not change unit' },
		] )( 'should handle unit selection by keyboard - $description', ( { input, expected } ) => {
			// Arrange.
			const setValue = jest.fn();
			const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

			// Act.
			renderControl( <SizeControl units={ mockLengthUnits() } disableCustom />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.keyUp( sizeInput, { key: input } );

			// Assert.
			if ( expected ) {
				expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 10, unit: expected } } );
			} else {
				expect( setValue ).not.toHaveBeenCalled();
			}
		} );

		it( 'should handle buffer overflow in unit selection (max 3 chars)', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

			// Act.
			renderControl( <SizeControl units={ mockLengthUnits() } extendedOptions={ [ 'auto' ] } />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			fireEvent.keyUp( sizeInput, { key: 'a' } );
			fireEvent.keyUp( sizeInput, { key: 'u' } );
			fireEvent.keyUp( sizeInput, { key: 't' } );
			fireEvent.keyUp( sizeInput, { key: 'o' } );

			// Assert.
			expect( setValue ).toHaveBeenLastCalledWith( { $$type: 'size', value: { size: '', unit: 'auto' } } );
		} );

		it( 'should handle buffer overflow in unit selection (max 3 chars) - custom', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };

			const anchorEl = {
				current: document.body,
			} as unknown as RefObject< HTMLDivElement | null >;

			// Act.
			renderControl(
				<SizeControl units={ mockLengthUnits() } extendedOptions={ [ 'auto' ] } anchorRef={ anchorEl } />,
				props
			);

			const sizeInput = screen.getByRole( 'spinbutton' );

			fireEvent.keyUp( sizeInput, { key: 'c' } );
			fireEvent.keyUp( sizeInput, { key: 'u' } );
			fireEvent.keyUp( sizeInput, { key: 's' } );
			fireEvent.keyUp( sizeInput, { key: 't' } );

			// Assert.
			expect( setValue ).toHaveBeenLastCalledWith( null );
		} );
		it( 'should handle default unit when defaultUnit is provided', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = { setValue, value: mockSizeProp(), bind: 'select', propType };

			// Act.
			renderControl( <SizeControl units={ mockLengthUnits() } defaultUnit="rem" />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			// Act
			fireEvent.change( sizeInput, { target: { value: '20' } } );

			// Assert
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 20, unit: 'rem' } } );
		} );
	} );

	describe( 'Angle Units Support', () => {
		it( 'should handle angle unit keyboard shortcuts', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = { setValue, value: mockSizeProp( { size: 45, unit: 'deg' } ), bind: 'select', propType };

			// Act.
			renderControl( <SizeControl variant="angle" units={ mockAngleUnits() } disableCustom />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			fireEvent.keyUp( sizeInput, { key: 'd' } );
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'deg' } } );

			fireEvent.keyUp( sizeInput, { key: 'r' } );
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'rad' } } );

			fireEvent.keyUp( sizeInput, { key: 'g' } );
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'grad' } } );

			fireEvent.keyUp( sizeInput, { key: 't' } );
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'turn' } } );
		} );
	} );

	describe( 'Placeholder', () => {
		it( 'should prioritize prop placeholder over context placeholder', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				propType,
				placeholder: {
					$$type: 'size',
					value: {
						size: 100,
						unit: '%',
					},
				},
			};

			// Act.
			renderControl( <SizeControl placeholder="Mixed Values" />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			// Assert.
			expect( sizeInput ).toHaveAttribute( 'placeholder', 'Mixed Values' );
		} );

		it( 'should use the context placeholder if the prop placeholder is not provided', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				propType,
				placeholder: {
					$$type: 'size',
					value: {
						size: 20,
						unit: 'em',
					},
				},
			};

			// Act.
			renderControl( <SizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );
			const unitButton = screen.getByRole( 'button' );

			// Assert.
			expect( sizeInput ).toHaveAttribute( 'placeholder', '20' );
			expect( unitButton ).toHaveTextContent( 'em' );
		} );

		it( 'should not show placeholder if value is provided', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp( {
					size: 149,
					unit: 'vh',
				} ),
				bind: 'select',
				disabled: true,
				propType,
				placeholder: {
					$$type: 'size',
					value: {
						size: 200,
						unit: '%',
					},
				},
			};

			// Act.
			renderControl( <SizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );
			const unitButton = screen.getByRole( 'button' );

			// Assert.
			expect( sizeInput ).toHaveDisplayValue( '149' );
			expect( unitButton ).toHaveTextContent( 'vh' );
		} );

		it( 'should show no placeholder when neither prop nor bound prop placeholder is provided', () => {
			// Arrange
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				disabled: true,
				propType,
			};

			// Act
			renderControl( <SizeControl />, props );

			// Assert

			const sizeInput = screen.getByRole( 'spinbutton' );
			const unitButton = screen.getByRole( 'button' );

			expect( sizeInput ).not.toHaveAttribute( 'placeholder' );
			expect( unitButton ).toHaveTextContent( 'px' );
		} );
	} );
} );
