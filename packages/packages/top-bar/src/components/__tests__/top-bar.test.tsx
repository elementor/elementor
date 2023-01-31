import { render } from '@testing-library/react';
import TopBar from '../top-bar';
import { createStore, StoreProvider, Store, deleteStore } from '@elementor/store';

describe( '@elementor/top-bar TopBar component', () => {
	let store: Store;

	beforeEach( () => {
		store = createStore();
	} );

	afterEach( () => {
		deleteStore();
	} );

	it( 'should render elementor logo', () => {
		// Act.
		const { queryByText } = render(
			<StoreProvider store={ store }>
				<TopBar />
			</StoreProvider>
		);

		// Assert.
		const logoTitle = queryByText( 'Elementor Logo' );

		expect( logoTitle ).toBeTruthy();
	} );
} );
