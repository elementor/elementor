import { createMockDocument } from 'test-utils';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-v1-adapters' );

describe( '@elementor/editor-app-bar - useDocumentPreviewProps', () => {
	it( 'should open the document preview', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument() );

		const command = 'editor/documents/preview';
		const args = { id: 1, force: true };

		// Act.
		const { result } = renderHook( () => useActionProps() );
		result.current.onClick();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( command, args );
	} );

	it( 'should not run the command when there is no document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => useActionProps() );
		result.current.onClick();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 0 );
	} );
} );
