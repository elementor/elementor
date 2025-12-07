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
		await updateArchivedComponentBeforeSave();

		// Assert
		expect( mockUpdateArchivedComponents ).not.toHaveBeenCalled();
		expect( mockNotify ).not.toHaveBeenCalled();
	} );

	it( 'should notify success when all components are archived successfully', async () => {
		// Arrange
		const archivedComponent1 = { id: 100, uid: 'uid-1', name: 'Component 1' };
		const archivedComponent2 = { id: 200, uid: 'uid-2', name: 'Component 2' };

		__dispatch( slice.actions.add( archivedComponent1 ) );
		__dispatch( slice.actions.add( archivedComponent2 ) );
		__dispatch( slice.actions.archive( archivedComponent1.id ) );
		__dispatch( slice.actions.archive( archivedComponent2.id ) );

		mockUpdateArchivedComponents.mockResolvedValue( {
			failedIds: [],
			successIds: [ 100, 200 ],
			success: true,
		} );

		// Act
		await updateArchivedComponentBeforeSave();

		// Assert
		expect( mockUpdateArchivedComponents ).toHaveBeenCalledWith( [ 100, 200 ] );
		expect( mockNotify ).toHaveBeenCalledTimes( 1 );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'success',
			message: 'Successfully archived components: 100, 200',
			id: 'success-archived-components-notification',
		} );
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
		await updateArchivedComponentBeforeSave();

		// Assert
		expect( mockUpdateArchivedComponents ).toHaveBeenCalledWith( [ 100, 200 ] );
		expect( mockNotify ).toHaveBeenCalledTimes( 1 );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to archive components: 100, 200',
			id: 'failed-archived-components-notification',
		} );
	} );

	it( 'should notify both success and error when some components succeed and some fail', async () => {
		// Arrange
		const archivedComponent1 = { id: 100, uid: 'uid-1', name: 'Component 1' };
		const archivedComponent2 = { id: 200, uid: 'uid-2', name: 'Component 2' };
		const archivedComponent3 = { id: 300, uid: 'uid-3', name: 'Component 3' };

		__dispatch( slice.actions.add( archivedComponent1 ) );
		__dispatch( slice.actions.add( archivedComponent2 ) );
		__dispatch( slice.actions.add( archivedComponent3 ) );
		__dispatch( slice.actions.archive( archivedComponent1.id ) );
		__dispatch( slice.actions.archive( archivedComponent2.id ) );
		__dispatch( slice.actions.archive( archivedComponent3.id ) );

		mockUpdateArchivedComponents.mockResolvedValue( {
			failedIds: [ 200 ],
			successIds: [ 100, 300 ],
			success: true,
		} );

		// Act
		await updateArchivedComponentBeforeSave();

		// Assert
		expect( mockUpdateArchivedComponents ).toHaveBeenCalledWith( [ 100, 200, 300 ] );
		expect( mockNotify ).toHaveBeenCalledTimes( 2 );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to archive components: 200',
			id: 'failed-archived-components-notification',
		} );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'success',
			message: 'Successfully archived components: 100, 300',
			id: 'success-archived-components-notification',
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
		await expect( updateArchivedComponentBeforeSave() ).rejects.toThrow(
			'Failed to update archived components: Error: Network error'
		);
		expect( mockNotify ).not.toHaveBeenCalled();
	} );
} );
