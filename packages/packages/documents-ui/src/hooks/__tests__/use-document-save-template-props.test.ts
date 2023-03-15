import { renderHook } from '@testing-library/react-hooks';
import { useActiveDocumentActions } from '@elementor/documents';
import useDocumentSaveTemplateProps from '../use-document-save-template-props';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocumentActions: jest.fn(),
} ) );

const documentActions = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
};

describe( '@elementor/documents-ui - useDocumentSaveTemplateProps', () => {
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
