import { type Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { __createStore, __dispatch, __registerSlice } from '@elementor/store';

import { apiClient } from '../../api';
import { slice } from '../../store/store';
import { getComponentDocumentData } from '../../utils/component-document-data';
import { getComponentIds } from '../../utils/get-component-ids';
import { syncComponentsBeforeSave } from '../sync-components-before-save';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-notifications' );
jest.mock( '../../api' );
jest.mock( '../../utils/component-document-data' );
jest.mock( '../../utils/get-component-ids' );

const mockSync = jest.mocked( apiClient.sync );
const mockGetComponentIds = jest.mocked( getComponentIds );
const mockGetComponentDocumentData = jest.mocked( getComponentDocumentData );

const COMPONENT_UID = 'component-123-abc';
const COMPONENT_ID = 1000;
const DRAFT_COMPONENT_ID = 2000;
const ARCHIVED_COMPONENT_ID = 3000;

describe( 'syncComponentsBeforeSave', () => {
	const emptyResponse = {
		created: { success: {}, failed: [] },
		published: { successIds: [], failed: [] },
		archived: { successIds: [], failed: [] },
		renamed: { successIds: [], failed: [] },
	};

	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();

		mockGetComponentIds.mockResolvedValue( [] );
		mockSync.mockResolvedValue( emptyResponse );
	} );

	describe( 'sync API payload', () => {
		it( 'should call sync API with empty arrays when no changes', async () => {
			// Act
			await syncComponentsBeforeSave( { elements: [], status: 'publish' } );

			// Assert
			expect( mockSync ).toHaveBeenCalledWith( {
				status: 'publish',
				created: [],
				published: [],
				archived: [],
				renamed: [],
			} );
		} );

		it( 'should include unpublished components in created array', async () => {
			// Arrange
			const mockElements: V1ElementData[] = [ { id: '1', elType: 'widget', widgetType: 'button' } ];

			__dispatch(
				slice.actions.addUnpublished( {
					uid: COMPONENT_UID,
					name: 'Test Component',
					elements: mockElements,
				} )
			);

			// Act
			await syncComponentsBeforeSave( { elements: [], status: 'publish' } );

			// Assert
			expect( mockSync ).toHaveBeenCalledWith(
				expect.objectContaining( {
					created: [
						{
							uid: COMPONENT_UID,
							title: 'Test Component',
							elements: mockElements,
							settings: undefined,
						},
					],
				} )
			);
		} );

		it( 'should include archived components in archived array', async () => {
			// Arrange
			__dispatch( slice.actions.add( { id: ARCHIVED_COMPONENT_ID, uid: 'uid-1', name: 'Component' } ) );
			__dispatch( slice.actions.archive( ARCHIVED_COMPONENT_ID ) );

			// Act
			await syncComponentsBeforeSave( { elements: [], status: 'publish' } );

			// Assert
			expect( mockSync ).toHaveBeenCalledWith(
				expect.objectContaining( {
					archived: [ ARCHIVED_COMPONENT_ID ],
				} )
			);
		} );

		it( 'should include renamed components in renamed array', async () => {
			// Arrange
			__dispatch( slice.actions.add( { id: COMPONENT_ID, uid: 'uid-1', name: 'Old Name' } ) );
			__dispatch( slice.actions.rename( { componentUid: 'uid-1', name: 'New Name' } ) );

			// Act
			await syncComponentsBeforeSave( { elements: [], status: 'publish' } );

			// Assert
			expect( mockSync ).toHaveBeenCalledWith(
				expect.objectContaining( {
					renamed: [ { componentId: COMPONENT_ID, title: 'New Name' } ],
				} )
			);
		} );

		it( 'should include dirty components in published array when status is publish', async () => {
			// Arrange
			const elements: V1ElementData[] = [
				{
					id: '1',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: {
							$$type: 'component-instance',
							value: { component_id: { $$type: 'number', value: DRAFT_COMPONENT_ID } },
						},
					},
				},
			];

			mockGetComponentIds.mockResolvedValue( [ DRAFT_COMPONENT_ID ] );
			mockGetComponentDocumentData.mockResolvedValue( {
				id: DRAFT_COMPONENT_ID,
				status: { value: 'draft' },
				revisions: { current_id: 9000 },
			} as Document );

			// Act
			await syncComponentsBeforeSave( { elements, status: 'publish' } );

			// Assert
			expect( mockSync ).toHaveBeenCalledWith(
				expect.objectContaining( {
					published: [ DRAFT_COMPONENT_ID ],
				} )
			);
		} );

		it( 'should send empty published array when status is draft or autosave', async () => {
			// Arrange
			mockGetComponentIds.mockResolvedValue( [ DRAFT_COMPONENT_ID ] );

			// Act
			await syncComponentsBeforeSave( { elements: [], status: 'draft' } );

			// Assert
			expect( mockSync ).toHaveBeenCalledWith(
				expect.objectContaining( {
					published: [],
				} )
			);
		} );
	} );
} );
