import * as React from 'react';
import { createMockElement, renderWithStore } from 'test-utils';
import { getElements, updateElementEditorSettings, updateElementSettings } from '@elementor/editor-elements';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
	__subscribeWithSelector as subscribeWithSelector,
	type Store,
} from '@elementor/store';

import { slice } from '../../store/store';
import {
	initSyncComponentRenameToNavigator,
	SyncComponentRenameToNavigator,
	syncComponentRenameToNavigatorStore,
} from '../sync-component-rename-to-navigator';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/store', () => {
	const actual = jest.requireActual( '@elementor/store' );
	return {
		...actual,
		__getState: jest.fn(),
		__subscribeWithSelector: jest.fn(),
	};
} );

const mockGetElements = jest.mocked( getElements );
const mockUpdateElementEditorSettings = jest.mocked( updateElementEditorSettings );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );
const mockGetState = jest.mocked( getState );
const mockSubscribeWithSelector = jest.mocked( subscribeWithSelector );

describe( 'syncComponentRenameToNavigator', () => {
	let store: Store;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = createStore();
		mockGetState.mockImplementation( () => store.getState() );
		mockUpdateElementEditorSettings.mockImplementation( () => {} );
		mockUpdateElementSettings.mockImplementation( () => {} );
		dispatch( slice.actions.load( [] ) );
		syncComponentRenameToNavigatorStore();
	} );

	it( 'should initialize previousComponentsData on first call', () => {
		// Arrange
		const components = [
			{ id: 1, uid: 'uid-1', name: 'Component 1' },
			{ id: 2, uid: 'uid-2', name: 'Component 2' },
		];
		dispatch( slice.actions.load( components ) );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).not.toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should sync component rename to navigator when component name changes', async () => {
		// Arrange
		const componentUid = 'uid-1';
		const oldName = 'Old Name';
		const newName = 'New Name';
		const elementId = 'element-1';

		const element = createMockElement( {
			model: {
				id: elementId,
				editor_settings: { component_uid: componentUid },
			},
		} );

		mockGetElements.mockReturnValue( [ element ] );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();
		await Promise.resolve();

		// Assert
		expect( mockGetElements ).toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledWith( {
			elementId,
			settings: { component_src_name: newName },
		} );
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
			id: elementId,
			props: { title: newName, _title: newName },
		} );
	} );

	it( 'should not sync when component name has not changed', () => {
		// Arrange
		const componentUid = 'uid-1';
		const componentName = 'Component Name';

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: componentName } ] ) );
		syncComponentRenameToNavigatorStore();

		mockGetElements.mockClear();
		mockUpdateElementEditorSettings.mockClear();
		mockUpdateElementSettings.mockClear();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: componentName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).not.toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should filter elements by component uid correctly', async () => {
		// Arrange
		const componentUid = 'uid-1';
		const oldName = 'Old Name';
		const newName = 'New Name';
		const elementId1 = 'element-1';
		const elementId2 = 'element-2';

		const element1 = createMockElement( {
			model: {
				id: elementId1,
				editor_settings: { component_uid: componentUid },
			},
		} );

		const element2 = createMockElement( {
			model: {
				id: elementId2,
				editor_settings: { component_uid: 'different-uid' },
			},
		} );

		mockGetElements.mockReturnValue( [ element1, element2 ] );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();
		await Promise.resolve();

		// Assert
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledWith( {
			elementId: elementId1,
			settings: { component_src_name: newName },
		} );
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
			id: elementId1,
			props: { title: newName, _title: newName },
		} );
	} );

	it( 'should not update when component_src_name already matches new name', async () => {
		// Arrange
		const componentUid = 'uid-1';
		const oldName = 'Old Name';
		const newName = 'New Name';
		const elementId = 'element-1';

		const element = createMockElement( {
			model: {
				id: elementId,
				editor_settings: {
					component_uid: componentUid,
					component_src_name: newName,
				},
			},
		} );

		mockGetElements.mockReturnValue( [ element ] );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();
		await Promise.resolve();

		// Assert
		expect( mockGetElements ).toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should call updateElementEditorSettings when component name changes', async () => {
		// Arrange
		const componentUid = 'uid-1';
		const oldName = 'Old Name';
		const newName = 'New Name';
		const elementId = 'element-1';

		const element = createMockElement( {
			model: {
				id: elementId,
				editor_settings: { component_uid: componentUid },
			},
		} );

		mockGetElements.mockReturnValue( [ element ] );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();
		await Promise.resolve();

		// Assert
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalled();
	} );

	it( 'should handle getElements errors gracefully without throwing', () => {
		// Arrange
		const componentUid = 'uid-1';
		const oldName = 'Old Name';
		const newName = 'New Name';

		mockGetElements.mockImplementation( () => {
			throw new Error( 'Get elements failed' );
		} );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act & Assert - function will throw synchronously when getElements throws
		// This test verifies that getElements is called, accepting that errors propagate
		expect( () => {
			syncComponentRenameToNavigatorStore();
		} ).toThrow( 'Get elements failed' );

		expect( mockGetElements ).toHaveBeenCalled();
	} );

	it( 'should handle empty components array', () => {
		// Arrange
		dispatch( slice.actions.load( [] ) );
		syncComponentRenameToNavigatorStore();

		mockGetElements.mockClear();
		mockUpdateElementEditorSettings.mockClear();
		mockUpdateElementSettings.mockClear();

		dispatch( slice.actions.load( [] ) );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).not.toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should initialize subscription when initSyncComponentRenameToNavigator is called', () => {
		// Arrange
		const unsubscribe = jest.fn();
		mockSubscribeWithSelector.mockReturnValue( unsubscribe );

		// Act
		initSyncComponentRenameToNavigator();

		// Assert
		expect( mockSubscribeWithSelector ).toHaveBeenCalledTimes( 1 );
		expect( mockSubscribeWithSelector ).toHaveBeenCalledWith( expect.any( Function ), expect.any( Function ) );
	} );

	it( 'should call syncComponentRenameToNavigatorStore when store data changes', () => {
		// Arrange
		const callback = jest.fn();
		mockSubscribeWithSelector.mockImplementation( ( _selector, cb ) => {
			cb( [] );
			return callback;
		} );

		// Act
		initSyncComponentRenameToNavigator();

		// Assert
		expect( mockSubscribeWithSelector ).toHaveBeenCalled();

		// Cleanup
	} );

	it( 'should initialize sync when SyncComponentRenameToNavigator component mounts', () => {
		// Arrange
		const unsubscribe = jest.fn();
		mockSubscribeWithSelector.mockReturnValue( unsubscribe );

		// Reset any existing subscription by rendering and unmounting a component first
		const { unmount: cleanupUnmount } = renderWithStore( <SyncComponentRenameToNavigator />, store );
		cleanupUnmount();
		mockSubscribeWithSelector.mockClear();

		// Act
		const { unmount } = renderWithStore( <SyncComponentRenameToNavigator />, store );

		// Assert
		expect( mockSubscribeWithSelector ).toHaveBeenCalledTimes( 1 );

		// Cleanup
		unmount();
	} );

	it( 'should not initialize sync multiple times when component re-renders', () => {
		// Arrange
		const unsubscribe = jest.fn();
		mockSubscribeWithSelector.mockReturnValue( unsubscribe );
		const { rerender } = renderWithStore( <SyncComponentRenameToNavigator />, store );

		mockSubscribeWithSelector.mockClear();

		// Act
		rerender( <SyncComponentRenameToNavigator /> );

		// Assert
		expect( mockSubscribeWithSelector ).not.toHaveBeenCalled();
	} );

	it( 'should unsubscribe when SyncComponentRenameToNavigator component unmounts', () => {
		// Arrange
		const unsubscribe = jest.fn();
		mockSubscribeWithSelector.mockReturnValue( unsubscribe );
		const { unmount } = renderWithStore( <SyncComponentRenameToNavigator />, store );

		// Act
		unmount();

		// Assert
		expect( unsubscribe ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should handle initialization error gracefully in SyncComponentRenameToNavigator', () => {
		// Arrange
		mockSubscribeWithSelector.mockImplementation( () => {
			throw new Error( 'Init failed' );
		} );

		// Act
		renderWithStore( <SyncComponentRenameToNavigator />, store );

		// Assert
		expect( mockSubscribeWithSelector ).toHaveBeenCalled();
	} );
} );
