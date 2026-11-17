import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';
import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieInteractionsHeaderAction } from '../angie-interactions-header-action';
import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'element-88';

describe( 'AngieInteractionsHeaderAction', () => {
	beforeEach( () => {
		mockAngieEntryPointsEnabled();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the interactions prompt when clicked', () => {
		// Arrange
		render( <AngieInteractionsHeaderAction elementId={ ELEMENT_ID } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( ANGIE_PROMPTS.interactions( { elementId: ELEMENT_ID } ) );
	} );
} );
