import { type StyleDefinition } from '@elementor/editor-styles';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { componentsStylesProvider } from '../components-styles-provider';
import { slice } from '../store';

describe( 'componentsStylesProvider', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	it( 'should retrieve all components styles', () => {
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

		dispatch(
			slice.actions.load( {
				preview: items,
				frontend: items,
			} )
		);

		// Act.
		const componentStyles = componentsStylesProvider.actions.all();

		// Assert.
		expect( componentStyles ).toStrictEqual( Object.values( items ) );
	} );

	it( 'should retrieve a component style by id', () => {
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

		dispatch(
			slice.actions.load( {
				preview: items,
				frontend: items,
			} )
		);

		// Act.
		const style = componentsStylesProvider.actions.get( 'style-1' );

		// Assert.
		expect( style ).toStrictEqual( items[ 'style-1' ] );
	} );
} );
