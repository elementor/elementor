import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesInheritanceChain } from '../../../../contexts/styles-inheritance-context';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { GridSizeFields } from '../grid-size-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: jest.fn( () => [] ),
	useInheritedValues: () => ( {} ),
} ) );

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useControlActions: () => ( {
			items: [],
		} ),
	};
} );

const renderGridSizeFields = () => {
	renderField( <GridSizeFields />, {
		propTypes: {
			'grid-template-columns': createMockPropType( { kind: 'plain', key: 'string' } ),
			'grid-template-rows': createMockPropType( { kind: 'plain', key: 'string' } ),
		},
	} );
};

describe( '<GridSizeFields />', () => {
	beforeEach( () => {
		jest.mocked( useStylesInheritanceChain ).mockReturnValue( [] );
	} );

	it( 'should render Columns and Rows labels', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-template-columns': null, 'grid-template-rows': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();

		// Assert.
		expect( screen.getByText( 'Columns' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Rows' ) ).toBeInTheDocument();
	} );

	it( 'should render empty inputs (no NaN) when no value is set', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-template-columns': null, 'grid-template-rows': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();

		// Assert.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs ).toHaveLength( 2 );
		inputs.forEach( ( input ) => {
			expect( input ).toHaveValue( null );
			expect( ( input as HTMLInputElement ).value ).not.toBe( 'NaN' );
		} );
	} );

	it( 'should display the parsed FR value from a repeat() css value', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'grid-template-columns': { $$type: 'string', value: 'repeat(3, 1fr)' },
				'grid-template-rows': { $$type: 'string', value: 'repeat(2, 1fr)' },
			},
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();

		// Assert.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs[ 0 ] ).toHaveValue( 3 );
		expect( inputs[ 1 ] ).toHaveValue( 2 );
	} );

	it( 'should persist a new fr value as a repeat() css string', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-template-columns': null, 'grid-template-rows': null },
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();
		const inputs = screen.getAllByRole( 'spinbutton' );
		fireEvent.input( inputs[ 0 ], { target: { value: '4' } } );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			expect.objectContaining( {
				'grid-template-columns': { $$type: 'string', value: 'repeat(4, 1fr)' },
			} ),
			expect.anything()
		);
	} );

	it( 'should not persist NaN-derived values when no size is provided', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-template-columns': null, 'grid-template-rows': null },
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();
		const inputs = screen.getAllByRole( 'spinbutton' );
		// Empty input - simulates user clearing the field.
		fireEvent.input( inputs[ 0 ], { target: { value: '' } } );

		// Assert.
		setValues.mock.calls.forEach( ( [ payload ] ) => {
			const value = ( payload as Record< string, unknown > )[ 'grid-template-columns' ];
			if ( value && typeof value === 'object' && 'value' in value ) {
				expect( ( value as { value: string } ).value ).not.toContain( 'NaN' );
			}
		} );
	} );

	it( 'should expose the inherited size as a placeholder when no local value is set', () => {
		// Arrange.
		jest.mocked( useStylesInheritanceChain ).mockImplementation( ( path: string[] ) => {
			if ( path[ 0 ] === 'grid-template-columns' ) {
				return [
					{
						value: { $$type: 'string', value: 'repeat(5, 1fr)' },
						style: {} as never,
						provider: null,
						variant: {} as never,
					},
				];
			}
			return [];
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-template-columns': null, 'grid-template-rows': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();

		// Assert.
		// The local value remains empty, but the inherited size surfaces as a placeholder
		// so users can see what's currently applied without overwriting it on unit changes.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs[ 0 ] ).toHaveValue( null );
		expect( inputs[ 0 ] ).toHaveAttribute( 'placeholder', '5' );
	} );

	it( 'should preserve the local value when only the unit is changed (FR -> custom)', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'grid-template-columns': { $$type: 'string', value: 'repeat(2, 1fr)' },
				'grid-template-rows': null,
			},
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();
		// Open the unit selector for the Columns field.
		const unitButtons = screen.getAllByRole( 'button', { name: /^fr$/i } );
		fireEvent.click( unitButtons[ 0 ] );
		// Pick the custom (fx) unit option.
		const customMenuItem = screen.getAllByRole( 'menuitem' )[ 1 ];
		fireEvent.click( customMenuItem );

		// Assert.
		// Switching unit alone (no size entered yet) must not persist a null/empty over the
		// existing local value — the user should still see "2 fr" until they actively change
		// the size in the new unit.
		const callsForColumns = setValues.mock.calls.filter(
			( [ payload ] ) => 'grid-template-columns' in ( payload as Record< string, unknown > )
		);
		callsForColumns.forEach( ( [ payload ] ) => {
			expect( ( payload as Record< string, unknown > )[ 'grid-template-columns' ] ).not.toBeNull();
		} );
	} );

	it( 'should prefer the local value over the inherited value', () => {
		// Arrange.
		jest.mocked( useStylesInheritanceChain ).mockImplementation( ( path: string[] ) => {
			if ( path[ 0 ] === 'grid-template-columns' ) {
				return [
					{
						value: { $$type: 'string', value: 'repeat(2, 1fr)' },
						style: {} as never,
						provider: null,
						variant: {} as never,
					},
					{
						value: { $$type: 'string', value: 'repeat(7, 1fr)' },
						style: {} as never,
						provider: null,
						variant: {} as never,
					},
				];
			}
			return [];
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'grid-template-columns': { $$type: 'string', value: 'repeat(2, 1fr)' },
				'grid-template-rows': null,
			},
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSizeFields();

		// Assert.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs[ 0 ] ).toHaveValue( 2 );
	} );
} );
