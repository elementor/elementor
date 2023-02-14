import { renderHook } from '@testing-library/react-hooks';
import useDocumentPreviewProps from '../use-document-preview-props';
import { runCommand } from '@elementor/v1-adapters';
import { createMockDocument } from '../../__tests__/test-utils';

const mockDocument = createMockDocument();

jest.mock( '../use-active-document.ts', () => ( {
	__esModule: true,
	default: jest.fn( () => mockDocument ),
} ) );

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
} ) );

describe( '@elementor/documents - useDocumentPreviewProps', () => {
	it( 'should trigger the preview command', () => {
		// Arrange.
		const command = 'editor/documents/preview';
		const args = { id: 1 };

		// Act.
		const { result } = renderHook( () => useDocumentPreviewProps() );
		result.current.onClick();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( command, args );
	} );
} );
