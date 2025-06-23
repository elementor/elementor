import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { fireEvent, screen } from '@testing-library/react';

import PrimaryAction from '../primary-action';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useActiveDocumentActions: jest.fn(),
} ) );

describe( '@elementor/editor-app-bar - Primary action', () => {
	let saveFn: () => Promise< void >;

	beforeEach( () => {
		saveFn = jest.fn( () => Promise.resolve() );

		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument() );
		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save: saveFn,
			saveTemplate: jest.fn(),
			saveDraft: jest.fn(),
			copyAndShare: jest.fn(),
		} );
	} );

	it( 'should save site settings on click', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument( { isDirty: true } ) );

		renderWithTheme( <PrimaryAction /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( saveFn ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [
		{
			title: "it's pristine",
			document: createMockDocument( { isDirty: false } ),
		},
		{
			title: "it's in saving mode",
			document: createMockDocument( { isDirty: true, isSaving: true } ),
		},
		{
			title: "it doesn't exist",
			document: null,
		},
	] )( 'should not save site settings when $title', ( { document } ) => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( document );

		renderWithTheme( <PrimaryAction /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( saveFn ).not.toHaveBeenCalled();
	} );

	it.each( [
		{
			title: 'site settings is pristine',
			document: createMockDocument( { isDirty: false } ),
		},
		{
			title: "site settings doesn't exist",
			document: null,
		},
	] )( 'should be disabled when $title', ( { document } ) => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( document );

		// Act.
		renderWithTheme( <PrimaryAction /> );

		// Assert.
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'should show a loader when saving site settings', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				isDirty: true,
				isSaving: true,
			} )
		);

		// Act.
		renderWithTheme( <PrimaryAction /> );

		const loader = screen.getByRole( 'progressbar' );

		// Assert.
		expect( loader ).toBeInTheDocument();
	} );
} );
