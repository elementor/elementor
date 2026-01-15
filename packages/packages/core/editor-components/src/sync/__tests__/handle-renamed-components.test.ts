import { __createStore, __dispatch, __getState as getState, __registerSlice } from '@elementor/store';

import { slice } from '../../store/store';
import { handleRenamedComponents } from '../handle-renamed-components';

describe( 'handleRenamedComponents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();
	} );

	it( 'should clean updated component names when all renames succeed', () => {
		// Arrange
		__dispatch( slice.actions.add( { id: 100, uid: 'uid-1', name: 'Old Name 1' } ) );
		__dispatch( slice.actions.add( { id: 200, uid: 'uid-2', name: 'Old Name 2' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-1', name: 'New Name 1' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-2', name: 'New Name 2' } ) );

		expect( Object.keys( getState().components.updatedComponentNames ) ).toHaveLength( 2 );

		const result = {
			successIds: [ 100, 200 ],
			failed: [],
		};

		// Act
		handleRenamedComponents( result );

		// Assert
		expect( getState().components.updatedComponentNames ).toEqual( {} );
	} );

	it( 'should not clean updated component names when some renames fail', () => {
		// Arrange
		__dispatch( slice.actions.add( { id: 100, uid: 'uid-1', name: 'Old Name 1' } ) );
		__dispatch( slice.actions.add( { id: 200, uid: 'uid-2', name: 'Old Name 2' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-1', name: 'New Name 1' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-2', name: 'New Name 2' } ) );

		const initialNames = { ...getState().components.updatedComponentNames };

		const result = {
			successIds: [ 100 ],
			failed: [ { id: 200, error: 'Failed to update title' } ],
		};

		// Act
		handleRenamedComponents( result );

		// Assert
		expect( getState().components.updatedComponentNames ).toEqual( initialNames );
	} );

	it( 'should not clean updated component names when all renames fail', () => {
		// Arrange
		__dispatch( slice.actions.add( { id: 100, uid: 'uid-1', name: 'Old Name' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-1', name: 'New Name' } ) );

		const initialNames = { ...getState().components.updatedComponentNames };

		const result = {
			successIds: [],
			failed: [ { id: 100, error: 'Component not found' } ],
		};

		// Act
		handleRenamedComponents( result );

		// Assert
		expect( getState().components.updatedComponentNames ).toEqual( initialNames );
	} );

	it( 'should handle empty result when no renames were requested', () => {
		// Arrange
		const result = {
			successIds: [],
			failed: [],
		};

		// Act
		handleRenamedComponents( result );

		// Assert
		expect( getState().components.updatedComponentNames ).toEqual( {} );
	} );
} );
