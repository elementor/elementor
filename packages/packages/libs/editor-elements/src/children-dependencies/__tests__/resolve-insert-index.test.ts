import { type V1ElementData } from '../../sync/types';
import { resolveInsertIndex } from '../resolve-insert-index';

const elements: V1ElementData[] = [
	{ elType: 'a' } as V1ElementData,
	{ elType: 'b' } as V1ElementData,
	{ elType: 'c' } as V1ElementData,
];

describe( 'resolveInsertIndex', () => {
	it( 'returns 0 for "first"', () => {
		expect( resolveInsertIndex( { kind: 'first', value: null }, elements ) ).toBe( 0 );
	} );

	it( 'returns elements.length for "last"', () => {
		expect( resolveInsertIndex( { kind: 'last', value: null }, elements ) ).toBe( 3 );
	} );

	it( 'clamps "index" to [0, elements.length]', () => {
		expect( resolveInsertIndex( { kind: 'index', value: 1 }, elements ) ).toBe( 1 );
		expect( resolveInsertIndex( { kind: 'index', value: -5 }, elements ) ).toBe( 0 );
		expect( resolveInsertIndex( { kind: 'index', value: 99 }, elements ) ).toBe( 3 );
	} );

	it( 'returns anchor + 1 for "after_type" when anchor exists', () => {
		expect( resolveInsertIndex( { kind: 'after_type', value: 'b' }, elements ) ).toBe( 2 );
	} );

	it( 'falls back to "last" for "after_type" when anchor is missing', () => {
		expect( resolveInsertIndex( { kind: 'after_type', value: 'z' }, elements ) ).toBe( 3 );
	} );

	it( 'returns anchor index for "before_type" when anchor exists', () => {
		expect( resolveInsertIndex( { kind: 'before_type', value: 'b' }, elements ) ).toBe( 1 );
	} );

	it( 'falls back to "last" for "before_type" when anchor is missing', () => {
		expect( resolveInsertIndex( { kind: 'before_type', value: 'z' }, elements ) ).toBe( 3 );
	} );
} );
