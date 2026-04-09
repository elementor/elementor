import { createMockStyleDefinition } from 'test-utils';
import { getCurrentUser } from '@elementor/editor-current-user';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { apiClient } from '../api';
import { UPDATE_CLASS_CAPABILITY_KEY } from '../capabilities';
import { saveGlobalClasses } from '../save-global-classes';
import { slice } from '../store';

jest.mock( '../api' );
jest.mock( '@elementor/editor-current-user' );

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

		dispatch( slice.actions.mergeExistingClasses( { items: { 'lazy-class': lazyLoadedClass } } ) );

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
			},
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
			},
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

		dispatch( slice.actions.mergeExistingClasses( { items: { lazy: lazyClass } } ) );

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
				},
			} )
		);
	} );
} );
