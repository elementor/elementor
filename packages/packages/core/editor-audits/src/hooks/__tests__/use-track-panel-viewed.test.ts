import * as React from 'react';
import { useCurrentUser, useSuppressedMessage } from '@elementor/editor-current-user';
import { getHostDocumentId } from '@elementor/editor-elements';
import {
	__createStore,
	__deleteStore,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { renderHook } from '@testing-library/react';

import { FIRST_OPEN_MESSAGE_KEY } from '../../constants';
import { slice } from '../../store/slice';
import { getPersistedReport } from '../../utils/report-storage';
import { trackPanelViewed } from '../../utils/tracking';
import { useTrackPanelViewed } from '../use-track-panel-viewed';

jest.mock( '@elementor/editor-current-user' );
jest.mock( '@elementor/editor-elements', () => ( {
	getHostDocumentId: jest.fn(),
} ) );
jest.mock( '../../utils/report-storage' );
jest.mock( '../../utils/tracking' );

const DOCUMENT_ID = 1;

function renderTrackPanelViewed() {
	const store = __getStore();

	if ( ! store ) {
		throw new Error( 'Store is not initialized' );
	}

	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		React.createElement( StoreProvider, { store, children } );

	return renderHook( () => useTrackPanelViewed(), { wrapper } );
}

describe( 'useTrackPanelViewed', () => {
	const suppressMessage = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getHostDocumentId ).mockReturnValue( DOCUMENT_ID );
		jest.mocked( getPersistedReport ).mockReturnValue( null );
		jest.mocked( useCurrentUser ).mockReturnValue( { data: { suppressedMessages: [] } } as never );
		jest.mocked( useSuppressedMessage ).mockReturnValue( [ false, suppressMessage ] );
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'tracks the first open and suppresses the first-open message', () => {
		// Act.
		renderTrackPanelViewed();

		// Assert.
		expect( useSuppressedMessage ).toHaveBeenCalledWith( FIRST_OPEN_MESSAGE_KEY );
		expect( trackPanelViewed ).toHaveBeenCalledWith( { hasPriorReport: false, isFirstOpen: true } );
		expect( suppressMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports a subsequent open with a persisted prior report', () => {
		// Arrange.
		jest.mocked( useSuppressedMessage ).mockReturnValue( [ true, suppressMessage ] );
		jest.mocked( getPersistedReport ).mockReturnValue( {} as never );

		// Act.
		renderTrackPanelViewed();

		// Assert.
		expect( trackPanelViewed ).toHaveBeenCalledWith( { hasPriorReport: true, isFirstOpen: false } );
	} );

	it( 'waits for the current user to load before tracking', () => {
		// Arrange.
		jest.mocked( useCurrentUser ).mockReturnValue( { data: undefined } as never );

		// Act.
		renderTrackPanelViewed();

		// Assert.
		expect( trackPanelViewed ).not.toHaveBeenCalled();
		expect( suppressMessage ).not.toHaveBeenCalled();
	} );

	it( 'tracks only once across re-renders', () => {
		// Arrange.
		const { rerender } = renderTrackPanelViewed();

		// Act.
		rerender();

		// Assert.
		expect( trackPanelViewed ).toHaveBeenCalledTimes( 1 );
	} );
} );
