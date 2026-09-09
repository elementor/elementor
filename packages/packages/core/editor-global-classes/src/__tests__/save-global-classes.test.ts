import { createMockStyleDefinition } from 'test-utils';
import { getCurrentDocument } from '@elementor/editor-documents';
import { getCurrentUser } from '@elementor/editor-current-user';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { apiClient, isConflictError } from '../api';
import { selectVersion } from '../store';
import { UPDATE_CLASS_CAPABILITY_KEY } from '../capabilities';
import { saveGlobalClasses } from '../save-global-classes';
import { slice } from '../store';

// Keep the real guards/helpers so a 409 error still routes into the retry path;
// only the HTTP client (apiClient) is mocked.
jest.mock( '../api', () => {
	const actual = jest.requireActual( '../api' );

	return {
		__esModule: true,
		API_ERROR_CODES: actual.API_ERROR_CODES,
		isConflictError: actual.isConflictError,
		apiClient: {
			all: jest.fn(),
			getByIds: jest.fn(),
			getStylesForPost: jest.fn(),
			publish: jest.fn(),
			saveDraft: jest.fn(),
		},
	};
} );
jest.mock( '@elementor/editor-current-user' );
jest.mock( '@elementor/editor-documents' );

const classLabelsFor = ( order: string[], items: Record< string, ReturnType< typeof createMockStyleDefinition > > ) =>
	Object.fromEntries( order.map( ( id ) => [ id, items[ id ]?.label ?? id ] ) );

