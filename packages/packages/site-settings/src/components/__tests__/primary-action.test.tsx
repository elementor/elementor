import { render, screen } from '@testing-library/react';
import PrimaryAction from '../primary-action';
import { createMockDocument } from 'test-utils';
import { useActiveDocument, useActiveDocumentActions } from '@elementor/documents';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn(),
} ) );

describe( '@elementor/documents - Site settings primary action', () => {
	let saveFn: () => Promise<void>;

	beforeEach( () => {
		saveFn = jest.fn( () => Promise.resolve() );

		jest.mocked( useActiveDocument ).mockImplementation( () => createMockDocument() );
		jest.mocked( useActiveDocumentActions ).mockImplementation( () => ( {
			save: saveFn,
			saveTemplate: jest.fn(),
			saveDraft: jest.fn(),
		} ) );
	} );

	it( 'should save the document on click', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => ( {
			...createMockDocument(),
			isDirty: true,
		} ) );

		render( <PrimaryAction /> );

		// Act.
		screen.getByRole( 'button' ).click();

		// Assert.
		expect( saveFn ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [
		{
			title: 'document is pristine',
			document: { ...createMockDocument(), isDirty: false },
		},
		{
			title: 'document in saving mode',
			document: { ...createMockDocument(), isDirty: true, isSaving: true },
		},
		{
			title: 'document not exists',
			document: null,
		},
	] )( 'should save the document when $title', ( { document } ) => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => document );

		render( <PrimaryAction /> );

		// Act.
		screen.getByRole( 'button' ).click();

		// Assert.
		expect( saveFn ).not.toHaveBeenCalled();
	} );

	it.each( [
		{
			title: 'document is pristine',
			document: { ...createMockDocument(), isDirty: false },
		},
		{
			title: 'document not exists',
			document: null,
		},
	] )( 'should make the button disabled when $title', ( { document } ) => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => document );

		// Act.
		render( <PrimaryAction /> );

		// Assert.
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );
} );
