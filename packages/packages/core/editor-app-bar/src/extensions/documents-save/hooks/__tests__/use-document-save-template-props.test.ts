import { __useActiveDocumentActions as useActiveDocumentActions } from '@elementor/editor-documents';
import { renderHook } from '@testing-library/react';

import useDocumentSaveTemplateProps from '../use-document-save-template-props';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocumentActions: jest.fn(),
} ) );

const documentActions = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
	copyAndShare: jest.fn(),
};

describe( '@elementor/editor-app-bar - useDocumentSaveTemplateProps', () => {
	it( 'should open the "save as template" modal', () => {
		// Arrange.
		jest.mocked( useActiveDocumentActions ).mockReturnValue( documentActions );

		// Act.
		const { result } = renderHook( () => useDocumentSaveTemplateProps() );
		result.current.onClick?.();

		// Assert.
		expect( documentActions.saveTemplate ).toBeCalledTimes( 1 );
	} );
} );
