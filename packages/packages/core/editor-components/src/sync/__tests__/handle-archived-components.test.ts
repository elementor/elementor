import { notify } from '@elementor/editor-notifications';

import { handleArchivedComponents } from '../handle-archived-components';

jest.mock( '@elementor/editor-notifications' );

const mockNotify = jest.mocked( notify );

describe( 'handleArchivedComponents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not notify when all components archived successfully', () => {
		// Arrange
		const result = {
			successIds: [ 100, 200, 300 ],
			failed: [],
		};

		// Act
		handleArchivedComponents( result );

		// Assert
		expect( mockNotify ).not.toHaveBeenCalled();
	} );

	it( 'should notify error when some components fail to archive', () => {
		// Arrange
		const result = {
			successIds: [ 100 ],
			failed: [
				{ id: 200, error: 'Component not found' },
				{ id: 300, error: 'Failed to archive' },
			],
		};

		// Act
		handleArchivedComponents( result );

		// Assert
		expect( mockNotify ).toHaveBeenCalledTimes( 1 );
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to archive components: 200, 300',
			id: 'failed-archived-components-notification',
		} );
	} );

	it( 'should notify error when all components fail to archive', () => {
		// Arrange
		const result = {
			successIds: [],
			failed: [
				{ id: 100, error: 'Error 1' },
				{ id: 200, error: 'Error 2' },
			],
		};

		// Act
		handleArchivedComponents( result );

		// Assert
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to archive components: 100, 200',
			id: 'failed-archived-components-notification',
		} );
	} );

	it( 'should handle single failed component', () => {
		// Arrange
		const result = {
			successIds: [],
			failed: [ { id: 100, error: 'Component not found' } ],
		};

		// Act
		handleArchivedComponents( result );

		// Assert
		expect( mockNotify ).toHaveBeenCalledWith( {
			type: 'error',
			message: 'Failed to archive components: 100',
			id: 'failed-archived-components-notification',
		} );
	} );

	it( 'should not notify when both arrays are empty', () => {
		// Arrange
		const result = {
			successIds: [],
			failed: [],
		};

		// Act
		handleArchivedComponents( result );

		// Assert
		expect( mockNotify ).not.toHaveBeenCalled();
	} );
} );
