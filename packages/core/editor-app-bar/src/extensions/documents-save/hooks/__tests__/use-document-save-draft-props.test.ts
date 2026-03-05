import { createMockDocument } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { renderHook } from '@testing-library/react';

import useDocumentSaveDraftProps from '../use-document-save-draft-props';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useActiveDocumentActions: jest.fn(),
} ) );

const documentActions = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
	copyAndShare: jest.fn(),
};

describe( '@elementor/editor-app-bar - useDocumentSaveDraftProps', () => {
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
