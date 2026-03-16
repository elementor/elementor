import * as React from 'react';
import type { RefObject } from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import type { SizePropValue } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { getAngleUnits, getLengthUnits } from '../sync/get-units';
import { UnstableSizeControl } from '../unstable-size-control';
import { getDefaultUnit } from '../utils/settings/get-default-unit';
import { isExtendedUnit } from '../utils/is-extended-unit';

jest.mock( '../utils/is-extended-unit' );
jest.mock( '../sync/get-units' );
jest.mock( '../utils/settings/get-default-unit' );

const mockIsExtendedUnit = jest.mocked( isExtendedUnit );
const mockGetLengthUnits = jest.mocked( getLengthUnits );
const mockGetAngleUnits = jest.mocked( getAngleUnits );
const mockGetDefaultUnit = jest.mocked( getDefaultUnit );

const mockSizeProp = ( value?: SizePropValue[ 'value' ] ) => ( {
	$$type: 'size',
	value: { unit: '', size: null, ...value },
} );

const mockLengthUnits = () => [ 'px', 'rem', '%', 'em' ];

const createSizePropType = ( options: object = {} ) => {
	return createMockPropType( {
		kind: 'union',
		prop_types: {
			size: createMockPropType( {
				key: 'size',
				kind: 'plain',
				...options,
			} ),
			string: createMockPropType( { kind: 'plain' } ),
		},
	} );
};
// should not open custom wen rendering component only wen triggering thrun input click and selection
describe( 'SizeControl', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsExtendedUnit.mockReturnValue( false );
		mockGetDefaultUnit.mockReturnValue( undefined );
	} );

	it( 'should render the size control with its props', () => {
		// Arrange.
		const setValue = jest.fn();
		const units = mockLengthUnits();

		const props = {
			setValue,
			value: mockSizeProp(),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units,
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl placeholder="Enter size" />, props );

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
		const units = mockLengthUnits();

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units,
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

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
		const units = mockLengthUnits();

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units,
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( sizeInput ).toHaveValue( 10 );

		// Act.
		fireEvent.input( sizeInput, { target: { value: '20' } } ); // pass 20 as string and make sure it's converted to number.

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 20, unit: 'px' } } );
	} );

	it( 'should pass empty size to setValue if the size is invalid', () => {
		// Arrange.
		const setValue = jest.fn();
		const units = mockLengthUnits();

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units,
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( sizeInput, { target: { value: 'invalid' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: {
				size: '',
				unit: 'px',
			},
		} );
	} );

	it( 'should pass empty size to setValue when the size value is empty', () => {
		// Arrange.
		const setValue = jest.fn();
		const units = mockLengthUnits();

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units,
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( sizeInput, { target: { value: '' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: {
				size: '',
				unit: 'px',
			},
		} );
	} );

	it( 'should switch to plain size', () => {
		// Arrange.
		mockIsExtendedUnit.mockReturnValue( true );

		const setValue = jest.fn();

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units: [ 'px', 'rem', 'auto' ],
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

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
				units: [ 'px', 'rem', 'auto' ],
			},
		} );

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: requiredPropType,
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Act.
		fireEvent.input( sizeInput, { target: { value: '' } } );

		// Assert. WE now allow to sent empty string
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
				units: [ 'px' ],
			},
		} );

		const props = {
			setValue,
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: notRequiredPropType,
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '10' );

		// Act.
		fireEvent.input( sizeInput, { target: { value: '' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'size',
			value: {
				size: '',
				unit: 'px',
			},
		} );

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
			value: mockSizeProp( { size: 10, unit: 'px' } ),
			bind: 'select',
			propType: createSizePropType( {
				settings: {
					units: [ 'px', 'rem', 'auto' ],
				},
			} ),
		};

		// Act.
		renderControl( <UnstableSizeControl />, props );

		const sizeInput = screen.getByRole( 'spinbutton' );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '10' );

		// Act.
		fireEvent.input( sizeInput, { target: { value: '1' } } );
		fireEvent.input( sizeInput, { target: { value: '0' } } );

		// Assert.
		expect( sizeInput ).toHaveDisplayValue( '0' );
		expect( setValue ).toHaveBeenLastCalledWith( { $$type: 'size', value: { size: 0, unit: 'px' } } );
	} );

	// custom should be triggered by only 2 things
	// changing of unit && clicking of input
	it( 'should render custom value correctly', async () => {
		// Arrange.
		mockIsExtendedUnit.mockReturnValue( true );

		const setValue = jest.fn();
		const customOptionElement =
			'M11 2.25C11.7293 2.25 12.4286 2.53994 12.9443 3.05566C13.4601 3.57139 13.75 4.27065 13.75 5C13.75 5.41421 13.4142 5.75 13 5.75C12.5858 5.75 12.25 5.41421 12.25 5C12.25 4.66848 12.1182 4.35063 11.8838 4.11621C11.6788 3.9112 11.41 3.78436 11.124 3.75586L11 3.75C10.814 3.75 10.6506 3.81583 10.4551 4.11426C10.2346 4.45097 10.039 4.99859 9.85547 5.79395C9.67493 6.57636 9.5225 7.51803 9.34961 8.60254C9.21917 9.42077 9.07773 10.3124 8.90625 11.25H11C11.4142 11.25 11.75 11.5858 11.75 12C11.75 12.4142 11.4142 12.75 11 12.75H8.62109C8.43063 13.7634 8.27485 14.7306 8.13086 15.6338C7.96004 16.7053 7.79989 17.7015 7.60547 18.5439C7.41407 19.3732 7.17193 20.1385 6.79883 20.708C6.4006 21.3157 5.81393 21.75 5 21.75C4.27065 21.75 3.57139 21.4601 3.05566 20.9443C2.53994 20.4286 2.25 19.7293 2.25 19C2.25 18.5858 2.58579 18.25 3 18.25C3.41421 18.25 3.75 18.5858 3.75 19C3.75 19.3315 3.88179 19.6494 4.11621 19.8838C4.35063 20.1182 4.66848 20.25 5 20.25C5.18595 20.25 5.3494 20.1842 5.54492 19.8857C5.76544 19.549 5.96099 19.0014 6.14453 18.2061C6.32507 17.4236 6.4775 16.482 6.65039 15.3975C6.78083 14.5792 6.92227 13.6876 7.09375 12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H7.37891C7.56937 10.2366 7.72515 9.26942 7.86914 8.36621C8.03996 7.29469 8.20011 6.29853 8.39453 5.45605C8.58593 4.62675 8.82807 3.86147 9.20117 3.29199C9.5994 2.6843 10.1861 2.25 11 2.25Z';

		const requiredPropType = createMockPropType( {
			key: 'size',
			kind: 'plain',
			settings: {
				required: true,
				units: [ 'custom' ],
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
		renderControl( <UnstableSizeControl anchorRef={ anchorEl } />, props );

		const selectButton = screen.getByRole( 'button' );
		const customInput = screen.getByDisplayValue( 'my-custom-size' );

		// Assert.
		expect( customInput ).toHaveValue( 'my-custom-size' );
		expect( selectButton ).toContainHTML( customOptionElement );
	} );

	it( 'should close the custom popover and update the size when the enter key is pressed', () => {
		// Arrange.
		mockIsExtendedUnit.mockReturnValue( true );

		const setValue = jest.fn();
		const customOptionElement =
			'M11 2.25C11.7293 2.25 12.4286 2.53994 12.9443 3.05566C13.4601 3.57139 13.75 4.27065 13.75 5C13.75 5.41421 13.4142 5.75 13 5.75C12.5858 5.75 12.25 5.41421 12.25 5C12.25 4.66848 12.1182 4.35063 11.8838 4.11621C11.6788 3.9112 11.41 3.78436 11.124 3.75586L11 3.75C10.814 3.75 10.6506 3.81583 10.4551 4.11426C10.2346 4.45097 10.039 4.99859 9.85547 5.79395C9.67493 6.57636 9.5225 7.51803 9.34961 8.60254C9.21917 9.42077 9.07773 10.3124 8.90625 11.25H11C11.4142 11.25 11.75 11.5858 11.75 12C11.75 12.4142 11.4142 12.75 11 12.75H8.62109C8.43063 13.7634 8.27485 14.7306 8.13086 15.6338C7.96004 16.7053 7.79989 17.7015 7.60547 18.5439C7.41407 19.3732 7.17193 20.1385 6.79883 20.708C6.4006 21.3157 5.81393 21.75 5 21.75C4.27065 21.75 3.57139 21.4601 3.05566 20.9443C2.53994 20.4286 2.25 19.7293 2.25 19C2.25 18.5858 2.58579 18.25 3 18.25C3.41421 18.25 3.75 18.5858 3.75 19C3.75 19.3315 3.88179 19.6494 4.11621 19.8838C4.35063 20.1182 4.66848 20.25 5 20.25C5.18595 20.25 5.3494 20.1842 5.54492 19.8857C5.76544 19.549 5.96099 19.0014 6.14453 18.2061C6.32507 17.4236 6.4775 16.482 6.65039 15.3975C6.78083 14.5792 6.92227 13.6876 7.09375 12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H7.37891C7.56937 10.2366 7.72515 9.26942 7.86914 8.36621C8.03996 7.29469 8.20011 6.29853 8.39453 5.45605C8.58593 4.62675 8.82807 3.86147 9.20117 3.29199C9.5994 2.6843 10.1861 2.25 11 2.25Z';

		const requiredPropType = createMockPropType( {
			key: 'size',
			kind: 'plain',
			settings: {
				required: true,
				units: [ 'custom' ],
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
		renderControl( <UnstableSizeControl anchorRef={ anchorEl } />, props );

		const selectButton = screen.getByRole( 'button' );
		expect( selectButton ).toContainHTML( customOptionElement );

		const customInput = screen.getByDisplayValue( 'my-custom-size' );

		fireEvent.input( customInput, { target: { value: 'updated:my-custom-size' } } );
		fireEvent.keyPress( customInput, { key: 'Enter' } );

		// Assert. Things changed here but need to be tested
		// Why do we need to restore on enter
		expect( setValue ).not.toHaveBeenCalled();
		// expect( setValue ).toHaveBeenCalledWith( {
		// 	$$type: 'size',
		// 	value: {
		// 		size: 'updated:my-custom-size',
		// 		unit: 'custom',
		// 	},
		// } );
	} );

	// BE now controls the order of the units
	it.skip( "should make sure custom unit is always last in unit's list", async () => {
		// Arrange.
		// const setValue = jest.fn();
		//
		// const requiredPropType = createMockPropType( {
		// 	key: 'size',
		// 	kind: 'plain',
		// 	settings: {
		// 		required: true,
		// 	},
		// } );

		// const props = {
		// 	setValue,
		// 	value: mockSizeProp( { size: 10, unit: 'px' } ),
		// 	bind: 'select',
		// 	propType: requiredPropType,
		// };

		// const anchorEl = {
		// 	current: document.body,
		// } as unknown as RefObject< HTMLDivElement | null >;

		// Act.
		// renderControl(
		// 	<SizeControl units={ mockLengthUnits() } extendedOptions={ [ 'auto' ] } anchorRef={ anchorEl } />,
		// 	props
		// );

		const selectButton = screen.getByRole( 'button' );

		// Act.
		fireEvent.click( selectButton );

		// const options = screen.getAllByRole( 'menuitem' );

		// Assert.
		// expect( options.slice( -1 )[ 0 ] ).toContainHTML( customOptionElement );
	} );

	describe( 'Units', () => {
		it( 'should use system config units if units is not available in prop type settings', () => {
			// Arrange.
			mockGetLengthUnits.mockReturnValue( [ 'px', 'ch', '%' ] );

			const setValue = jest.fn();

			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				propType: createSizePropType(),
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const select = screen.getByRole( 'button' );

			fireEvent.click( select );

			const options = screen.getAllByRole( 'menuitem' );

			// Assert.
			expect( options ).toHaveLength( 3 );
			expect( options[ 0 ] ).toHaveTextContent( 'PX' );
			expect( options[ 1 ] ).toHaveTextContent( 'CH' );
			expect( options[ 2 ] ).toHaveTextContent( '%' );
		} );

		//    to default variant units when enablePropTypeUnits is true but no available_units in propType
		it( 'should use angle units if variant of angle provided ', () => {
			// Arrange.
			mockGetLengthUnits.mockReturnValue( [ 'px', 'ch', '%' ] );
			mockGetAngleUnits.mockReturnValue( [ 'deg', 'rad', 'grad', 'turn' ] );

			const setValue = jest.fn();

			const props = {
				setValue,
				value: mockSizeProp( { size: 10, unit: 'px' } ),
				bind: 'select',
				propType: createSizePropType(),
			};

			// Act.
			renderControl( <UnstableSizeControl variant="angle" />, props );

			const select = screen.getByRole( 'button' );

			// Act.
			fireEvent.click( select );

			const expected = [ 'deg', 'rad', 'grad', 'turn' ];

			screen.getAllByRole( 'menuitem' ).forEach( ( option, index ) => {
				expect( option ).toHaveTextContent( expected[ index ].toUpperCase() );
			} );
		} );
	} );

	describe( 'Keyboard Unit Selection', () => {
		it.each( [
			{ input: [ '%' ], expected: '%', description: 'exact match' },
			{ input: [ 'r' ], expected: 'rem', description: 'prefix match' },
			{ input: [ 'e' ], expected: 'em', description: 'prefix match' },
			{ input: [ 'p' ], expected: 'px', description: 'prefix match' },
			{ input: [ 'k' ], description: 'no match - should not change unit' },
		] )( 'should handle unit selection by keyboard - $description', ( { input, expected } ) => {
			// Arrange.
			const setValue = jest.fn();
			const units = mockLengthUnits();

			const props = {
				setValue,
				value: mockSizeProp( { size: 10, unit: 'px' } ),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units,
					},
				} ),
			};

			// disable custom flag it has to come from backend or and filter from backend
			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			// Act.
			input.forEach( ( key ) => {
				fireEvent.keyDown( sizeInput, { key } );
			} );

			// Assert.
			if ( expected && expected !== 'px' ) {
				expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 10, unit: expected } } );
			} else {
				expect( setValue ).not.toHaveBeenCalled();
			}
		} );

		it( 'should handle buffer overflow in unit selection (max 3 chars)', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp( { size: 10, unit: 'px' } ),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units: [ 'px', 'rem', 'em' ],
					},
				} ),
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			fireEvent.keyDown( sizeInput, { key: 'r' } );
			fireEvent.keyDown( sizeInput, { key: 'e' } );
			fireEvent.keyDown( sizeInput, { key: 'm' } );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 10, unit: 'rem' } } );
		} );

		it( 'should match auto unit via keyboard shortcut', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp( { size: 10, unit: 'px' } ),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units: [ 'px', 'auto' ],
					},
				} ),
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			setValue.mockClear();
			mockIsExtendedUnit.mockReturnValue( true );

			fireEvent.keyDown( sizeInput, { key: 'a' } );
			fireEvent.keyDown( sizeInput, { key: 'u' } );
			fireEvent.keyDown( sizeInput, { key: 't' } );
			fireEvent.keyDown( sizeInput, { key: 'o' } );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: '', unit: 'auto' } } );
		} );


		it( 'should handle buffer overflow in unit selection (max 3 chars) - custom', () => {
			// Arrange.
			const setValue = jest.fn();
			// const props = { setValue, value: mockSizeProp( { size: 10, unit: 'px' } ), bind: 'select', propType };
			const props = {
				setValue,
				value: mockSizeProp( { size: 10, unit: 'px' } ),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units: [ 'px', 'auto', 'custom' ],
					},
				} ),
			};

			const anchorEl = {
				current: document.body,
			} as unknown as RefObject< HTMLDivElement | null >;

			// Act.
			renderControl( <UnstableSizeControl anchorRef={ anchorEl } />, props );


			// Act.
			// renderControl(
			// 	<SizeControl units={ mockLengthUnits() } extendedOptions={ [ 'auto' ] } anchorRef={ anchorEl } />,
			// 	props
			// );
			mockIsExtendedUnit.mockReturnValue( true );

			const sizeInput = screen.getByRole( 'spinbutton' );

			fireEvent.keyDown( sizeInput, { key: 'c' } );
			fireEvent.keyDown( sizeInput, { key: 'u' } );
			fireEvent.keyDown( sizeInput, { key: 's' } );
			fireEvent.keyDown( sizeInput, { key: 't' } );

			// Assert.
			expect( setValue ).toHaveBeenLastCalledWith( {
				$$type: 'size',
				value: {
					size: '',
					unit: 'custom',
				},
			} );
		} );



		it( 'should handle default unit when defaultUnit is provided', () => {
			// Arrange.
			mockGetDefaultUnit.mockReturnValue( 'rem' );

			const setValue = jest.fn();

			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units: [ 'px', 'auto', '%', 'rem' ],
					},
				} ),
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			// Act
			fireEvent.input( sizeInput, { target: { value: '20' } } );

			// Assert
			expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 20, unit: 'rem' } } );
		} );

		it( 'should ignore key-combinations (such as ctrl, alt/opt, meta/cmd)', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: mockSizeProp( { size: 10, unit: 'px' } ),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units: [ 'px', 'rem', 'em', 'auto' ],
					},
				} ),
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			fireEvent.keyDown( sizeInput, { key: 'a', ctrlKey: true } );

			expect( setValue ).not.toHaveBeenCalled();
		} );

		describe( 'Angle Units Support', () => {
			it( 'should handle angle unit keyboard shortcuts "deg"', () => {
				// Arrange.
				const setValue = jest.fn();

				const props = {
					setValue,
					value: mockSizeProp( { size: 45, unit: 'turn' } ),
					bind: 'select',
					propType: createSizePropType( {
						settings: {
							units: [ 'deg', 'turn', 'grad', 'rad' ],
						},
					} ),
				};
				// Act.
				renderControl( <UnstableSizeControl />, props );

				const sizeInput = screen.getByRole( 'spinbutton' );

				fireEvent.keyDown( sizeInput, { key: 'd' } );

				expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'deg' } } );
			} );

			it( 'should handle angle unit keyboard shortcuts "rad"', () => {
				// Arrange.
				const setValue = jest.fn();
				// const props = { setValue, value: mockSizeProp( { size: 45, unit: 'rad' } ), bind: 'select', propType };

				// Arrange.
				// const setValue = jest.fn();

				const props = {
					setValue,
					value: mockSizeProp( { size: 45, unit: 'deg' } ),
					bind: 'select',
					propType: createSizePropType( {
						settings: {
							units: [ 'deg', 'turn', 'grad', 'rad' ],
						},
					} ),
				};
				// Act.
				renderControl( <UnstableSizeControl />, props );

				// Act.
				// renderControl( <SizeControl variant="angle" units={ mockAngleUnits() } disableCustom />, props );

				const sizeInput = screen.getByRole( 'spinbutton' );

				fireEvent.keyDown( sizeInput, { key: 'r' } );

				expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'rad' } } );
			} );

			it( 'should handle angle unit keyboard shortcuts "grad"', () => {
				// Arrange.
				// const setValue = jest.fn();
				// const props = { setValue, value: mockSizeProp( { size: 45, unit: 'grad' } ), bind: 'select', propType };
				//
				// // Act.
				// renderControl( <SizeControl variant="angle" units={ mockAngleUnits() } disableCustom />, props );

				const setValue = jest.fn();
				// const props = { setValue, value: mockSizeProp( { size: 45, unit: 'rad' } ), bind: 'select', propType };

				// Arrange.
				// const setValue = jest.fn();

				const props = {
					setValue,
					value: mockSizeProp( { size: 45, unit: 'deg' } ),
					bind: 'select',
					propType: createSizePropType( {
						settings: {
							units: [ 'deg', 'turn', 'grad', 'rad' ],
						},
					} ),
				};
				// Act.
				renderControl( <UnstableSizeControl />, props );

				const sizeInput = screen.getByRole( 'spinbutton' );

				fireEvent.keyDown( sizeInput, { key: 'g' } );
				fireEvent.keyDown( sizeInput, { key: 'r' } );

				expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'grad' } } );
			} );

			it( 'should handle angle unit keyboard shortcuts "turn"', () => {
				// Arrange.
				// const setValue = jest.fn();
				// const props = { setValue, value: mockSizeProp( { size: 45, unit: 'turn' } ), bind: 'select', propType };
				//
				// // Act.
				// renderControl( <SizeControl variant="angle" units={ mockAngleUnits() } disableCustom />, props );
				const setValue = jest.fn();
				// const props = { setValue, value: mockSizeProp( { size: 45, unit: 'rad' } ), bind: 'select', propType };

				// Arrange.
				// const setValue = jest.fn();

				const props = {
					setValue,
					value: mockSizeProp( { size: 45, unit: 'deg' } ),
					bind: 'select',
					propType: createSizePropType( {
						settings: {
							units: [ 'deg', 'turn', 'grad', 'rad' ],
						},
					} ),
				};
				// Act.
				renderControl( <UnstableSizeControl />, props );

				const sizeInput = screen.getByRole( 'spinbutton' );

				fireEvent.keyDown( sizeInput, { key: 't' } );
				fireEvent.keyDown( sizeInput, { key: 'u' } );

				expect( setValue ).toHaveBeenCalledWith( { $$type: 'size', value: { size: 45, unit: 'turn' } } );
			} );
		} );
	} );

	describe( 'Placeholder', () => {
		it( 'should prioritize prop placeholder over context placeholder', () => {
			// Arrange.
			const setValue = jest.fn();
			const units = mockLengthUnits();

			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units,
					},
				} ),
				placeholder: {
					$$type: 'size',
					value: {
						size: 100,
						unit: '%',
					},
				},
			};

			// Act.
			// renderControl( <SizeControl placeholder="Mixed Values" />, props );
			renderControl( <UnstableSizeControl placeholder="Mixed Values" />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );

			// Assert.
			expect( sizeInput ).toHaveAttribute( 'placeholder', 'Mixed Values' );
		} );

		it( 'should use the context placeholder if the prop placeholder is not provided', () => {
			// Arrange.
			const setValue = jest.fn();
			const units = mockLengthUnits();

			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				propType: createSizePropType( {
					settings: {
						units,
					},
				} ),
				placeholder: {
					$$type: 'size',
					value: {
						size: 20,
						unit: 'em',
					},
				},
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

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
				propType: createSizePropType( {
					settings: {
						units: [ 'vh', '%' ],
					},
				} ),
				placeholder: {
					$$type: 'size',
					value: {
						size: 200,
						unit: '%',
					},
				},
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );
			const unitButton = screen.getByRole( 'button' );

			// Assert.
			expect( sizeInput ).toHaveDisplayValue( '149' );
			expect( unitButton ).toHaveTextContent( 'vh' );
		} );

		it( 'should show no placeholder when neither prop nor bound prop placeholder is provided', () => {
			// Arrange
			const setValue = jest.fn();
			const units = mockLengthUnits();

			// wat happens wen disabled is sent
			const props = {
				setValue,
				value: mockSizeProp(),
				bind: 'select',
				disabled: true,
				propType: createSizePropType( {
					settings: {
						units,
					},
				} ),
			};

			// Act
			renderControl( <UnstableSizeControl />, props );

			// Assert
			const sizeInput = screen.getByRole( 'spinbutton' );
			const unitButton = screen.getByRole( 'button' );

			expect( sizeInput ).not.toHaveAttribute( 'placeholder' );
			expect( unitButton ).toHaveTextContent( 'px' );
		} );

		it( 'should keep the placeholder unit when value got changed', () => {
			// Arrange.
			const setValue = jest.fn();
			const units = mockLengthUnits();

			const props = {
				setValue,
				bind: 'select',
				disabled: true,
				propType: createSizePropType( {
					settings: {
						units,
					},
				} ),
				placeholder: {
					$$type: 'size',
					value: {
						size: 200,
						unit: '%',
					},
				},
			};

			// Act.
			renderControl( <UnstableSizeControl />, props );

			const sizeInput = screen.getByRole( 'spinbutton' );
			fireEvent.input( sizeInput, { target: { value: '123' } } );
			const unitButton = screen.getByRole( 'button' );

			// Assert.
			expect( sizeInput ).toHaveDisplayValue( '123' );
			expect( unitButton ).toHaveTextContent( '%' );
		} );
	} );
} );
