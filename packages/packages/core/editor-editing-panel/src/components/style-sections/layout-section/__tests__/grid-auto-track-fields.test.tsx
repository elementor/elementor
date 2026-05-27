import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { GridAutoTrackFields } from '../grid-auto-track-fields';

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

const GRID_AUTO_TRACK_UNITS = [ 'px', '%', 'fr', 'auto', 'custom' ];

const renderGridAutoTrackFields = () => {
	renderField( <GridAutoTrackFields />, {
		propTypes: {
			'grid-auto-rows': createMockPropType( {
				kind: 'plain',
				key: 'size',
				settings: { available_units: GRID_AUTO_TRACK_UNITS },
			} ),
			'grid-auto-columns': createMockPropType( {
				kind: 'plain',
				key: 'size',
				settings: { available_units: GRID_AUTO_TRACK_UNITS },
			} ),
		},
	} );
};

describe( '<GridAutoTrackFields />', () => {
	it( 'should render Auto rows and Auto columns labels', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-auto-rows': null, 'grid-auto-columns': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridAutoTrackFields();

		// Assert.
		expect( screen.getByText( 'Auto rows' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Auto columns' ) ).toBeInTheDocument();
	} );

	it( 'should persist a new size value for grid-auto-rows', () => {
		// Arrange.
		const setValues = jest.fn();
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-auto-rows': null, 'grid-auto-columns': null },
			setValues,
			canEdit: true,
		} );

		// Act.
		renderGridAutoTrackFields();
		const inputs = screen.getAllByRole( 'spinbutton' );
		fireEvent.input( inputs[ 0 ], { target: { value: '2' } } );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			expect.objectContaining( {
				'grid-auto-rows': { $$type: 'size', value: { size: 2, unit: 'px' } },
			} ),
			expect.anything()
		);
	} );

	it( 'should default to the first prop type unit', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'grid-auto-rows': null, 'grid-auto-columns': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		// Act.
		renderGridAutoTrackFields();
		const unitButtons = screen.getAllByRole( 'button', { name: /^px$/i } );

		// Assert.
		expect( unitButtons ).toHaveLength( 2 );
	} );
} );
