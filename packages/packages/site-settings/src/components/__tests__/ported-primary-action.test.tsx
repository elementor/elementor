import { act, render, screen } from '@testing-library/react';
import { isRouteActive } from '@elementor/v1-adapters';
import { useActiveDocument } from '@elementor/documents';
import PortalledPrimaryAction from '../portalled-primary-action';
import { createMockDocument } from 'test-utils';

jest.mock( '@elementor/v1-adapters', () => ( {
	...jest.requireActual( '@elementor/v1-adapters' ),
	isRouteActive: jest.fn(),
} ) );

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn( () => ( {
		save: jest.fn(),
	} ) ),
} ) );

describe( '@elementor/site-settings - Portalled primary action', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockImplementation( () => createMockDocument() );
	} );

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should render the button when opening the site-settings panel', () => {
		// Arrange.
		createRootElement();

		render( <PortalledPrimaryAction /> );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

		// Act.
		jest.mocked( isRouteActive ).mockImplementation( () => true );

		navigateTo( 'panel/global/menu' );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).toBeInTheDocument();
	} );

	it( 'should not render the button when opening another panel', () => {
		// Arrange.
		createRootElement();

		jest.mocked( isRouteActive ).mockImplementation( () => false );

		render( <PortalledPrimaryAction /> );

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

		render( <PortalledPrimaryAction /> );

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
		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: { route },
		} ) );
	} );
}
