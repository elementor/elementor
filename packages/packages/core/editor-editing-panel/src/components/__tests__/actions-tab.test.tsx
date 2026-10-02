import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { getElementHandlers, updateElementHandlers } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../contexts/element-context';
import { HandlersTab } from '../handlers-tab';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementHandlers: jest.fn(),
	updateElementHandlers: jest.fn(),
} ) );

const ELEMENT_ID = 'button-1';
const EXISTING_CODE = 'setState( "count", ( c ) => c + 1 );';

const renderHandlersTab = () => {
	const element = { id: ELEMENT_ID, type: 'e-button' };
	const elementType = createMockElementType( { key: 'e-button', title: 'Button' } );

	return renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
			<HandlersTab />
		</ElementProvider>
	);
};

describe( '<HandlersTab />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the existing handlers of the element', () => {
		// Arrange
		jest.mocked( getElementHandlers ).mockReturnValue( [ { event: 'click', code: EXISTING_CODE } ] );

		// Act
		renderHandlersTab();

		// Assert
		expect( getElementHandlers ).toHaveBeenCalledWith( ELEMENT_ID );
		expect( screen.getByRole( 'textbox', { name: 'Handler code' } ) ).toHaveValue( EXISTING_CODE );
	} );

	it( 'should add a new init handler', () => {
		// Arrange
		jest.mocked( getElementHandlers ).mockReturnValue( [] );
		renderHandlersTab();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Add handler' } ) );

		// Assert
		expect( updateElementHandlers ).toHaveBeenCalledWith( {
			elementId: ELEMENT_ID,
			handlers: [ { event: 'init', code: '' } ],
		} );
	} );

	it( 'should update the handler code', () => {
		// Arrange
		jest.mocked( getElementHandlers ).mockReturnValue( [ { event: 'click', code: '' } ] );
		renderHandlersTab();

		// Act
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Handler code' } ), {
			target: { value: EXISTING_CODE },
		} );

		// Assert
		expect( updateElementHandlers ).toHaveBeenLastCalledWith( {
			elementId: ELEMENT_ID,
			handlers: [ { event: 'click', code: EXISTING_CODE } ],
		} );
	} );

	it( 'should remove a handler', () => {
		// Arrange
		jest.mocked( getElementHandlers ).mockReturnValue( [ { event: 'click', code: EXISTING_CODE } ] );
		renderHandlersTab();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Remove handler' } ) );

		// Assert
		expect( updateElementHandlers ).toHaveBeenCalledWith( { elementId: ELEMENT_ID, handlers: [] } );
		expect( screen.queryByRole( 'textbox', { name: 'Handler code' } ) ).not.toBeInTheDocument();
	} );
} );
