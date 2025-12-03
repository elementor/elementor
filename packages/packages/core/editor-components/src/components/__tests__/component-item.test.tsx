import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { __createStore, __dispatch as dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { slice } from '../../store/store';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { SearchProvider } from '../components-tab/search-provider';

jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );
const mockComponents = [
	{ id: 1, name: 'Button Component', uid: 'f73880da-522c-442e-815a-b2c9849b7415' },
	{ id: 2, name: 'Text Component', uid: 'f73880da-522c-442e-815a-b2c9849b7416' },
	{ id: 3, name: 'Image Component', uid: 'f73880da-522c-442e-815a-b2c9849b7417' },
	{ id: 4, name: 'Test Component 1', uid: 'f73880da-522c-442e-815a-b2c9849b7418' },
	{ id: 5, name: 'Test Component 2', uid: 'f73880da-522c-442e-815a-b2c9849b7419' },
	{ id: 6, name: 'Valid Component', uid: 'f73880da-522c-442e-815a-b2c9849b7420' },
];

describe( 'ComponentItem', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		__registerSlice( slice );
		store = __createStore();
	} );
	it( 'should render', () => {
		dispatch( slice.actions.load( mockComponents ) );
		renderWithStore( <ComponentItem component={ mockComponents[ 0 ] } />, store );
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
	} );

	it( 'should remove component from list when archived', async () => {
		// Arrange
		act( () => {
			dispatch( slice.actions.load( mockComponents ) );
		} );

		// Act
		renderWithStore(
			<SearchProvider localStorageKey="test-search">
				<ComponentsList />
			</SearchProvider>,
			store
		);

		// Assert - component should be visible initially
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();

		// Act - archive Button Component
		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const archiveButton = await screen.findByText( 'Archive' );
		fireEvent.click( archiveButton );

		// Assert - archived component should be removed from list
		await waitFor( () => {
			expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
		} );
		expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Image Component' ) ).toBeInTheDocument();
	} );
} );
