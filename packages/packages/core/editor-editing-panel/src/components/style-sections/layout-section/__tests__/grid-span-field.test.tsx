import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { GridSpanFields } from '../grid-span-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
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

const renderGridSpanFields = () => {
	renderField( <GridSpanFields />, {
		propTypes: {
			'grid-column': createMockPropType( { kind: 'plain', key: 'span' } ),
			'grid-row': createMockPropType( { kind: 'plain', key: 'span' } ),
		},
	} );
};

describe( '<GridSpanFields />', () => {
	it( 'should render Column Span and Row Span labels', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-column': null, 'grid-row': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSpanFields();

		// Assert.
		expect( screen.getByText( 'Column Span' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Row Span' ) ).toBeInTheDocument();
	} );

	it( 'should render number inputs', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-column': null, 'grid-row': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSpanFields();

		// Assert.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs ).toHaveLength( 2 );
	} );

	it( 'should display span value from prop', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {
				'grid-column': { $$type: 'span', value: 3 },
				'grid-row': { $$type: 'span', value: 2 },
			},
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridSpanFields();

		// Assert.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs[ 0 ] ).toHaveValue( 3 );
		expect( inputs[ 1 ] ).toHaveValue( 2 );
	} );

	it( 'should update grid-column with span value on input', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-column': null, 'grid-row': null },
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridSpanFields();

		const inputs = screen.getAllByRole( 'spinbutton' );
		fireEvent.input( inputs[ 0 ], { target: { value: '4' } } );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			expect.objectContaining( {
				'grid-column': { $$type: 'span', value: 4 },
			} ),
			expect.anything()
		);
	} );

	it( 'should clear value when input is emptied', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-column': { $$type: 'span', value: 3 }, 'grid-row': null },
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridSpanFields();

		const inputs = screen.getAllByRole( 'spinbutton' );
		fireEvent.input( inputs[ 0 ], { target: { value: '' } } );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			expect.objectContaining( {
				'grid-column': null,
			} ),
			expect.anything()
		);
	} );
} );
