import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { useEditMode } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import PrimaryAction from '../primary-action';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useActiveDocumentActions: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters' );

const actionsMock = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
	copyAndShare: jest.fn(),
};

describe( '@elementor/editor-app-bar - Top Bar Primary Action', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocumentActions ).mockReturnValue( actionsMock );
		jest.mocked( useEditMode ).mockReturnValue( 'edit' );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not render when there is no active document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );

		// Act.
		const { container } = renderWithTheme( <PrimaryAction /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should have "Submit" text when the user cannot publish the document', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			userCan: {
				publish: false,
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		expect( screen.getAllByRole( 'button' )[ 0 ] ).toHaveTextContent( 'Submit' );
	} );

	it( 'should have "Publish" text when the user can publish the document', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			userCan: {
				publish: true,
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		expect( screen.getAllByRole( 'button' )[ 0 ] ).toHaveTextContent( 'Publish' );
	} );

	it( 'should disable main and the menu buttons when the document is a Kit', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: true,
			type: {
				value: 'kit',
				label: 'Kit',
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		const mainButton = screen.getByText( 'Publish' );
		const menuButton = screen.getByLabelText( 'Save Options' );

		expect( mainButton ).toBeDisabled();
		expect( menuButton ).toBeDisabled();
	} );

	it( 'should disable main and the menu buttons when in preview mode', () => {
		// Arrange.
		const mockDocument = createMockDocument();

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );
		jest.mocked( useEditMode ).mockReturnValue( 'preview' );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		const mainButton = screen.getByText( 'Publish' );
		const menuButton = screen.getByLabelText( 'Save Options' );

		expect( mainButton ).toBeDisabled();
		expect( menuButton ).toBeDisabled();
	} );

	it( 'should disable only the main button when the document is pristine', () => {
		// Arrange.
		const mockDocument = createMockDocument( { isDirty: false } );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		const mainButton = screen.getByText( 'Publish' );
		const menuButton = screen.getByLabelText( 'Save Options' );

		expect( mainButton ).toBeDisabled();
		expect( menuButton ).toBeEnabled();
	} );

	it( 'should always enable main and menu buttons when the document status is draft', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: false,
			status: {
				value: 'draft',
				label: 'Draft',
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		const mainButton = screen.getByText( 'Publish' );
		const menuButton = screen.getByLabelText( 'Save Options' );

		expect( mainButton ).toBeEnabled();
		expect( menuButton ).toBeEnabled();
	} );

	it( 'should save the active document on click', () => {
		// Arrange.
		const mockDocument = createMockDocument( { isDirty: true } );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		fireEvent.click( screen.getAllByRole( 'button' )[ 0 ] );

		// Assert.
		expect( actionsMock.save ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should show a loader & not save when there is save in progress', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: true,
			isSaving: true,
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		const button = screen.getAllByRole( 'button' )[ 0 ];
		const loader = screen.getAllByRole( 'progressbar' )[ 0 ];

		fireEvent.click( button );

		// Assert.
		expect( actionsMock.save ).not.toHaveBeenCalled();
		expect( loader ).toBeInTheDocument();
		expect( button ).toHaveTextContent( '' );
	} );

	it( 'should not show a loader when the button is disabled', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			type: {
				value: 'kit',
				label: 'Kit',
			}, // Disables the button.
			isSaving: true,
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		renderWithTheme( <PrimaryAction /> );
		const button = screen.getAllByRole( 'button' )[ 0 ];
		const loader = screen.queryByRole( 'progressbar' );

		// Assert.
		expect( loader ).not.toBeInTheDocument();
		expect( button ).not.toHaveTextContent( '' );
	} );
} );
