import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { AccordionItemsControl } from '../accordion-items-control';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../../../contexts/element-context' );

describe( '<AccordionItemsControl />', () => {
	const mockItems = ( count: number ) => {
		jest.mocked( useElementChildren ).mockReturnValue( {
			'e-accordion-item': Array.from( { length: count }, ( _, index ) => ( {
				id: `item-${ index }`,
				editorSettings: { title: `Accordion Item ${ index + 1 }` },
			} ) ),
		} );
	};

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useElement ).mockReturnValue( {
			element: mockElement( { id: 'accordion-1', type: 'e-accordion' } ),
			elementType: createMockElementType(),
			settings: {},
		} );

		jest.mocked( useElementEditorSettings ).mockReturnValue( {} );
	} );

	// The control is intentionally not wrapped in a `SettingsField`, so this also proves that
	// `Repeater` renders with no bound prop in context.
	it( 'should render an item per accordion item child', () => {
		// Arrange.
		mockItems( 3 );

		// Act.
		renderWithTheme( <AccordionItemsControl label="Accordion Items" /> );

		// Assert.
		expect( screen.getByText( 'Accordion Items' ) ).toBeInTheDocument();
		expect( screen.getAllByLabelText( 'Open item' ) ).toHaveLength( 3 );
		expect( screen.getAllByLabelText( 'Remove' ) ).toHaveLength( 3 );
	} );

	it( 'should hide the remove affordance when a single item remains', () => {
		// Arrange.
		mockItems( 1 );

		// Act.
		renderWithTheme( <AccordionItemsControl label="Accordion Items" /> );

		// Assert.
		expect( screen.getAllByLabelText( 'Open item' ) ).toHaveLength( 1 );
		expect( screen.queryByLabelText( 'Remove' ) ).not.toBeInTheDocument();
	} );

	it( 'should not offer a per-item visibility toggle', () => {
		// Arrange.
		mockItems( 2 );

		// Act.
		renderWithTheme( <AccordionItemsControl label="Accordion Items" /> );

		// Assert.
		expect( screen.queryByLabelText( 'Hide' ) ).not.toBeInTheDocument();
		expect( screen.getAllByLabelText( 'Duplicate' ) ).toHaveLength( 2 );
	} );
} );