describe( 'saveGlobalClasses', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();

		jest.mocked( getCurrentUser ).mockReturnValue( {
			capabilities: [ UPDATE_CLASS_CAPABILITY_KEY ],
		} as never );

		jest.mocked( apiClient.publish ).mockResolvedValue( {} as never );
		jest.mocked( apiClient.saveDraft ).mockResolvedValue( {} as never );

		jest.mocked( getCurrentDocument ).mockReturnValue( { id: 123 } as never );
	} );

	it( 'should not mark lazily loaded classes as added', async () => {
		// Arrange
		const initialClass = createMockStyleDefinition( { id: 'initial-class' } );
		const lazyLoadedClass = createMockStyleDefinition( { id: 'lazy-class' } );
		const order = [ 'initial-class', 'lazy-class' ];

		dispatch(
			slice.actions.load( {
				frontend: { items: { 'initial-class': initialClass }, order },
				preview: { items: { 'initial-class': initialClass }, order },
				classLabels: classLabelsFor( order, {
					'initial-class': initialClass,
					'lazy-class': lazyLoadedClass,
				} ),
			} )
		);

		dispatch(
			slice.actions.mergeExistingClasses( {
				preview: { 'lazy-class': lazyLoadedClass },
				frontend: { 'lazy-class': lazyLoadedClass },
			} )
		);

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert
		expect( apiClient.publish ).toHaveBeenCalledWith( {
			items: {},
			order,
			changes: {
				added: [],
				deleted: [],
				modified: [],
				order: false,
			},
			version: 0,
		} );
	} );

	it( 'should correctly mark newly created classes as added', async () => {
		// Arrange
		const initialClass = createMockStyleDefinition( { id: 'initial-class' } );
		const newClass = createMockStyleDefinition( { id: 'new-class' } );

		dispatch(
			slice.actions.load( {
				frontend: { items: { 'initial-class': initialClass }, order: [ 'initial-class' ] },
				preview: { items: { 'initial-class': initialClass }, order: [ 'initial-class' ] },
				classLabels: classLabelsFor( [ 'initial-class' ], { 'initial-class': initialClass } ),
			} )
		);

		dispatch( slice.actions.add( newClass ) );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert
		expect( apiClient.publish ).toHaveBeenCalledWith( {
			items: { 'new-class': newClass },
			order: [ 'new-class', 'initial-class' ],
			changes: {
				added: [ 'new-class' ],
				deleted: [],
				modified: [],
				order: true,
			},
			version: 0,
		} );
	} );

	it( 'should correctly detect modified classes', async () => {
		// Arrange
		const originalClass = createMockStyleDefinition( { id: 'class-1', label: 'Original' } );

		dispatch(
			slice.actions.load( {
				frontend: { items: { 'class-1': originalClass }, order: [ 'class-1' ] },
				preview: { items: { 'class-1': originalClass }, order: [ 'class-1' ] },
				classLabels: classLabelsFor( [ 'class-1' ], { 'class-1': originalClass } ),
			} )
		);

		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Modified' } } ) );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert
		expect( apiClient.publish ).toHaveBeenCalledWith(
			expect.objectContaining( {
				changes: {
					added: [],
					deleted: [],
					modified: [ 'class-1' ],
					order: false,
				},
			} )
		);
	} );

	it( 'should handle mixed scenario: lazy load + create + modify', async () => {
		// Arrange
		const initialClass = createMockStyleDefinition( { id: 'initial' } );
		const lazyClass = createMockStyleDefinition( { id: 'lazy' } );
		const createdClass = createMockStyleDefinition( { id: 'created' } );
		const orderBeforeCreate = [ 'initial', 'lazy' ];

		dispatch(
			slice.actions.load( {
				frontend: { items: { initial: initialClass }, order: orderBeforeCreate },
				preview: { items: { initial: initialClass }, order: orderBeforeCreate },
				classLabels: classLabelsFor( orderBeforeCreate, { initial: initialClass, lazy: lazyClass } ),
			} )
		);

		dispatch(
			slice.actions.mergeExistingClasses( {
				preview: { lazy: lazyClass },
				frontend: { lazy: lazyClass },
			} )
		);

		dispatch( slice.actions.add( createdClass ) );

		dispatch( slice.actions.update( { style: { id: 'initial', label: 'Modified Initial' } } ) );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert
		expect( apiClient.publish ).toHaveBeenCalledWith(
			expect.objectContaining( {
				changes: {
					added: [ 'created' ],
					deleted: [],
					modified: [ 'initial' ],
					order: true,
				},
			} )
		);
	} );

	it( 'should rebase, update the version and retry once when the server rejects with a conflict', async () => {
		// Arrange
		const staleClass = createMockStyleDefinition( { id: 'class-1', label: 'Stale' } );
		const freshClass = createMockStyleDefinition( { id: 'class-1', label: 'Fresh' } );
		const order = [ 'class-1' ];
		const freshVersion = 7;

		const freshIndex = {
			data: {
				data: [ { id: 'class-1', label: 'Fresh' } ],
				meta: { version: freshVersion },
			},
		} as never;

		const freshStyles = {
			data: {
				data: { 'class-1': freshClass },
				meta: { order },
			},
		} as never;

		jest.mocked( apiClient.publish )
			.mockRejectedValueOnce( { response: { status: 409 } } as never )
			.mockResolvedValueOnce( {} as never );

		jest.mocked( apiClient.all ).mockResolvedValue( freshIndex );
		jest.mocked( apiClient.getStylesForPost ).mockResolvedValue( freshStyles );

		dispatch(
			slice.actions.load( {
				frontend: { items: { 'class-1': staleClass }, order },
				preview: { items: { 'class-1': staleClass }, order },
				classLabels: classLabelsFor( order, { 'class-1': staleClass } ),
				version: { frontend: 3, preview: 3 },
			} )
		);

		const conflictSpy = jest.spyOn( window, 'dispatchEvent' );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert - two publish attempts, rebased onto the fresh version.
		expect( apiClient.publish ).toHaveBeenCalledTimes( 2 );
		expect( apiClient.publish ).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining( { version: freshVersion } )
		);
		expect( selectVersion( getState(), 'frontend' ) ).toBe( freshVersion );

		// The conflict was announced so the UI can surface a non-blocking notice.
		expect( conflictSpy ).toHaveBeenCalledWith( expect.objectContaining( { type: 'classes:conflict' } ) );
	} );
} );
