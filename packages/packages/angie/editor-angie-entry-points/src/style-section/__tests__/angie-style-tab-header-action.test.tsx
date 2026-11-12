import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieStyleTabHeaderAction } from '../angie-style-tab-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'el-styles';

describe( 'AngieStyleTabHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the style tab prompt when clicked', () => {
		// Arrange
		render( <AngieStyleTabHeaderAction elementId={ ELEMENT_ID } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( ANGIE_PROMPTS.styleTab( { elementId: ELEMENT_ID } ) );
	} );
} );
