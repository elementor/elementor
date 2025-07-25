import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { ClassManagerButton } from '../class-manager-button';
import { usePanelActions } from '../class-manager-panel';

jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	useUserStylesCapability: jest.fn( () => ( {
		userCan: jest.fn().mockReturnValue( { update: true } ),
	} ) ),
} ) );

jest.mock( '../class-manager-panel', () => ( {
	usePanelActions: jest.fn( () => ( { open: jest.fn() } ) ),
} ) );

describe( 'ClassManagerButton', () => {
	const unsavedChangesMessage = 'You have unsaved changes';

	it( 'should navigate to the panel on click when the document is pristine', () => {
		// Arrange.
		const openPanel = jest.fn();

		jest.mocked( usePanelActions ).mockReturnValue( { open: openPanel } as never );

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: false,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save: jest.fn(),
		} as never );

		// Act.
		renderWithQuery( <ClassManagerButton /> );

		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( openPanel ).toHaveBeenCalled();
	} );

	it( 'should open the dialog if the document is dirty, and allow to cancel the action', () => {
		// Arrange.
		const save = jest.fn();
		const openPanel = jest.fn();

		jest.mocked( usePanelActions ).mockReturnValue( { open: openPanel } as never );

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: true,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save,
		} as never );

		// Act.
		renderWithQuery( <ClassManagerButton /> );

		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( screen.getByText( unsavedChangesMessage ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Stay here' } ) );

		// Assert.
		expect( screen.queryByText( unsavedChangesMessage ) ).not.toBeInTheDocument();
		expect( save ).not.toHaveBeenCalled();
		expect( openPanel ).not.toHaveBeenCalled();
	} );

	it( 'should open the dialog if the document is dirty, and allow to save and continue', async () => {
		// Arrange.
		const save = jest.fn().mockResolvedValue( null );
		const openPanel = jest.fn();

		jest.mocked( usePanelActions ).mockReturnValue( { open: openPanel } as never );

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: true,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save,
		} as never );

		renderWithQuery( <ClassManagerButton /> );

		// Act.
		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( screen.getByText( unsavedChangesMessage ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Save & Continue' } ) );

		// Assert.
		await waitFor( () => {
			expect( screen.queryByText( unsavedChangesMessage ) ).not.toBeInTheDocument();
		} );

		expect( save ).toHaveBeenCalled();
		expect( openPanel ).toHaveBeenCalled();
	} );

	it( 'should not render the button if the user does not have permission to update classes', () => {
		// Arrange.
		jest.mocked( useUserStylesCapability ).mockReturnValue( {
			userCan: jest.fn().mockReturnValue( { update: false } ),
		} );

		// Act.
		const { container } = renderWithQuery( <ClassManagerButton /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
