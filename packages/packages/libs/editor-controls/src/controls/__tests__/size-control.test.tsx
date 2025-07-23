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
	'M8.25 1.57812C8.79701 1.57813 9.32146 1.79558 9.70825 2.18237C10.095 2.56917 10.3125 3.09362 10.3125 3.64062C10.3125 3.95129 10.0607 4.20312 9.75 4.20312C9.43934 4.20312 9.1875 3.95129 9.1875 3.64062C9.1875 3.39198 9.08866 3.1536 8.91284 2.97778C8.75908 2.82402 8.55751 2.72889 8.34302 2.70752L8.25 2.70312C8.11054 2.70312 7.98795 2.7525 7.84131 2.97632C7.67592 3.22885 7.52926 3.63957 7.3916 4.23608C7.2562 4.8229 7.14188 5.52915 7.01221 6.34253C6.91438 6.9562 6.8083 7.62491 6.67969 8.32812H8.25C8.56066 8.32812 8.8125 8.57996 8.8125 8.89062C8.8125 9.20129 8.56066 9.45312 8.25 9.45312H6.46582C6.32297 10.2132 6.20614 10.9386 6.09814 11.616C5.97003 12.4196 5.84991 13.1667 5.7041 13.7986C5.56055 14.4206 5.37895 14.9945 5.09912 15.4216C4.80045 15.8774 4.36045 16.2031 3.75 16.2031C3.20299 16.2031 2.67854 15.9857 2.29175 15.5989C1.90495 15.2121 1.6875 14.6876 1.6875 14.1406C1.6875 13.83 1.93934 13.5781 2.25 13.5781C2.56066 13.5781 2.8125 13.83 2.8125 14.1406C2.8125 14.3893 2.91134 14.6277 3.08716 14.8035C3.26297 14.9793 3.50136 15.0781 3.75 15.0781C3.88946 15.0781 4.01205 15.0288 4.15869 14.8049C4.32408 14.5524 4.47074 14.1417 4.6084 13.5452C4.7438 12.9584 4.85812 12.2521 4.98779 11.4387C5.08562 10.825 5.1917 10.1563 5.32031 9.45312H3.75C3.43934 9.45312 3.1875 9.20129 3.1875 8.89062C3.1875 8.57996 3.43934 8.32812 3.75 8.32812H5.53418C5.67703 7.56809 5.79386 6.84269 5.90186 6.16528C6.02997 5.36164 6.15009 4.61452 6.2959 3.98267C6.43945 3.36069 6.62105 2.78673 6.90088 2.35962C7.19955 1.90385 7.63955 1.57812 8.25 1.57812Z';
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

		it( 'should keep the placeholder unit when value got changed', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
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
			fireEvent.change( sizeInput, { target: { value: '123' } } );
			const unitButton = screen.getByRole( 'button' );

			// Assert.
			expect( sizeInput ).toHaveDisplayValue( '123' );
			expect( unitButton ).toHaveTextContent( '%' );
		} );
	} );
} );
