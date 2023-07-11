import { renderHook } from '@testing-library/react-hooks';
import useDocumentPreviewProps from '../use-document-preview-props';
import { runCommand } from '@elementor/v1-adapters';
import { createMockDocument } from 'test-utils';
import { useActiveDocument } from '@elementor/documents';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
} ) );

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
} ) );

describe( '@elementor/documents-ui - useDocumentPreviewProps', () => {
	it( 'should open the document preview', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument() );

		const command = 'editor/documents/preview';
		const args = { id: 1, force: true };

		// Act.
		const { result } = renderHook( () => useDocumentPreviewProps() );
		result.current.onClick();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( command, args );
	} );

	it( 'should not run the command when there is no document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => useDocumentPreviewProps() );
		result.current.onClick();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 0 );
	} );
} );
