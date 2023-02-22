import { render } from '@testing-library/react';
import { useHostDocument, useActiveDocument } from '../../../hooks';
import CanvasDisplay from '../canvas-display';
import { createMockDocument } from 'test-utils';

jest.mock( '../../../hooks/use-active-document', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );

jest.mock( '../../../hooks/use-host-document', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );

describe( '@elementor/documents - Top bar Canvas display', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockImplementation( () =>
			createMockDocument( { id: 1, title: 'Active Document' } )
		);

		jest.mocked( useHostDocument ).mockImplementation( () =>
			createMockDocument( { id: 2, title: 'Host Document' } )
		);
	} );

	it( 'should show the title of the active document without its status when the document is published', () => {
		// Act.
		const { queryByText } = render( <CanvasDisplay /> );

		// Assert.
		expect( queryByText( 'Active Document' ) ).toBeTruthy();
		expect( queryByText( '(publish)' ) ).not.toBeTruthy();
	} );

	it( 'should show the title of the active document with its status when the document is not published', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () =>
			createMockDocument( {
				id: 1,
				title: 'Active Document',
				status: {
					value: 'draft',
					label: 'Draft',
				},
			} )
		);

		// Act.
		const { queryByText } = render( <CanvasDisplay /> );

		// Assert.
		expect( queryByText( 'Active Document' ) ).toBeTruthy();
		expect( queryByText( '(Draft)' ) ).toBeTruthy();
	} );

	it( 'should show the title of the host document when there is no active document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => null );

		// Act.
		const { queryByText } = render( <CanvasDisplay /> );

		// Assert.
		expect( queryByText( 'Host Document' ) ).toBeTruthy();
	} );

	it( 'should show the title of the host document when the active document is kit', () => {
		// Arrange.

		jest.mocked( useActiveDocument ).mockImplementation( () =>
			createMockDocument( {
				id: 1,
				title: 'Active Document',
				type: {
					value: 'kit',
					label: 'Kit',
				},
			} )
		);

		// Act.
		const { queryByText } = render( <CanvasDisplay /> );

		// Assert.
		expect( queryByText( 'Host Document' ) ).toBeTruthy();
	} );

	it( 'should show nothing if there are no documents', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockImplementation( () => null );
		jest.mocked( useHostDocument ).mockImplementation( () => null );

		// Act.
		const { queryByText } = render( <CanvasDisplay /> );

		// Assert.
		expect( queryByText( 'Host Document' ) ).not.toBeTruthy();
		expect( queryByText( 'Active Document' ) ).not.toBeTruthy();
	} );
} );
