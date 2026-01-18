import { notify } from '@elementor/editor-notifications';
import { __createStore, __dispatch, __getState as getState, __registerSlice } from '@elementor/store';

import { slice } from '../../store/store';
import { handleRenamedComponents } from '../handle-renamed-components';

jest.mock( '@elementor/editor-notifications' );

const mockNotify = jest.mocked( notify );

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
		expect( mockNotify ).not.toHaveBeenCalled();
	} );

	it( 'should clean only successful renames when some fail', () => {
		// Arrange
		__dispatch( slice.actions.add( { id: 100, uid: 'uid-1', name: 'Old Name 1' } ) );
		__dispatch( slice.actions.add( { id: 200, uid: 'uid-2', name: 'Old Name 2' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-1', name: 'New Name 1' } ) );
		__dispatch( slice.actions.rename( { componentUid: 'uid-2', name: 'New Name 2' } ) );

		const result = {
			successIds: [ 100 ],
			failed: [ { id: 200, error: 'Failed to update title' } ],
		};

		// Act
		handleRenamedComponents( result );

		// Assert
		expect( getState().components.updatedComponentNames ).toEqual( { 200: 'New Name 2' } );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to rename components: 200',
			id: 'failed-renamed-components-notification',
		} );
	} );

	it( 'should not clean any names when all renames fail', () => {
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
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to rename components: 100',
			id: 'failed-renamed-components-notification',
		} );
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
		expect( mockNotify ).not.toHaveBeenCalled();
	} );
} );
