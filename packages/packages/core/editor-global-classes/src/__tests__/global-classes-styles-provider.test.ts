import { type StyleDefinition } from '@elementor/editor-styles';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { GlobalClassNotFoundError } from '../errors';
import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { type GlobalClasses, slice } from '../store';

describe( 'globalClassesStylesProvider', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	it( 'should retrieve all global classes', () => {
		// Arrange.
		const items: Record< string, StyleDefinition > = {
			'style-1': {
				id: 'style-1',
				label: 'Style 1',
				variants: [],
				type: 'class',
			},
			'style-2': {
				id: 'style-2',
				label: 'Style 2',
				variants: [],
				type: 'class',
			},
		};

		const data = {
			items,
			order: [ 'style-1', 'style-2' ],
		};

		dispatch(
			slice.actions.load( {
				preview: data,
				frontend: data,
			} )
		);

		// Act.
		const globalClasses = globalClassesStylesProvider.actions.all();

		// Assert.
		expect( globalClasses ).toStrictEqual( Object.values( items ) );
	} );

	it( 'should retrieve a global class by id', () => {
		// Arrange.
		const items: Record< string, StyleDefinition > = {
			'style-1': {
				id: 'style-1',
				label: 'Style 1',
				variants: [],
				type: 'class',
			},
			'style-2': {
				id: 'style-2',
				label: 'Style 2',
				variants: [],
				type: 'class',
			},
		};

		const data = {
			items,
			order: [ 'style-1', 'style-2' ],
		};

		dispatch(
			slice.actions.load( {
				preview: data,
				frontend: data,
			} )
		);

		// Act.
		const globalClass = globalClassesStylesProvider.actions.get( 'style-1' );

		// Assert.
		expect( globalClass ).toStrictEqual( items[ 'style-1' ] );
	} );

	it( 'should create a new global class with the highest priority', () => {
		// Arrange.
		const existingClass: StyleDefinition = {
			id: 'g-123',
			type: 'class',
			label: 'Existing class',
			variants: [],
		};

		const data = {
			items: {
				[ existingClass.id ]: existingClass,
			},
			order: [ existingClass.id ],
		};

		dispatch(
			slice.actions.load( {
				preview: data,
				frontend: data,
			} )
		);

		// Act.
		const createdId = globalClassesStylesProvider.actions?.create?.( 'Test label' );

		// Assert.
		const globalClasses = globalClassesStylesProvider.actions.all();

		expect( createdId ).toMatch( /^g-[a-z0-9]{7}$/ );

		expect( globalClasses ).toStrictEqual( [
			{
				id: createdId,
				type: 'class',
				label: 'Test label',
				variants: [],
			},
			existingClass,
		] );
	} );

	it( 'should throw when trying to update a non-existing global class', () => {
		// Arrange.
		const data: GlobalClasses = {
			items: {
				'style-1': {
					id: 'style-1',
					label: 'Style 1',
					variants: [],
					type: 'class',
				},
			},
			order: [],
		};

		dispatch(
			slice.actions.load( {
				preview: data,
				frontend: data,
			} )
		);

		// Act & Assert.
		expect(
			() =>
				globalClassesStylesProvider.actions?.updateProps?.( {
					id: 'non-existing-id',
					meta: { state: null, breakpoint: null },
					props: {
						prop: 'value',
					},
				} )
		).toThrow( new GlobalClassNotFoundError() );
	} );
} );
