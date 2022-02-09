import { render, fireEvent } from '@testing-library/react';
import { Header } from 'elementor-regions/navigator/components';

const mockSetElementsFolding = jest.fn(),
	mockStore = {
		'navigator/folding': {},
	};

jest.mock( 'elementor-assets-js/editor/regions/navigator/hooks', () => ( {
	useElementFolding: () => [ mockStore[ 'navigator/folding' ], mockSetElementsFolding ],
} ) );

describe( '<Header />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'Should render navigator title', () => {
		const component = render( <Header /> );

		expect(
			component.queryByText( 'Navigator' )
		).toBeInTheDocument();
	} );

	it( 'Should close navigator on close click', () => {
		const handleClose = jest.fn(),
			component = render( <Header onClose={ handleClose } /> );

		fireEvent.click( component.getByRole( 'close' ) );

		expect( handleClose ).toBeCalledTimes( 1 );
	} );

	it( 'Should activate all items folding on toggle-all click when some elements are not selected', () => {
		mockStore[ 'navigator/folding' ][ 'test-element-1' ] = true;
		mockStore[ 'navigator/folding' ][ 'test-element-2' ] = false;

		const component = render( <Header /> );

		fireEvent.click( component.getByRole( 'toggle-all' ) );

		expect( mockSetElementsFolding ).toBeCalledTimes( 1 );
		expect( mockSetElementsFolding ).toBeCalledWith( true );

		// Cleanup
		delete mockStore[ 'navigator/folding' ][ 'test-element-1' ];
		delete mockStore[ 'navigator/folding' ][ 'test-element-2' ];
	} );

	it( 'Should activate all items folding on toggle-all click when all elements are not selected', () => {
		mockStore[ 'navigator/folding' ][ 'test-element-1' ] = false;
		mockStore[ 'navigator/folding' ][ 'test-element-2' ] = false;

		const component = render( <Header /> );

		fireEvent.click( component.getByRole( 'toggle-all' ) );

		expect( mockSetElementsFolding ).toBeCalledTimes( 1 );
		expect( mockSetElementsFolding ).toBeCalledWith( true );

		// Cleanup
		delete mockStore[ 'navigator/folding' ][ 'test-element-1' ];
		delete mockStore[ 'navigator/folding' ][ 'test-element-2' ];
	} );

	it( 'Should deactivate all items folding on toggle-all click when all elements selected', () => {
		mockStore[ 'navigator/folding' ][ 'test-element-1' ] = true;
		mockStore[ 'navigator/folding' ][ 'test-element-2' ] = true;

		const component = render( <Header /> );

		fireEvent.click( component.getByRole( 'toggle-all' ) );

		expect( mockSetElementsFolding ).toBeCalledTimes( 1 );
		expect( mockSetElementsFolding ).toBeCalledWith( false );

		// Cleanup
		delete mockStore[ 'navigator/folding' ][ 'test-element-1' ];
		delete mockStore[ 'navigator/folding' ][ 'test-element-2' ];
	} );
} );
