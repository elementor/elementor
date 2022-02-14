import { render } from '@testing-library/react';
import { Navigator } from 'elementor-regions/navigator/components';
import { configureStore } from '@reduxjs/toolkit';

require( 'elementor/tests/jest/setup/editor' );

const preview = elementor.getPreviewContainer(),
	mockStore = {
	'document/elements': {
		document: {
			...preview,
			sortable: false,
		},
	},
	'document/elements/selection': [],
	'navigator/folding': {},
};

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( selector ) => selector( mockStore ) ),
} ) );

describe( '<Navigator />', () => {
	beforeAll( () => {
		global.elementor.getContainer = jest.fn(
			( containerId ) => mockStore[ 'document/elements' ][ containerId ]
		);

		global.$e.store = {};
		global.$e.store.getReduxStore = () => {
			return configureStore( {
				reducer: () => {},
			} );
		};
	} );

	it( 'Should render navigator header', () => {
		const component = render( <Navigator /> );

		expect(
			component.queryByTestId( 'navigator-header' )
		).toBeInTheDocument();
	} );

	it( 'Should render navigator footer', () => {
		const component = render( <Navigator /> );

		expect(
			component.queryByTestId( 'navigator-footer' )
		).toBeInTheDocument();
	} );

	it( 'Should render document item when has children', () => {
		mockStore[ 'document/elements' ][ 'test-section-1' ] = $e.run( 'document/elements/create', {
			container: preview,
			model: {
				id: 'test-section-1',
				elType: 'section',
			},
			sortable: false,
		} );

		const component = render( <Navigator /> );

		expect(
			component.queryByTestId( 'element-item' )
		).toBeInTheDocument();

		// Cleanup
		delete mockStore[ 'document/elements' ][ 'test-section-1' ];
	} );

	it( 'Should not render document item when has no children', () => {
		const component = render( <Navigator /> );

		expect(
			component.queryByTestId( 'element-item' )
		).not.toBeInTheDocument();
	} );

	it( 'Should render empty state when document item has no children', () => {
		const component = render( <Navigator /> );

		expect(
			component.queryByText( 'Easy Navigation is Here!' )
		).toBeInTheDocument();
	} );
} );
