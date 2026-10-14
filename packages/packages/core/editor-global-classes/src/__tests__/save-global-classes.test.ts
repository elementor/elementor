import { createMockStyleDefinition } from 'test-utils';
import { getCurrentUser } from '@elementor/editor-current-user';
import { getCurrentDocument } from '@elementor/editor-documents';
import { notify } from '@elementor/editor-notifications';
import { openDialog } from '@elementor/editor-ui';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { apiClient } from '../api';
import { UPDATE_CLASS_CAPABILITY_KEY } from '../capabilities';
import { saveGlobalClasses } from '../save-global-classes';
import { selectClassLabels, selectData, selectFrontendInitialData, selectVersion, slice } from '../store';

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
jest.mock( '@elementor/editor-notifications' );
jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	openDialog: jest.fn(),
} ) );
jest.mock( '../utils/tracking' );

const classLabelsFor = ( order: string[], items: Record< string, ReturnType< typeof createMockStyleDefinition > > ) =>
	Object.fromEntries( order.map( ( id ) => [ id, items[ id ]?.label ?? id ] ) );

describe( 'saveGlobalClasses', () => {
	beforeEach( () => {
		jest.resetAllMocks();

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

	it( 'should send the version the server advanced to on consecutive saves', async () => {
		// Arrange
		const originalClass = createMockStyleDefinition( { id: 'class-1', label: 'Original' } );

		loadClasses( [ originalClass ], 4 );

		// Act
		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'First' } } ) );
		await saveGlobalClasses( { context: 'frontend' } );

		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Second' } } ) );
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert - no conflict round trip, each save carries the version the previous one produced.
		expect( apiClient.publish ).toHaveBeenCalledTimes( 2 );
		expect( apiClient.publish ).toHaveBeenNthCalledWith( 1, expect.objectContaining( { version: 4 } ) );
		expect( apiClient.publish ).toHaveBeenNthCalledWith( 2, expect.objectContaining( { version: 5 } ) );
		expect( apiClient.all ).not.toHaveBeenCalled();
		expect( selectVersion( getState() ) ).toBe( 6 );
	} );

	it( 'should share one version between draft and publish saves', async () => {
		// Arrange
		loadClasses( [ createMockStyleDefinition( { id: 'class-1', label: 'Original' } ) ], 2 );

		// Act
		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Draft' } } ) );
		await saveGlobalClasses( { context: 'preview' } );

		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Published' } } ) );
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert
		expect( apiClient.saveDraft ).toHaveBeenCalledWith( expect.objectContaining( { version: 2 } ) );
		expect( apiClient.publish ).toHaveBeenCalledWith( expect.objectContaining( { version: 3 } ) );
		expect( apiClient.all ).not.toHaveBeenCalled();
	} );

	it( 'should rebase onto the server state, keep the unsaved edits and retry once on a conflict', async () => {
		// Arrange
		const original = createMockStyleDefinition( { id: 'class-1', label: 'Original' } );
		const serverClass1 = createMockStyleDefinition( { id: 'class-1', label: 'Server' } );
		const serverClass3 = createMockStyleDefinition( { id: 'class-3', label: 'Added elsewhere' } );
		const newClass = createMockStyleDefinition( { id: 'class-2', label: 'Mine' } );

		loadClasses( [ original ], 3 );

		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Edited' } } ) );
		dispatch( slice.actions.add( newClass ) );

		mockServerState( {
			version: 7,
			items: { 'class-1': serverClass1, 'class-3': serverClass3 },
			order: [ 'class-1', 'class-3' ],
		} );

		jest.mocked( apiClient.publish )
			.mockRejectedValueOnce( { response: { status: 409 } } as never )
			.mockResolvedValueOnce( {} as never );

		const conflictListener = jest.fn();
		window.addEventListener( 'classes:conflict', conflictListener );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		window.removeEventListener( 'classes:conflict', conflictListener );

		// Assert - the retry saves exactly the unsaved edits, on top of the fresh server order and version.
		expect( apiClient.publish ).toHaveBeenCalledTimes( 2 );
		expect( apiClient.publish ).toHaveBeenNthCalledWith( 2, {
			items: {
				'class-1': expect.objectContaining( { id: 'class-1', label: 'Edited' } ),
				'class-2': newClass,
			},
			order: [ 'class-2', 'class-1', 'class-3' ],
			changes: {
				added: [ 'class-2' ],
				deleted: [],
				modified: [ 'class-1' ],
				order: true,
			},
			version: 7,
		} );
		expect( selectVersion( getState() ) ).toBe( 8 );
		expect( selectData( getState() ).items ).toHaveProperty( 'class-3' );
		expect( selectClassLabels( getState() ) ).toEqual( {
			'class-1': 'Edited',
			'class-2': 'Mine',
			'class-3': 'Added elsewhere',
		} );
		expect( conflictListener ).toHaveBeenCalledTimes( 1 );
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should not bring back a stale snapshot on undo after a draft save was rebased', async () => {
		// Arrange
		loadClasses( [ createMockStyleDefinition( { id: 'class-1', label: 'Original' } ) ], 3 );
		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Edited' } } ) );

		mockServerState( {
			version: 5,
			items: { 'class-1': createMockStyleDefinition( { id: 'class-1', label: 'Original' } ) },
			order: [ 'class-3', 'class-1' ],
		} );

		jest.mocked( apiClient.saveDraft )
			.mockRejectedValueOnce( { response: { status: 409 } } as never )
			.mockResolvedValueOnce( {} as never );

		// Act
		await saveGlobalClasses( { context: 'preview' } );
		dispatch( slice.actions.undo() );

		// Assert - the class another session added is still there.
		expect( selectData( getState() ).order ).toContain( 'class-3' );
	} );

	it( 'should refresh the version on a conflict even when there is no current document', async () => {
		// Arrange
		jest.mocked( getCurrentDocument ).mockReturnValue( null as never );

		loadClasses( [ createMockStyleDefinition( { id: 'class-1' } ) ], 3 );
		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Edited' } } ) );

		mockServerState( { version: 9, items: {}, order: [ 'class-1' ] } );

		jest.mocked( apiClient.publish )
			.mockRejectedValueOnce( { response: { status: 409 } } as never )
			.mockResolvedValueOnce( {} as never );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert
		expect( apiClient.getStylesForPost ).not.toHaveBeenCalled();
		expect( apiClient.publish ).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining( {
				version: 9,
				changes: expect.objectContaining( { modified: [ 'class-1' ] } ),
			} )
		);
	} );

	it( 'should notify the user and throw when the retry conflicts again', async () => {
		// Arrange
		loadClasses( [ createMockStyleDefinition( { id: 'class-1' } ) ], 3 );
		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Edited' } } ) );

		mockServerState( { version: 4, items: {}, order: [ 'class-1' ] } );

		const conflict = { response: { status: 409 } };
		jest.mocked( apiClient.publish ).mockRejectedValue( conflict as never );

		// Act & Assert
		await expect( saveGlobalClasses( { context: 'frontend' } ) ).rejects.toBe( conflict );

		expect( apiClient.publish ).toHaveBeenCalledTimes( 2 );
		expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { type: 'error' } ) );
	} );

	it( 'should not retry or notify when the save fails for another reason', async () => {
		// Arrange
		loadClasses( [ createMockStyleDefinition( { id: 'class-1' } ) ], 3 );
		dispatch( slice.actions.update( { style: { id: 'class-1', label: 'Edited' } } ) );

		const failure = { response: { status: 500 } };
		jest.mocked( apiClient.publish ).mockRejectedValue( failure as never );

		// Act & Assert
		await expect( saveGlobalClasses( { context: 'frontend' } ) ).rejects.toBe( failure );

		expect( apiClient.publish ).toHaveBeenCalledTimes( 1 );
		expect( apiClient.all ).not.toHaveBeenCalled();
		expect( notify ).not.toHaveBeenCalled();
	} );

	it( 'should reset the baseline and the version when the server renames duplicated labels', async () => {
		// Arrange
		const newClass = createMockStyleDefinition( { id: 'class-2', label: 'Duplicate' } );

		loadClasses( [ createMockStyleDefinition( { id: 'class-1', label: 'Duplicate' } ) ], 3 );
		dispatch( slice.actions.add( newClass ) );

		jest.mocked( apiClient.publish ).mockResolvedValue( {
			data: {
				data: {
					code: 'DUPLICATED_LABEL',
					modifiedLabels: { 'class-2': { original: 'Duplicate', modified: 'Duplicate-1' } },
				},
			},
		} as never );

		// Act
		await saveGlobalClasses( { context: 'frontend' } );

		// Assert - the committed class is part of the baseline, so the next save does not send it again.
		expect( selectFrontendInitialData( getState() ).items ).toHaveProperty( 'class-2' );
		expect( selectData( getState() ).items[ 'class-2' ].label ).toBe( 'Duplicate-1' );
		expect( selectVersion( getState() ) ).toBe( 4 );
		expect( openDialog ).toHaveBeenCalledTimes( 1 );
	} );

	function loadClasses( classes: ReturnType< typeof createMockStyleDefinition >[], version: number ) {
		const order = classes.map( ( { id } ) => id );
		const items = Object.fromEntries( classes.map( ( item ) => [ item.id, item ] ) );

		dispatch(
			slice.actions.load( {
				frontend: { items, order },
				preview: { items, order },
				classLabels: classLabelsFor( order, items ),
				version,
			} )
		);
	}

	function mockServerState( {
		version,
		items,
		order,
	}: {
		version: number;
		items: Record< string, ReturnType< typeof createMockStyleDefinition > >;
		order: string[];
	} ) {
		jest.mocked( apiClient.all ).mockResolvedValue( {
			data: {
				data: order.map( ( id ) => ( { id, label: items[ id ]?.label ?? id } ) ),
				meta: { version },
			},
		} as never );

		jest.mocked( apiClient.getStylesForPost ).mockResolvedValue( {
			data: { data: items, meta: { order } },
		} as never );
	}
} );
