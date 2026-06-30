import { createMockPropType } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropType } from '@elementor/editor-props';
import { renderHook } from '@testing-library/react';

import { getAtomicDynamicTags } from '../../sync/get-atomic-dynamic-tags';
import { type DynamicTag, type DynamicTags } from '../../types';
import { usePropDynamicTags } from '../use-prop-dynamic-tags';

jest.mock( '@elementor/editor-controls' );
jest.mock( '../../../contexts/element-context' );
jest.mock( '../../sync/get-atomic-dynamic-tags' );

describe( 'usePropDynamicTags', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return an empty array when there is no dynamic tags config', () => {
		// Arrange.
		jest.mocked( getAtomicDynamicTags ).mockReturnValue( null );
		mockPropType( { kind: 'plain', key: 'string' } );

		// Act.
		const { result } = renderHook( usePropDynamicTags );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should return an empty array when the prop schema is not found', () => {
		// Arrange.
		// @ts-expect-error - passing null for testing purposes.
		mockPropType( null );

		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags: mockAtomicDynamicTags( [ { categories: [ 'string' ], name: 'only-string', group: 'group1' } ] ),
			groups: { group1: { title: 'Group 1' } },
		} );

		// Act.
		const { result } = renderHook( () => usePropDynamicTags() );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should return an empty array when the additional_types list is empty', () => {
		// Arrange
		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags: mockAtomicDynamicTags( [ { categories: [ 'string' ], name: 'only-string', group: 'group1' } ] ),
			groups: { group1: { title: 'Group 1' } },
		} );

		mockPropType( { kind: 'plain', key: 'string' } );

		// Act.
		const { result } = renderHook( usePropDynamicTags );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should return an array of dynamic tags that match the tag categories', () => {
		// Arrange
		const tags = mockAtomicDynamicTags( [
			{ categories: [ 'url' ], name: 'only-url', group: 'group1' },
			{ categories: [ 'string' ], name: 'only-string', group: 'group1' },
			{ categories: [ 'url', 'string' ], name: 'url-and-string', group: 'group1' },
			{ categories: [ 'number' ], name: 'only-number', group: 'group2' },
		] );

		mockPropType( {
			kind: 'union',
			prop_types: {
				string: createMockPropType( { kind: 'plain', key: 'string' } ),
				dynamic: createMockPropType( {
					kind: 'plain',
					key: 'dynamic',
					settings: { categories: [ 'url', 'string' ] },
				} ),
			},
		} );

		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags,
			groups: { group1: { title: 'Group 1' }, group2: { title: 'Group 2' } },
		} );

		// Act.
		const { result, rerender } = renderHook( usePropDynamicTags );

		// Assert.
		expect( result.current ).toEqual( [ tags[ 'only-url' ], tags[ 'only-string' ], tags[ 'url-and-string' ] ] );

		// Arrange.
		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags,
			groups: { group1: { title: 'Group 1' }, group2: { title: 'Group 2' } },
		} );

		mockPropType( {
			kind: 'union',
			prop_types: {
				number: createMockPropType( { kind: 'plain', key: 'number' } ),
				dynamic: createMockPropType( {
					kind: 'plain',
					key: 'dynamic',
					settings: { categories: [ 'number' ] },
				} ),
			},
		} );

		// Act.
		rerender( { propName: 'size' } );

		// Assert.
		expect( result.current ).toEqual( [ tags[ 'only-number' ] ] );
	} );

	it( 'should return an empty array when there are no matching dynamic tags', () => {
		// Arrange

		mockPropType( {
			kind: 'union',
			prop_types: {
				string: createMockPropType( { key: 'string' } ),
				dynamic: createMockPropType( { key: 'dynamic', settings: { categories: [ 'unmatched-type' ] } } ),
			},
		} );

		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags: mockAtomicDynamicTags( [ { categories: [ 'string' ], name: 'only-string', group: 'group1' } ] ),
			groups: { group1: { title: 'Group 1' } },
		} );

		// Act.
		const { result } = renderHook( usePropDynamicTags );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should sort tags by group key order first, then by tag insertion order within each group', () => {
		// Arrange
		const tags = mockAtomicDynamicTags( [
			{ categories: [ 'string' ], name: 'group3-tag2', group: 'group3' },
			{ categories: [ 'string' ], name: 'group1-tag1', group: 'group1' },
			{ categories: [ 'string' ], name: 'group2-tag1', group: 'group2' },
			{ categories: [ 'string' ], name: 'group1-tag2', group: 'group1' },
			{ categories: [ 'string' ], name: 'group3-tag1', group: 'group3' },
			{ categories: [ 'string' ], name: 'group2-tag2', group: 'group2' },
		] );

		mockPropType( {
			kind: 'union',
			prop_types: {
				string: createMockPropType( { kind: 'plain', key: 'string' } ),
				dynamic: createMockPropType( {
					kind: 'plain',
					key: 'dynamic',
					settings: { categories: [ 'string' ] },
				} ),
			},
		} );

		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags,
			groups: {
				group1: { title: 'Group 1' },
				group2: { title: 'Group 2' },
				group3: { title: 'Group 3' },
			},
		} );

		// Act.
		const { result } = renderHook( usePropDynamicTags );

		// Assert.
		expect( result.current ).toEqual( [
			tags[ 'group1-tag1' ],
			tags[ 'group1-tag2' ],
			tags[ 'group2-tag1' ],
			tags[ 'group2-tag2' ],
			tags[ 'group3-tag2' ],
			tags[ 'group3-tag1' ],
		] );
	} );

	it( 'should not break sort order when data is already sorted', () => {
		// Arrange
		const tags = mockAtomicDynamicTags( [
			{ categories: [ 'string' ], name: 'group1-tag1', group: 'group1' },
			{ categories: [ 'string' ], name: 'group1-tag2', group: 'group1' },
			{ categories: [ 'string' ], name: 'group2-tag1', group: 'group2' },
			{ categories: [ 'string' ], name: 'group2-tag2', group: 'group2' },
			{ categories: [ 'string' ], name: 'group3-tag1', group: 'group3' },
			{ categories: [ 'string' ], name: 'group3-tag2', group: 'group3' },
		] );

		mockPropType( {
			kind: 'union',
			prop_types: {
				string: createMockPropType( { kind: 'plain', key: 'string' } ),
				dynamic: createMockPropType( {
					kind: 'plain',
					key: 'dynamic',
					settings: { categories: [ 'string' ] },
				} ),
			},
		} );

		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			tags,
			groups: {
				group1: { title: 'Group 1' },
				group2: { title: 'Group 2' },
				group3: { title: 'Group 3' },
			},
		} );

		// Act.
		const { result } = renderHook( usePropDynamicTags );

		// Assert.
		expect( result.current ).toEqual( [
			tags[ 'group1-tag1' ],
			tags[ 'group1-tag2' ],
			tags[ 'group2-tag1' ],
			tags[ 'group2-tag2' ],
			tags[ 'group3-tag1' ],
			tags[ 'group3-tag2' ],
		] );
	} );
} );

const mockPropType = ( params: Partial< PropType > ) => {
	const propType = params && createMockPropType( params as never );

	jest.mocked( useBoundProp ).mockReturnValue( {
		propType,
		value: null,
		setValue: jest.fn(),
		bind: 'title',
		path: [],
		restoreValue: jest.fn(),
		resetValue: jest.fn(),
	} );
};

const mockAtomicDynamicTags = ( tags: Pick< DynamicTag, 'name' | 'categories' | 'group' >[] ) => {
	return tags.reduce< DynamicTags >(
		( acc, { name, categories, group } ) => ( {
			...acc,
			[ name ]: {
				name,
				group,
				categories,
				label: '',
				atomic_controls: [],
				props_schema: {},
			},
		} ),
		{}
	);
};
