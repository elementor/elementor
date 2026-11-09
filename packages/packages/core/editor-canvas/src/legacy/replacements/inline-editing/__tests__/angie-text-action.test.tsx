import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieTextAction } from '../angie-text-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	isExperimentActive: jest.fn(),
} ) );

const ELEMENT_ID = 'abc123';

describe( 'AngieTextAction', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders nothing when the experiment is off', () => {
		// Arrange
		jest.mocked( isExperimentActive ).mockReturnValue( false );

		// Act
		render( <AngieTextAction elementId={ ELEMENT_ID } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Generate with Angie' } ) ).not.toBeInTheDocument();
		expect( isExperimentActive ).toHaveBeenCalledWith( 'e_angie_in_panels' );
	} );

	it( 'opens Angie with a prompt naming the element when clicked', () => {
		// Arrange
		jest.mocked( isExperimentActive ).mockReturnValue( true );
		render( <AngieTextAction elementId={ ELEMENT_ID } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate with Angie' } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( `At element ${ ELEMENT_ID } I want: ` );
	} );
} );
