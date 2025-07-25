import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { type Element, type ElementType, useSelectedElement } from '@elementor/editor-elements';
import { screen } from '@testing-library/react';

import { EditingPanel } from '../editing-panel';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementType: jest.fn(),
	useSelectedElement: jest.fn(),
} ) );

describe( '<EditingPanel />', () => {
	it( 'should render the selected element editing panel', () => {
		// Arrange
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );

		// Act.
		renderWithTheme( <EditingPanel /> );

		// Assert.
		expect( screen.getByText( 'Edit Heading' ) ).toBeInTheDocument();
	} );

	it.each( [
		{
			title: 'element is empty',
			element: null,
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		},
		{
			title: 'element type is empty',
			element: { id: '1', type: 'atomic-heading' },
			elementType: null,
		},
	] )( 'should not render panel when $title', ( { element, elementType } ) => {
		// Arrange.
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: element as Element,
			elementType: elementType as ElementType,
		} );

		// Act.
		renderWithTheme( <EditingPanel /> );

		// Assert.
		expect( screen.queryByText( 'Edit Heading' ) ).not.toBeInTheDocument();
	} );
} );
