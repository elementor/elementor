import { render, screen } from '@testing-library/react';
import PrimaryAction from '../primary-action';
import { createMockDocument } from 'test-utils';
import { useActiveDocument, useActiveDocumentActions } from '@elementor/documents';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn(),
} ) );

describe( '@elementor/site-settings - Primary action', () => {
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

	it( 'should save site settings on click', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => createMockDocument( { isDirty: true } ) );

		render( <PrimaryAction /> );

		// Act.
		screen.getByRole( 'button' ).click();

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
		jest.mocked( useActiveDocument ).mockImplementation( () => document );

		render( <PrimaryAction /> );

		// Act.
		screen.getByRole( 'button' ).click();

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
		jest.mocked( useActiveDocument ).mockImplementation( () => document );

		// Act.
		render( <PrimaryAction /> );

		// Assert.
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'should show a loader when saving site settings', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => createMockDocument( {
			isDirty: true,
			isSaving: true,
		} ) );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		const loader = getByRole( 'progressbar' );

		// Assert.
		expect( loader ).toBeInTheDocument();
	} );
} );
