import * as React from 'react';
import { useSelectedElement } from '@elementor/editor-elements';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieControlHeaderAction } from '../angie-control-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	useSelectedElement: jest.fn(),
} ) );

const ELEMENT_ID = 'abc123';

describe( 'AngieControlHeaderAction', () => {
	beforeEach( () => {
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'selected-1', type: 'e-div-block' },
			elementType: null,
		} as unknown as ReturnType< typeof useSelectedElement > );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the control header prompt when clicked', () => {
		// Arrange
		render(
			<AngieControlHeaderAction
				elementId={ ELEMENT_ID }
				controlType="inline-editing"
				bind="title"
				path={ [ 'title' ] }
			/>
		);

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith(
			ANGIE_PROMPTS.controlHeader( {
				elementId: ELEMENT_ID,
				controlType: 'inline-editing',
				bind: 'title',
				path: [ 'title' ],
			} )
		);
	} );

	it( 'falls back to the selected element when no element id is given', () => {
		// Arrange
		render( <AngieControlHeaderAction controlType="image" bind="image" path={ [ 'background', 'image' ] } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith(
			ANGIE_PROMPTS.controlHeader( {
				elementId: 'selected-1',
				controlType: 'image',
				bind: 'image',
				path: [ 'background', 'image' ],
			} )
		);
	} );

	it( 'renders nothing for a control type without a prompt', () => {
		// Act
		render(
			<AngieControlHeaderAction elementId={ ELEMENT_ID } controlType="link" bind="link" path={ [ 'link' ] } />
		);

		// Assert
		expect( screen.queryByRole( 'button', { name: getGenerateWithAngieLabel() } ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when no element is known', () => {
		// Arrange
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: null,
			elementType: null,
		} as unknown as ReturnType< typeof useSelectedElement > );

		// Act
		render( <AngieControlHeaderAction controlType="image" bind="image" path={ [ 'image' ] } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: getGenerateWithAngieLabel() } ) ).not.toBeInTheDocument();
	} );
} );
