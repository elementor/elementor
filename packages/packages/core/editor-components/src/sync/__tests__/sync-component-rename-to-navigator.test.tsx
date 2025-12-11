import * as React from 'react';
import { createMockElement, renderWithStore } from 'test-utils';
import { getElements, updateElementEditorSettings } from '@elementor/editor-elements';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
	__subscribeWithSelector as subscribeWithSelector,
	type Store,
} from '@elementor/store';

import { slice, SLICE_NAME } from '../../store/store';
import {
	ComponentRenameFailedToSyncToNavigatorStoreError,
	ComponentRenameSyncStoreNotReadyError,
} from '../../utils/errors';
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
const mockGetState = jest.mocked( getState );
const mockSubscribeWithSelector = jest.mocked( subscribeWithSelector );

describe( 'syncComponentRenameToNavigator', () => {
	let store: Store;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = createStore();
		mockGetState.mockImplementation( () => store.getState() );
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
	} );

	it( 'should sync component rename to navigator when component name changes', () => {
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

		// Assert
		expect( mockGetElements ).toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledWith( {
			elementId,
			settings: { title: newName },
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

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: componentName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).not.toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
	} );

	it( 'should handle multiple components with different names', () => {
		// Arrange
		const componentUid1 = 'uid-1';
		const componentUid2 = 'uid-2';
		const oldName1 = 'Old Name 1';
		const oldName2 = 'Old Name 2';
		const newName1 = 'New Name 1';
		const newName2 = 'New Name 2';
		const elementId1 = 'element-1';
		const elementId2 = 'element-2';

		const element1 = createMockElement( {
			model: {
				id: elementId1,
				editor_settings: { component_uid: componentUid1 },
			},
		} );

		const element2 = createMockElement( {
			model: {
				id: elementId2,
				editor_settings: { component_uid: componentUid2 },
			},
		} );

		mockGetElements.mockReturnValue( [ element1, element2 ] );

		dispatch(
			slice.actions.load( [
				{ id: 1, uid: componentUid1, name: oldName1 },
				{ id: 2, uid: componentUid2, name: oldName2 },
			] )
		);
		syncComponentRenameToNavigatorStore();

		dispatch(
			slice.actions.load( [
				{ id: 1, uid: componentUid1, name: newName1 },
				{ id: 2, uid: componentUid2, name: newName2 },
			] )
		);

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledTimes( 2 );
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledWith( {
			elementId: elementId1,
			settings: { title: newName1 },
		} );
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledWith( {
			elementId: elementId2,
			settings: { title: newName2 },
		} );
	} );

	it( 'should filter elements by component uid correctly', () => {
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

		// Assert
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateElementEditorSettings ).toHaveBeenCalledWith( {
			elementId: elementId1,
			settings: { title: newName },
		} );
	} );

	it( 'should handle elements without editor_settings', () => {
		// Arrange
		const componentUid = 'uid-1';
		const oldName = 'Old Name';
		const newName = 'New Name';

		const element = createMockElement( {
			model: {
				id: 'element-1',
			},
		} );

		mockGetElements.mockReturnValue( [ element ] );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
	} );

	it( 'should handle updateElementEditorSettings errors gracefully without throwing', () => {
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
		mockUpdateElementEditorSettings.mockImplementation( () => {
			throw new Error( 'Update failed' );
		} );

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: oldName } ] ) );
		syncComponentRenameToNavigatorStore();

		dispatch( slice.actions.load( [ { id: 1, uid: componentUid, name: newName } ] ) );

		// Act
		syncComponentRenameToNavigatorStore();

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

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).toHaveBeenCalled();
	} );

	it( 'should throw ComponentRenameFailedToSyncToNavigatorStoreError when getState fails', () => {
		// Arrange
		mockGetState.mockImplementation( () => {
			throw new Error( 'Get state failed' );
		} );

		// Act & Assert
		expect( () => syncComponentRenameToNavigatorStore() ).toThrow(
			ComponentRenameFailedToSyncToNavigatorStoreError
		);
	} );

	it( 'should handle empty components array', () => {
		// Arrange
		dispatch( slice.actions.load( [] ) );
		syncComponentRenameToNavigatorStore();

		mockGetElements.mockClear();
		mockUpdateElementEditorSettings.mockClear();

		dispatch( slice.actions.load( [] ) );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).not.toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
	} );

	it( 'should handle undefined store data', () => {
		// Arrange
		mockGetState.mockReturnValue( {
			[ SLICE_NAME ]: undefined,
		} as never );

		// Act
		syncComponentRenameToNavigatorStore();

		// Assert
		expect( mockGetElements ).not.toHaveBeenCalled();
		expect( mockUpdateElementEditorSettings ).not.toHaveBeenCalled();
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

	it( 'should throw ComponentRenameSyncStoreNotReadyError when subscribeWithSelector fails', () => {
		// Arrange
		mockSubscribeWithSelector.mockImplementation( () => {
			throw new Error( 'Subscribe failed' );
		} );

		// Act & Assert
		expect( () => initSyncComponentRenameToNavigator() ).toThrow( ComponentRenameSyncStoreNotReadyError );
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
