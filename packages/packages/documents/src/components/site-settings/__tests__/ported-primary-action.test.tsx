import { render, screen } from '@testing-library/react';
import { isRouteActive } from '@elementor/v1-adapters';
import { useActiveDocument } from '../../../hooks';
import PortedPrimaryAction from '../ported-primary-action';
import { createMockDocument } from '../../../__tests__/test-utils';

jest.mock( '@elementor/v1-adapters', () => ( {
	...jest.requireActual( '@elementor/v1-adapters' ),
	isRouteActive: jest.fn(),
} ) );

jest.mock( '../../../hooks', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn( () => ( {
		save: jest.fn(),
	} ) ),
} ) );

describe( '@elementor/documents - Site settings ported primary action', () => {
	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockImplementation( () => createMockDocument() );
	} );

	afterEach( () => {
		jest.clearAllMocks();

		document.body.innerHTML = '';
	} );

	it( 'should render the button when navigating to site-settings route', () => {
		// Arrange.
		createRootElement();

		render( <PortedPrimaryAction /> );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

		// Act.
		jest.mocked( isRouteActive ).mockImplementation( () => true );

		navigateTo( 'panel/global/menu' );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).toBeInTheDocument();
	} );

	it( 'should not render button when navigation to another route', () => {
		// Arrange.
		createRootElement();

		jest.mocked( isRouteActive ).mockImplementation( () => false );

		render( <PortedPrimaryAction /> );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

		// Act.
		jest.mocked( isRouteActive ).mockImplementation( () => true );

		navigateTo( 'panel/history' );

		// Assert.
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'should not render button when root element not exists', () => {
		// Arrange.
		createRootElement( 'some-fake-id' );

		jest.mocked( isRouteActive ).mockImplementation( () => true );

		render( <PortedPrimaryAction /> );

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
	window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
		detail: { route },
	} ) );
}
