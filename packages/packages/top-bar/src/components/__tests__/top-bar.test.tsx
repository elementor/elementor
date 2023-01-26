import { render } from '@testing-library/react';
import TopBar from '../top-bar';
import { createStore, getStore, StoreProvider, Store, deleteStore } from '@elementor/store';

describe( '@elementor/top-bar TopBar component', () => {
	let store: Store;

	beforeEach( () => {
		createStore();

		store = getStore() as Store;
	} );

	afterEach( () => {
		deleteStore();
	} );

	it( 'should render elementor logo', () => {
		const { queryByText } = render(
			<StoreProvider store={ store }>
				<TopBar />
			</StoreProvider>
		);

		const logoTitle = queryByText( 'Elementor Logo' );

		expect( logoTitle ).toBeTruthy();
	} );
} );
