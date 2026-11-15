import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieGenerateButton } from '../angie-generate-button';
import { getGenerateWithAngieLabel } from '../labels';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const PROMPT = 'Test prompt';

describe( 'AngieGenerateButton', () => {
	const originalElementorV2 = window.elementorV2;

	beforeEach( () => {
		window.elementorV2 = {
			editorAngie: {
				openAngie: jest.fn(),
			},
		};
	} );

	afterEach( () => {
		window.elementorV2 = originalElementorV2;
		delete window.elementorEditorAngie;
		jest.clearAllMocks();
	} );

	it( 'renders nothing when showEntryPoints is false (app-bar toggle is unaffected)', () => {
		// Arrange
		window.elementorEditorAngie = { showEntryPoints: false };

		// Act
		const { container } = render( <AngieGenerateButton prompt={ PROMPT } /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the generate label', () => {
		// Act
		render( <AngieGenerateButton prompt={ PROMPT } /> );

		// Assert
		expect( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) ).toBeInTheDocument();
	} );

	it( 'opens Angie with the prompt when clicked', () => {
		// Arrange
		render( <AngieGenerateButton prompt={ PROMPT } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( PROMPT );
	} );
} );