import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';
import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieVariableFormHeaderAction } from '../angie-variable-form-header-action';
import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

describe( 'AngieVariableFormHeaderAction', () => {
	beforeEach( () => {
		mockAngieEntryPointsEnabled();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the variable form prompt when clicked', () => {
		// Arrange
		const props = { variableType: 'color', label: 'Primary', variableId: 'var-1' };
		render( <AngieVariableFormHeaderAction { ...props } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( ANGIE_PROMPTS.variableForm( props ) );
	} );
} );
