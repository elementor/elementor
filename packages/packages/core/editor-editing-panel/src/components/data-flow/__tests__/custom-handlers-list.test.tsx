import * as React from 'react';
import { getElementSnippetReferences } from '@elementor/editor-elements';
import { fireEvent, render, screen } from '@testing-library/react';

import { useElement } from '../../../contexts/element-context';
import { CustomHandlersList } from '../custom-handlers-list';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../../contexts/element-context' );

const ELEMENT_ID = 'element-1';
const DESCRIPTION = 'Increments the counter on click';
const CODE = '( { state } ) => { state.count++; }';

const setSnippets = ( handler: Record< string, unknown > ) => {
	( window as unknown as { elementor: unknown } ).elementor = {
		config: { dataFlow: { snippets: { counter: [ { event: 'click', description: DESCRIPTION, ...handler } ] } } },
	};
};

describe( '<CustomHandlersList />', () => {
	beforeEach( () => {
		jest.mocked( useElement ).mockReturnValue( { element: { id: ELEMENT_ID, type: 'e-button' } } as never );
		jest.mocked( getElementSnippetReferences ).mockReturnValue( [ { snippet: 'counter', event: 'click' } ] );
	} );

	it( 'should render the description of each referenced handler', () => {
		// Arrange
		setSnippets( {} );

		// Act
		render( <CustomHandlersList /> );

		// Assert
		expect( screen.getByText( DESCRIPTION ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Show code' ) ).not.toBeInTheDocument();
	} );

	it( 'should reveal the code only when the user can view it', () => {
		// Arrange
		setSnippets( { code: CODE } );

		// Act
		render( <CustomHandlersList /> );
		fireEvent.click( screen.getByText( 'Show code' ) );

		// Assert
		expect( screen.getByText( CODE ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when the element has no snippet references', () => {
		// Arrange
		setSnippets( {} );
		jest.mocked( getElementSnippetReferences ).mockReturnValue( [] );

		// Act
		const { container } = render( <CustomHandlersList /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );
} );
