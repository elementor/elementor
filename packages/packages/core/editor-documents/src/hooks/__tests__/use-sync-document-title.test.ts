import { createMockDocument } from 'test-utils';
import { renderHook } from '@testing-library/react';

import useActiveDocument from '../use-active-document';
import useHostDocument from '../use-host-document';
import useSyncDocumentTitle from '../use-sync-document-title';

jest.mock( '../use-active-document' );
jest.mock( '../use-host-document' );

describe( 'useSyncDocumentTitle', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should set the document title to be the active document', () => {
		// Arrange - set the initial document.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				type: {
					value: 'page',
					label: 'Page',
				},
				title: 'Initial Document',
			} )
		);

		// Act.
		const { rerender } = renderHook( useSyncDocumentTitle );

		// Assert.
		expect( window.document.title ).toBe( 'Edit "Initial Document" with Elementor' );

		// Arrange - set the new document.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				type: {
					value: 'page',
					label: 'Page',
				},
				title: 'New Document',
			} )
		);

		// Act.
		rerender();

		// Assert.
		expect( window.document.title ).toBe( 'Edit "New Document" with Elementor' );
	} );

	it( 'should use the host document title when the active document is a kit', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				type: {
					value: 'kit',
					label: 'Kit',
				},
				title: 'My Kit',
			} )
		);

		jest.mocked( useHostDocument ).mockReturnValue(
			createMockDocument( {
				type: {
					value: 'page',
					label: 'Page',
				},
				title: 'My Page',
			} )
		);

		window.document.title = 'Old title';

		// Act.
		renderHook( useSyncDocumentTitle );

		// Assert.
		expect( window.document.title ).toBe( 'Edit "My Page" with Elementor' );
	} );

	it( 'should not modify the title when there is no active document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );

		window.document.title = 'Old title';

		// Act.
		renderHook( useSyncDocumentTitle );

		// Assert.
		expect( window.document.title ).toBe( 'Old title' );
	} );

	it( 'should allow empty string as title', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				title: '',
			} )
		);

		// Act.
		renderHook( useSyncDocumentTitle );

		// Assert.
		expect( window.document.title ).toBe( 'Edit "" with Elementor' );
	} );
} );
