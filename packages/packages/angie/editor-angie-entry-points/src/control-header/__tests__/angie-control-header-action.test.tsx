import * as React from 'react';
import { useSelectedElement } from '@elementor/editor-elements';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieControlHeaderAction } from '../angie-control-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	useSelectedElement: jest.fn(),
} ) );

const ELEMENT_ID = 'abc123';
const SELECTED_ELEMENT_ID = 'selected-1';
const BUTTON_NAME = 'Generate with Angie';

describe( 'AngieControlHeaderAction', () => {
	beforeEach( () => {
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: SELECTED_ELEMENT_ID, type: 'e-div-block' },
			elementType: null,
		} as unknown as ReturnType< typeof useSelectedElement > );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{
			source: 'text',
			props: { elementId: ELEMENT_ID, controlType: 'inline-editing', bind: 'title', path: [ 'title' ] },
			prompt: `At element ${ ELEMENT_ID } I want: `,
		},
		{
			source: 'image',
			props: { elementId: ELEMENT_ID, controlType: 'image', bind: 'image', path: [ 'image' ] },
			prompt: `At element ${ ELEMENT_ID }, image, I want: `,
		},
		{
			source: 'named image',
			props: { elementId: ELEMENT_ID, controlType: 'image', bind: 'logo', path: [ 'logo' ] },
			prompt: `At element ${ ELEMENT_ID }, image "logo", I want: `,
		},
		{
			source: 'background image',
			props: {
				controlType: 'image',
				bind: 'image',
				path: [ 'background', 'background-overlay', '0', 'image' ],
			},
			prompt: `At element ${ SELECTED_ELEMENT_ID }, background image, I want: `,
		},
	] )( 'opens Angie with the $source prompt when clicked', ( { props, prompt } ) => {
		// Arrange
		render( <AngieControlHeaderAction { ...props } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( prompt );
	} );

	it( 'renders nothing for a control type without a prompt', () => {
		// Act
		render(
			<AngieControlHeaderAction elementId={ ELEMENT_ID } controlType="link" bind="link" path={ [ 'link' ] } />
		);

		// Assert
		expect( screen.queryByRole( 'button', { name: BUTTON_NAME } ) ).not.toBeInTheDocument();
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
		expect( screen.queryByRole( 'button', { name: BUTTON_NAME } ) ).not.toBeInTheDocument();
	} );
} );
