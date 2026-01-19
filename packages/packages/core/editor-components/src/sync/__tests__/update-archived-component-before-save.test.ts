// [Found-Testing-Reference===> REDUX,THEME,ERROR]
import { notify } from '@elementor/editor-notifications';
import { __createStore, __dispatch, __registerSlice } from '@elementor/store';

import { apiClient } from '../../api';
import { slice } from '../../store/store';
import { updateArchivedComponentBeforeSave } from '../update-archived-component-before-save';

jest.mock( '../../api' );
jest.mock( '@elementor/editor-notifications' );

const mockUpdateArchivedComponents = jest.mocked( apiClient.updateArchivedComponents );
const mockNotify = jest.mocked( notify );

describe( 'updateArchivedComponentBeforeSave', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();
	} );

	it( 'should return early when there are no archived components', async () => {
		// Act
		await updateArchivedComponentBeforeSave( 'publish' );

		// Assert
		expect( mockUpdateArchivedComponents ).not.toHaveBeenCalled();
		expect( mockNotify ).not.toHaveBeenCalled();
	} );

	it( 'should notify error when all components fail to archive', async () => {
		// Arrange
		const archivedComponent1 = { id: 100, uid: 'uid-1', name: 'Component 1' };
		const archivedComponent2 = { id: 200, uid: 'uid-2', name: 'Component 2' };

		__dispatch( slice.actions.add( archivedComponent1 ) );
		__dispatch( slice.actions.add( archivedComponent2 ) );
		__dispatch( slice.actions.archive( archivedComponent1.id ) );
		__dispatch( slice.actions.archive( archivedComponent2.id ) );

		mockUpdateArchivedComponents.mockResolvedValue( {
			failedIds: [ 100, 200 ],
			successIds: [],
			success: false,
		} );

		// Act
		await updateArchivedComponentBeforeSave( 'publish' );

		// Assert
		expect( mockUpdateArchivedComponents ).toHaveBeenCalledWith( [ 100, 200 ], 'publish' );
		expect( mockNotify ).toHaveBeenCalledTimes( 1 );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to archive components: 100, 200',
			id: 'failed-archived-components-notification',
		} );
	} );

	it( 'should throw error when API call fails', async () => {
		// Arrange
		const archivedComponent = { id: 100, uid: 'uid-1', name: 'Component 1' };

		__dispatch( slice.actions.add( archivedComponent ) );
		__dispatch( slice.actions.archive( archivedComponent.id ) );

		const apiError = new Error( 'Network error' );
		mockUpdateArchivedComponents.mockRejectedValue( apiError );

		// Act & Assert
		await expect( updateArchivedComponentBeforeSave( 'publish' ) ).rejects.toThrow(
			'Failed to update archived components: Error: Network error'
		);
		expect( mockNotify ).not.toHaveBeenCalled();
	} );
} );
