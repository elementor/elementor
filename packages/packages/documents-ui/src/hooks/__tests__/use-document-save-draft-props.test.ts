import { createMockDocument } from 'test-utils';
import { renderHook } from '@testing-library/react-hooks';
import useDocumentSaveDraftProps from '../use-document-save-draft-props';
import { useActiveDocument, useActiveDocumentActions } from '@elementor/documents';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn(),
} ) );

const documentActions = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
};

describe( '@elementor/documents-ui - useDocumentSaveDraftProps', () => {
	it( 'should save a draft of the current document', () => {
		// Arrange.
		jest.mocked( useActiveDocumentActions ).mockReturnValue( documentActions );
		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument() );

		// Act.
		const { result } = renderHook( () => useDocumentSaveDraftProps() );
		result.current.onClick?.();

		// Assert.
		expect( documentActions.saveDraft ).toBeCalledTimes( 1 );
	} );

	it.each( [
		{
			condition: 'there is no document',
			document: null,
		},
		{
			condition: 'a draft is being saved',
			document: createMockDocument( {
				isSavingDraft: true,
			} ),
		},
		{
			condition: 'the document is being saved',
			document: createMockDocument( {
				isSaving: true,
			} ),
		},
		{
			condition: 'the document is pristine',
			document: createMockDocument( {
				isDirty: false,
			} ),
		},
	] )( 'should be disabled when $condition', ( { document } ) => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( document );

		// Act.
		const { result } = renderHook( () => useDocumentSaveDraftProps() );

		// Assert.
		expect( result.current.disabled ).toBe( true );
	} );
} );
