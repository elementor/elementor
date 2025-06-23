import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { __privateIsRouteActive as isRouteActive } from '@elementor/editor-v1-adapters';
import { act, screen } from '@testing-library/react';

import PortalledPrimaryAction from '../portalled-primary-action';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateIsRouteActive: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
	__useActiveDocumentActions: jest.fn(),
} ) );

describe( '@elementor/editor-app-bar - Portalled primary action', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockReturnValue( createMockDocument() );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save: jest.fn(),
			saveDraft: jest.fn(),
			saveTemplate: jest.fn(),
			copyAndShare: jest.fn(),
		} );
	} );

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should render the button when opening the site-settings panel', () => {
		// Arrange.
		createRootElement();

		renderWithTheme( <PortalledPrimaryAction /> );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

		// Act.
		jest.mocked( isRouteActive ).mockImplementation( () => true );

		navigateTo( 'panel/global/menu' );

		// Assert.
		expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
	} );

	it( 'should not render the button when opening another panel', () => {
		// Arrange.
		createRootElement();

		jest.mocked( isRouteActive ).mockImplementation( () => false );

		renderWithTheme( <PortalledPrimaryAction /> );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

		// Act.
		jest.mocked( isRouteActive ).mockImplementation( () => true );

		navigateTo( 'panel/history' );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'should not render the button when the root element does not exist', () => {
		// Arrange.
		createRootElement( 'some-fake-id' );

		jest.mocked( isRouteActive ).mockImplementation( () => true );

		renderWithTheme( <PortalledPrimaryAction /> );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );

function createRootElement( id = 'elementor-panel-inner' ) {
	const el = document.createElement( 'div' );

	el.setAttribute( 'id', id );

	document.body.appendChild( el );
}

function navigateTo( route: string ) {
	act( () => {
		window.dispatchEvent(
			new CustomEvent( 'elementor/routes/open', {
				detail: { route },
			} )
		);
	} );
}
