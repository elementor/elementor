import * as React from 'react';
import { useElement, useStyle } from '@elementor/editor-editing-panel';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { useProviders } from '@elementor/editor-styles-repository';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieClassSelectorAction } from '../angie-class-selector-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

jest.mock( '@elementor/editor-editing-panel', () => ( {
	useElement: jest.fn(),
	useStyle: jest.fn(),
} ) );

jest.mock( '@elementor/editor-styles-repository', () => ( {
	useProviders: jest.fn(),
} ) );

const ELEMENT_ID = 'element-1';
const BUTTON_NAME = 'Generate with Angie';

describe( 'AngieClassSelectorAction', () => {
	beforeEach( () => {
		jest.mocked( useElement ).mockReturnValue( {
			element: { id: ELEMENT_ID, type: 'e-div-block' },
		} as ReturnType< typeof useElement > );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the active class prompt when clicked', () => {
		// Arrange
		jest.mocked( useStyle ).mockReturnValue( { id: 'class-1' } as ReturnType< typeof useStyle > );
		jest.mocked( useProviders ).mockReturnValue( [
			{
				getKey: () => 'elements',
				actions: {
					all: () => [ { id: 'class-1', label: 'My Class' } ],
				},
			},
		] as ReturnType< typeof useProviders > );

		render( <AngieClassSelectorAction /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( `At element ${ ELEMENT_ID }, class "My Class", I want: ` );
	} );

	it( 'renders nothing when no active class is selected', () => {
		// Arrange
		jest.mocked( useStyle ).mockReturnValue( { id: null } as ReturnType< typeof useStyle > );
		jest.mocked( useProviders ).mockReturnValue( [] );

		// Act
		render( <AngieClassSelectorAction /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: BUTTON_NAME } ) ).not.toBeInTheDocument();
	} );
} );
